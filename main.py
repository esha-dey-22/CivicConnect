from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import urllib.parse
import requests
import scipy.sparse

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

class UpdateIndexRequest(BaseModel):
    new_complaint: str

class ChatRequest(BaseModel):
    message: str
    has_image: bool = False
    history: list[dict] = []

# --- Helper: Auto Translation to English for Sentiment Analysis ---
def translate_to_english(text: str) -> str:
    if not text.strip():
        return text
    
    # Fast check: skip translation API if text contains only ASCII characters
    try:
        text.encode('ascii')
        return text
    except UnicodeEncodeError:
        pass

    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q={urllib.parse.quote(text)}"
        res = requests.get(url, timeout=5)
        if res.ok:
            data = res.json()
            chunks = data[0] if data and len(data) > 0 else []
            translated = "".join([chunk[0] for chunk in chunks if chunk])
            return translated.strip()
    except Exception as e:
        print("Auto-translation to English failed:", e)
    return text

# --- 1. TF-IDF Index Cache for Duplicate Detection ---
class DuplicateDetectorCache:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.existing_complaints = []
        self.tfidf_matrix = None
        self.is_fitted = False

    def initialize_index(self, complaints: list[str]):
        self.existing_complaints = [c for c in complaints if c]
        if not self.existing_complaints:
            self.tfidf_matrix = None
            self.is_fitted = False
            return
        
        try:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.existing_complaints)
            self.is_fitted = True
        except ValueError:
            self.tfidf_matrix = None
            self.is_fitted = False

    def add_to_index(self, new_complaint: str):
        if not new_complaint.strip():
            return
        
        self.existing_complaints.append(new_complaint)
        
        if not self.is_fitted:
            self.initialize_index(self.existing_complaints)
            return
            
        try:
            new_vector = self.vectorizer.transform([new_complaint])
            self.tfidf_matrix = scipy.sparse.vstack([self.tfidf_matrix, new_vector])
        except Exception as e:
            print("Failed to append vector to cache, rebuilding...", e)
            self.initialize_index(self.existing_complaints)

    def check_duplicate(self, new_complaint: str, threshold: float = 0.5):
        if not new_complaint.strip() or not self.is_fitted or self.tfidf_matrix is None:
            return {"is_duplicate": False, "confidence": 0.0, "matched_complaint": None}

        try:
            new_vector = self.vectorizer.transform([new_complaint])
            similarities = cosine_similarity(new_vector, self.tfidf_matrix).flatten()
            if len(similarities) == 0:
                return {"is_duplicate": False, "confidence": 0.0, "matched_complaint": None}
            
            max_sim_index = similarities.argmax()
            max_sim_score = float(similarities[max_sim_index])
            
            is_duplicate = max_sim_score >= threshold
            return {
                "is_duplicate": is_duplicate,
                "confidence": max_sim_score,
                "matched_complaint": self.existing_complaints[max_sim_index] if is_duplicate else None
            }
        except Exception as e:
            print("Error during duplicate check:", e)
            return {"is_duplicate": False, "confidence": 0.0, "matched_complaint": None}

detector_cache = DuplicateDetectorCache()

# --- 2. Automatic Complaint Categorization (Keyword/NLP Logic) ---
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
    
    for category, keywords in CATEGORIES.items():
        if any(re.search(rf"\b{kw}\b", text_lower) for kw in keywords):
            return {"category": category}
            
    return {"category": "Other / General"}

# --- 3. Sentiment Analysis (VADER NLP Model with Auto-translation) ---
@app.post("/api/sentiment")
async def analyze_sentiment(complaint: Complaint):
    # Translate non-English input to English first for VADER compatibility
    translated_text = translate_to_english(complaint.text)
    scores = analyzer.polarity_scores(translated_text)
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

# --- 4. Duplicate Complaint Detection (TF-IDF Index Caching) ---
@app.post("/api/check_duplicate")
async def check_duplicate(request: DuplicateCheckRequest):
    if not request.existing_complaints:
        return {"is_duplicate": False, "confidence": 0.0, "matched_complaint": None}

    # Lazy-initialize index or rebuild if database size changed
    if not detector_cache.is_fitted or len(detector_cache.existing_complaints) != len(request.existing_complaints):
        print(f"Initializing TF-IDF index cache with {len(request.existing_complaints)} complaints...")
        detector_cache.initialize_index(request.existing_complaints)
        
    return detector_cache.check_duplicate(request.new_complaint)

@app.post("/api/update_index")
async def update_index(request: UpdateIndexRequest):
    detector_cache.add_to_index(request.new_complaint)
    return {"status": "success", "cached_count": len(detector_cache.existing_complaints)}
    
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
