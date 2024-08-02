## DataDigitizer: Image Data Extraction API & Web App

This repository houses the backend and frontend code for DataDigitizer, an application designed to extract structured data from images using Google's Gemini AI models.

### Project Structure

```
├── backend
│   └── server.js
└── datadigitizer
    ├── lib
    │   └── authStore.tsx
    └── ... (other files)

```

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/DataDigitizer.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd DataDigitizer
   ```

### Setup and Installation

#### Backend:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Dependencies:**
   ```bash
   npm install express multer firebase-admin @google/generative-ai cors uuid express-rate-limit sharp node-cache dotenv
   ```
3. **Firebase Setup:**
   - Create a Firebase project and enable the following features:
      - Authentication (Email/Password)
      - Firestore Database
      - Cloud Storage
   - Create a service account and download the JSON file (`serviceAccount.json`). Place this file in the `backend` directory.
   - Replace the placeholders in `datadigitizer-6db81-firebase-adminsdk-fl0iq-a9ab5e72da.json` with your actual Firebase project configuration.
4. **Environment Variables:**
   - Create a `.env` file in the `backend` directory.
   - Add the following environment variables:
     ```
     ALLOWED_ORIGIN=http://localhost:3000
     GEMINI_API_KEY=YOUR_GEMINI_API_KEY 
     ```
5. **Run the Server:**
   ```bash
   node server.js
   ```

#### Frontend:

1. **Navigate to the frontend directory:**
   ```bash
   cd ../datadigitizer 
   ```
2. **Dependencies:**
   ```bash
   npm install firebase @firebase/app @firebase/auth zustand
   ```
3. **Firebase Configuration:**
   - Replace the placeholders in `datadigitizer/lib/authStore.tsx` with your actual Firebase project configuration:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
       measurementId: "YOUR_MEASUREMENT_ID"
     };
     ```
4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

### Usage

1. **Authentication:**
   - Navigate to the DataDigitizer web app.
   - Click on "Sign Up" or "Sign In" to create an account or login.
2. **Image Upload:**
   - Upload an image containing structured data.
   - The app will process the image using the Gemini AI API and extract the data.
3. **CSV Download:**
   - Once the processing is complete, you can download the extracted data as a CSV file.
4. **User History:**
   - Access your previous image processing results in the "History" tab.

### API Endpoints

#### `/processImage` (POST)

- **Request Body:**
   - `image`: Base64-encoded image data.
- **Headers:**
   - `Authorization`: Firebase ID token.
- **Response Body:**
   - `docId`: Document ID in Firestore.
   - `preview`: Preview of the extracted CSV data.
   - `csvUrl`: URL to download the extracted CSV data.
   - `newCredits`: Remaining credits after processing the image.
   - `newTotalDocuments`: Total number of documents processed by the user.
   - `newPagesDigitized`: Total number of pages digitized by the user.
   - `totalTime`: Time taken for processing the image in milliseconds.
- **Error Codes:**
   - `400`: Invalid image format or no file uploaded.
   - `401`: Unauthorized or invalid token.
   - `403`: Insufficient credits.
   - `429`: API quota exceeded.
   - `500`: Internal server error.

#### `/userHistory` (GET)

- **Headers:**
   - `Authorization`: Firebase ID token.
- **Query Parameters:**
   - `page`: Page number (optional, default: 1).
   - `limit`: Number of items per page (optional, default: 10).
- **Response Body:**
   - `history`: Array of processed image objects.

### Notes

- **Credits:** Users start with a limited number of free credits for image processing.
- **Gemini AI Models:** The application uses Google's Gemini AI models (flash and pro) to extract data from images.
- **Caching:** The user history is cached for improved performance.
- **Rate Limiting:** The API implements rate limiting to prevent abuse.
- **Error Handling:** The API provides informative error messages and HTTP status codes.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs, feature requests, or improvements.

### License

This project is licensed under the MIT License - 



