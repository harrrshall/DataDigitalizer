const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const sharp = require('sharp');
const NodeCache = require('node-cache');

const app = express();
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin }));
const upload = multer({ storage: multer.memoryStorage() });

require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./datadigitizer-6db81-firebase-adminsdk-fl0iq-a9ab5e72da.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "datadigitizer-6db81.appspot.com",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const systemInstruction = `You are an image data extraction AI. Follow these instructions precisely:

1. EXTRACT: All text and structured data from the input image.

2. FORMAT for CSV:
   - Use comma (,) as the field delimiter
   - Use newline (\\n) as the record delimiter
   - Enclose fields containing commas, newlines, or double quotes in double quotes
   - Escape any double quotes within fields by doubling them

3. STRUCTURE:
   - First row: Column headers (if applicable)
   - Subsequent rows: Data entries
   - Maintain consistent number of fields per row

4. VERIFY:
   - All data sourced directly from image
   - No inferred or extraneous information
   - Proper CSV formatting
   - Consistent field count across rows

5. OUTPUT:
   - ONLY the CSV-formatted data
   - Each row on a new line
   - No additional text or explanations

6. IF ERROR: Output ONLY "ERROR" if image is not in that format nothing else`;

const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
const proModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction });

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15, // 15 requests per minute
    message: 'Too many requests, please try again later.',
});

app.use(limiter);

let currentModel = 'flash';
let flashRequestCount = 0;
let proRequestCount = 0;

// Caching mechanism
const cache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 120 });

app.get('/userHistory', async (req, res) => {
    // console.log('Received request for user history');
    try {
        const idToken = req.get('Authorization')?.split('Bearer ')[1];
        if (!idToken) {
            console.log('No token provided or invalid format');
            return res.status(401).json({ error: 'No token provided or invalid format' });
        }

        // console.log('Verifying ID token');
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        // console.log(`Fetching history for user: ${userId}`);

        const cachedHistory = cache.get(userId);
        if (cachedHistory) {
            // console.log(`Fetched history from cache for user ${userId}`);
            return res.json({ history: cachedHistory });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const processedImagesRef = db.collection('processedImages');
        const query = processedImagesRef
            .where('userId', '==', userId)
            .orderBy('processedAt', 'desc')
            .offset(offset)
            .limit(limit);

        const snapshot = await query.get();

        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            processedAt: doc.data().processedAt.toDate().toISOString()
        }));

        cache.set(userId, history);

        // console.log(`Fetched ${history.length} history items for user ${userId}`);
        res.json({ history });
    } catch (error) {
        console.error('Error fetching user history:', error);
        if (error.code === 'auth/argument-error') {
            return res.status(401).json({ error: 'Invalid authentication token' });
        }
        // Check if the error is due to missing index
        if (error.code === 9 && error.details.includes('The query requires an index')) {
            return res.status(500).json({ 
                error: 'The database is not yet ready. Please try again in a few minutes.',
                details: 'Index creation in progress'
            });
        }
        res.status(500).json({ error: 'An error occurred while fetching user history' });
    }
});

app.post('/processImage', upload.single('image'), async (req, res) => {
    const startTime = Date.now(); // Start the timer
    // console.log('Received image processing request');
    try {
        // Verify Firebase ID token
        const idToken = req.get('Authorization')?.split('Bearer ')[1];
        if (!idToken) {
            console.log('No token provided or invalid format');
            return res.status(401).json({ error: 'No token provided or invalid format' });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        // console.log(`Processing request for user: ${userId}`);

        // Check if the user has sufficient credits
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log(`User document does not exist for userId: ${userId}`);
            return res.status(404).json({ error: 'User document does not exist' });
        }

        const userData = userDoc.data();
        const currentCredits = userData.creditsRemaining || 0;

        if (currentCredits <= 0) {
            console.log(`Insufficient credits for userId: ${userId}. Current credits: ${currentCredits}`);
            return res.status(403).json({ error: 'You do not have enough credits to process this image.' });
        }

        // Check if the request contains a file
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const fileName = `${userId}/${uuidv4()}_${file.originalname}`;
        const fileBuffer = await sharp(file.buffer).resize(800).toBuffer(); // Compress image

        // Upload file to Firebase Storage
        const fileUpload = bucket.file(fileName);
        await fileUpload.save(fileBuffer, {
            metadata: {
                contentType: file.mimetype,
            }
        });
        // console.log(`File uploaded to Firebase Storage: ${fileName}`);

        // Get the download URL
        const [downloadURL] = await fileUpload.getSignedUrl({
            action: 'read',
            expires: Date.now() + 3600 * 1000, // 1 hour
        });

        // Process the image with Gemini API
        // console.log('Processing image with Gemini API');
        const result = await processImageWithGemini(downloadURL);

        // Check if the result is an error
        if (result.trim().toUpperCase() === 'ERROR') {
            console.log('Error processing image data');
            return res.status(400).json({ error: 'Error processing image data' });
        }

        // Save CSV content to Firebase Storage
        const csvFileName = `${userId}/${uuidv4()}_results.csv`;
        const csvFileUpload = bucket.file(csvFileName);
        await csvFileUpload.save(result, {
            metadata: {
                contentType: 'text/csv',
            }
        });
        // console.log(`CSV file saved to Firebase Storage: ${csvFileName}`);

        // Get the CSV download URL
        const [csvDownloadURL] = await csvFileUpload.getSignedUrl({
            action: 'read',
            expires: Date.now() + 3600 * 1000, // 1 hour
        });

        // Update user's credits and document count
        // console.log('Updating user credits and document count');
        const updatedData = await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                console.log(`User document does not exist for userId: ${userId}`);
                throw new Error('User document does not exist');
            }

            const userData = userDoc.data();
            console.log(`Before update - Credits: ${userData.creditsRemaining}, Documents: ${userData.totalDocuments}, Pages: ${userData.pagesDigitized}`);

            const newCredits = (userData.creditsRemaining || 0) - 1;
            const newTotalDocuments = (userData.totalDocuments || 0) + 1;
            const newPagesDigitized = (userData.pagesDigitized || 0) + 1;

            if (newCredits < 0) {
                console.log(`Insufficient credits for userId: ${userId}. Current credits: ${userData.creditsRemaining}`);
                throw new Error('Insufficient credits');
            }

            transaction.update(userRef, {
                creditsRemaining: newCredits,
                totalDocuments: newTotalDocuments,
                pagesDigitized: newPagesDigitized
            });

            console.log(`After update - Credits: ${newCredits}, Documents: ${newTotalDocuments}, Pages: ${newPagesDigitized}`);

            return { newCredits, newTotalDocuments, newPagesDigitized };
        });

        // Save metadata to Firestore
        const docRef = await db.collection("processedImages").add({
            originalFileName: file.originalname,
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            imageDownloadURL: downloadURL,
            csvDownloadURL: csvDownloadURL,
            userId: userId,
            preview: parseCSVPreview(result)
        });
        // console.log(`Metadata saved to Firestore with docId: ${docRef.id}`);

        const endTime = Date.now(); // End the timer
        const totalTime = endTime - startTime;
        console.log(`Total time taken: ${totalTime} ms`);

        // console.log('Sending successful response to client');
        res.json({ 
            docId: docRef.id, 
            preview: parseCSVPreview(result), 
            csvUrl: csvDownloadURL,
            newCredits: updatedData.newCredits,
            newTotalDocuments: updatedData.newTotalDocuments,
            newPagesDigitized: updatedData.newPagesDigitized,
            totalTime: totalTime // Include total time in the response
        });
    } catch (error) {
        console.error('Error processing image:', error);
        let errorMessage = 'An error occurred while processing the image';
        let statusCode = 500;

        if (error.message === 'Insufficient credits') {
            errorMessage = 'You do not have enough credits to process this image.';
            statusCode = 403;
        } else if (error.message.includes("API quota exceeded")) {
            errorMessage = error.message;
            statusCode = 429;
        } else if (error.message.includes("internal server error")) {
            errorMessage = error.message;
            statusCode = 500;
        }

        res.status(statusCode).json({ error: errorMessage });
    }
});

async function processImageWithGemini(imageUrl) {
    let model;
    if (currentModel === 'flash') {
        model = flashModel;
        flashRequestCount++;
        if (flashRequestCount >= 50) {
            currentModel = 'pro';
            flashRequestCount = 0;
        }
    } else {
        model = proModel;
        proRequestCount++;
        if (proRequestCount >= 15) {
            currentModel = 'flash';
            proRequestCount = 0;
        }
    }

    const chatSession = model.startChat({
        generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        },
    });
    
    try {
        console.log(`Processing image with ${currentModel} model`);
        const result = await chatSession.sendMessage(imageUrl);
        return result.response.text();
    } catch (error) {
        console.error(`Error in Gemini API processing: ${error.message}`);
        if (error.status === 429) {
            throw new Error("API quota exceeded. Please try again later or consider upgrading to a premium plan for higher limits.");
        } else if (error.status === 500) {
            throw new Error("An internal server error occurred. Please try again later.");
        } else {
            throw new Error(`Error processing image: ${error.message}`);
        }
    }
}

function parseCSVPreview(csvData) {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
    return preview;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});