from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

app = FastAPI(title="CivicConnect AI Service")

# Allow CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize VADER analyzer (AI Model for Sentiment)
analyzer = SentimentIntensityAnalyzer()

# Models for Data Validation
class Complaint(BaseModel):
    text: str

class DuplicateCheckRequest(BaseModel):
    new_complaint: str
    existing_complaints: list[str]

class ChatRequest(BaseModel):
    message: str
    has_image: bool = False
    history: list[dict] = []

# --- 1. Automatic Complaint Categorization (Keyword/NLP Logic) ---
CATEGORIES = {
    "Waste Management": ["garbage", "trash", "waste", "dustbin", "litter", "dump"],
    "Roads & Traffic": ["pothole", "road", "traffic", "signal", "street", "highway"],
    "Water & Sanitation": ["water", "leak", "pipe", "drain", "sewage", "flooding", "tap"],
    "Electricity": ["electricity", "power", "light", "streetlight", "wire", "blackout", "pole"],
    "Public Safety": ["safety", "police", "crime", "theft", "accident", "danger"]
}

@app.post("/api/categorize")
async def categorize_complaint(complaint: Complaint):
    text_lower = complaint.text.lower()
    
    # Simple keyword logic to categorize
    for category, keywords in CATEGORIES.items():
        if any(re.search(rf"\b{kw}\b", text_lower) for kw in keywords):
            return {"category": category}
            
    return {"category": "Other / General"}

# --- 2. Sentiment Analysis (VADER NLP Model) ---
@app.post("/api/sentiment")
async def analyze_sentiment(complaint: Complaint):
    # Sentiment Analysis using VADER
    scores = analyzer.polarity_scores(complaint.text)
    compound = scores['compound']
    
    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
        
    return {
        "sentiment": sentiment,
        "scores": scores
    }

# --- 3. Duplicate Complaint Detection (TF-IDF & Cosine Similarity Models) ---
@app.post("/api/check_duplicate")
async def check_duplicate(request: DuplicateCheckRequest):
    if not request.existing_complaints:
        return {"is_duplicate": False, "confidence": 0.0, "matched_complaint": None}

    texts = [request.new_complaint] + request.existing_complaints
    
    # Using TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
    except ValueError:
        # Happens if texts are empty or only contain stop words
        return {"is_duplicate": False, "confidence": 0.0, "matched_complaint": None}
    
    # Calculate cosine similarity between the new complaint (index 0) and all others
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    # Find the most similar complaint
    max_sim_index = similarities.argmax()
    max_sim_score = float(similarities[max_sim_index])
    
    # Threshold for duplicate detection (e.g., 0.5 can be adjusted)
    DUPLICATE_THRESHOLD = 0.5
    
    is_duplicate = max_sim_score >= DUPLICATE_THRESHOLD
    
    return {
        "is_duplicate": is_duplicate,
        "confidence": max_sim_score,
        "matched_complaint": request.existing_complaints[max_sim_index] if is_duplicate else None
    }
    
@app.get("/")
def read_root():
    return {"message": "CivicConnect AI Service is running."}

# --- 4. AI Chatbot logic ---
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_msg = request.message.lower()
    
    # Check for image first
    if request.has_image:
        return {"response": "I see you attached a photo! To officially submit this issue to the government with GPS data, please go to the 'Report Issue' tab and upload it there. Our system will automatically scan it and capture your live location!"}

    # Base fallback logic for CivicConnect chatbot
    response_text = "I'm the CivicConnect AI assistant. I can help you report issues, track complaints, or understand our categories. How can I assist you today?"
    
    if any(word in user_msg for word in ["report", "complaint", "issue", "file"]):
        response_text = "To report an issue, please go to the 'Report Issue' tab. You can describe the problem, add a photo, and use your live location for better accuracy."
    elif any(word in user_msg for word in ["track", "status", "check"]):
        response_text = "You can track your complaints in the 'Registry' tab. You'll see real-time updates and AI sentiment analysis for every issue."
    elif any(word in user_msg for word in ["category", "categories", "department"]):
        response_text = "We handle: Waste Management, Roads, Water, Electricity, and Public Safety. Our AI automatically categorizes your report based on your description!"
    elif any(word in user_msg for word in ["sentiment", "emoji", "feeling"]):
        response_text = "Our AI uses VADER sentiment analysis to understand how citizens feel. It assigns emojis (😡, 😐, 😃) to help admins prioritize urgent issues."
    elif any(word in user_msg for word in ["duplicate", "similar"]):
        response_text = "We use TF-IDF Machine Learning to detect if an issue has already been reported. This prevents duplicate work for government departments!"
    elif any(word in user_msg for word in ["hello", "hi", "hey"]):
        response_text = "Hello! I'm your CivicConnect AI assistant. I'm here to help you make your city better. What's on your mind?"
    elif "who are you" in user_msg or "help" in user_msg:
        response_text = "I am the CivicConnect AI. My job is to make civic engagement smarter using Machine Learning and real-time monitoring."
    else:
        response_text = "That's a great question! While I'm still learning, I can definitely help you with reporting civic issues or understanding how our AI analysis works. What would you like to know more about?"

    return {"response": response_text}
