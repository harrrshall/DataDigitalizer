## Data Digitizer Backend

This repository contains the backend code for the Data Digitizer application. The backend is built using Node.js with Express, Firebase, and Google Generative AI. It processes image files to extract data and store it as CSV files.

### Project Structure

```
datadigitizer
├── backend
│   └── server.js
└── datadigitizer
    └── ... (Next.js frontend code)

```

### Technologies

* **Node.js**: Server-side JavaScript runtime environment.
* **Express.js**: Web framework for building RESTful APIs.
* **Firebase**: Backend-as-a-service platform for database, authentication, storage, and more.
* **Google Generative AI**: AI service for image data extraction.
* **Multer**: Middleware for handling file uploads.
* **Sharp**: Library for image processing.
* **Node-Cache**: In-memory caching library.
* **cors**: Middleware for enabling Cross-Origin Resource Sharing (CORS).
* **express-rate-limit**: Middleware for rate limiting API requests.

### Setup & Installation

1. **Install Node.js**: Make sure you have Node.js and npm installed on your machine.
2. **Clone the repository**: Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/datadigitizer.git
   ```

3. **Navigate to the backend directory**:

   ```bash
   cd datadigitizer/backend
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Configure environment variables**:

   * Create a `.env` file in the backend directory and add the following environment variables:

     ```
     GEMINI_API_KEY=YOUR_GEMINI_API_KEY
     ALLOWED_ORIGIN=YOUR_ALLOWED_ORIGIN
     ```

   * Replace `YOUR_GEMINI_API_KEY` with your actual Gemini API key.
   * Replace `YOUR_ALLOWED_ORIGIN` with the allowed origin for CORS.

6. **Start the server**:

   ```bash
   npm start
   ```

### API Endpoints

* `/userHistory`: Fetches the user's processing history.
   * **Method**: GET
   * **Authentication**: Requires a valid Firebase ID token in the `Authorization` header.
   * **Query parameters**:
     * `page`: The page number for pagination. Default is 1.
     * `limit`: The number of items per page. Default is 10.
   * **Response**: JSON object containing an array of processed images.

* `/processImage`: Processes an uploaded image.
   * **Method**: POST
   * **Authentication**: Requires a valid Firebase ID token in the `Authorization` header.
   * **Body**: Multipart form data with an `image` field containing the image file.
   * **Response**: JSON object containing the processing results, including:
     * `docId`: The Firestore document ID of the processed image.
     * `preview`: A preview of the extracted data.
     * `csvUrl`: The download URL for the generated CSV file.
     * `newCredits`: The user's remaining credits.
     * `newTotalDocuments`: The user's total number of processed documents.
     * `newPagesDigitized`: The user's total number of digitized pages.
     * `totalTime`: The total time taken for processing.

### Usage

* **Frontend Integration**: The backend API can be used by the Next.js frontend to upload images, process them, and retrieve results.
* **Authentication**: The backend uses Firebase authentication to verify user identities. The frontend should implement Firebase authentication and pass the ID token to the backend API.
* **Credit System**: The backend implements a credit system to track user usage. Each image processing request consumes one credit.

### Notes

* **Rate Limiting**: The backend implements rate limiting to prevent abuse and ensure fair usage.
* **Caching**: User history is cached to improve performance.
* **Error Handling**: The backend includes error handling to ensure robust operation.

### Contribution

Contributions are welcome! Feel free to submit pull requests for bug fixes, features, or improvements. 

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
