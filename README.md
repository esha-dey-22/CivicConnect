# CivicConnect: AI-Powered Civic Issue Management System

CivicConnect is a modern, dark-themed platform designed to empower communities by streamlining the reporting and management of civic issues. It leverages AI to provide sentiment analysis and duplicate detection, ensuring that government administrators can prioritize and resolve citizen concerns efficiently.

## 🚀 Key Features

### 🏛️ For Citizens
*   **Easy Reporting**: Submit issues with descriptions, categories, and photo uploads.
*   **GPS Tracking**: Automatic location capture for accurate issue mapping.
*   **Live Registry**: Track the status of all reported issues in real-time.
*   **AI Chatbot**: Intelligent assistant for answering civic-related questions.

### 🛡️ For Admins
*   **Issue Management**: Update status (Pending, Resolved, etc.) with automated email notifications.
*   **Map Monitoring**: Interactive map with density markers showing high-priority areas.
*   **Advanced Analytics**: Visual charts for category distribution and issue trends.
*   **Smart Notifications**: Push announcements directly to the public registry.

### 🧠 AI Capabilities
*   **Sentiment Analysis**: Automatically classifies the tone of complaints (Positive/Negative/Neutral) using NLP.
*   **Duplicate Detection**: Uses TF-IDF and Cosine Similarity to identify redundant reports and prevent spam.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 15, React, Tailwind CSS, Clerk (Auth), Lucide Icons.
*   **Backend**: Node.js, Express, MongoDB, Mongoose, Nodemailer.
*   **AI Service**: Python, FastAPI, VADER Sentiment, Scikit-learn.
*   **Chatbot**: n8n AI Integration.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)
*   MongoDB Atlas Account
*   Clerk Account

### 2. Backend Setup (`/civicconnect-backend`)
1. Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
2. Install dependencies: `npm install`
3. Run: `node server.js`

### 3. AI Service Setup (Root)
1. Install dependencies: `pip install fastapi uvicorn vaderSentiment scikit-learn`
2. Run: `uvicorn main:app --reload`

### 4. Frontend Setup (`/civicconnect-frontend`)
1. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   ```
2. Install dependencies: `npm install`
3. Run: `npm run dev`

---

## 📁 Project Structure
```
Project/
├── civicconnect-frontend/   # Next.js Frontend
├── civicconnect-backend/    # Node.js Express API
└── main.py                  # Python AI Microservice
```

---

## 📄 License
This project is developed for civic empowerment. Feel free to contribute!
