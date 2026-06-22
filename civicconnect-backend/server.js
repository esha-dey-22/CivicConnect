const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const mongoose = require("mongoose");
const Issue = require("./models/Issue");
const User = require("./models/User");
const Notification = require("./models/Notification");
const bcrypt = require("bcrypt");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();

let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log("Gmail SMTP transporter configured.");
} else {
  console.log("Warning: EMAIL_USER and EMAIL_PASS not found in .env. Emails will not be sent.");
}

app.use(cors());
app.use(express.json());

require("./db");

/* ---------- ADMIN MIDDLEWARE ---------- */

const isAdmin = (req, res, next) => {
  const role = req.headers.role;

  if (role === "admin") {
    next();
  } else {
    res.status(403).send("Access denied. Admin only.");
  }
};

/* ---------- SERVE UPLOADED IMAGES ---------- */

app.use("/uploads", express.static("uploads"));

/* ---------- IMAGE UPLOAD SETUP ---------- */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

/* ---------- TEST ROUTE ---------- */

app.get("/", (req, res) => {
  res.send("CivicConnect backend running");
});

/* ---------- REPORT ISSUE ---------- */

app.post("/report", upload.single("image"), async (req, res) => {
  try {
    const description = req.body.description || "";
    const AI_URL = "http://127.0.0.1:8000";
    
    let sentiment = "Neutral";
    let ai_category = "";
    let is_duplicate = false;
    let duplicate_confidence = 0;
    let matched_complaint = "";

    try {
      const catRes = await axios.post(`${AI_URL}/api/categorize`, { text: description });
      ai_category = catRes.data.category;

      const sentRes = await axios.post(`${AI_URL}/api/sentiment`, { text: description });
      sentiment = sentRes.data.sentiment;

      const existingIssues = await Issue.find({}, "description");
      const existingDescriptions = existingIssues.map(i => i.description).filter(Boolean);
      
      const dupRes = await axios.post(`${AI_URL}/api/check_duplicate`, {
        new_complaint: description,
        existing_complaints: existingDescriptions
      });
      
      is_duplicate = dupRes.data.is_duplicate;
      duplicate_confidence = dupRes.data.confidence;
      matched_complaint = dupRes.data.matched_complaint || "";
    } catch (aiError) {
      console.error("AI Service Error:", aiError.message);
    }

    let coordinates = { latitude: 0, longitude: 0 };
    if (req.body.coordinates) {
      try {
        coordinates = JSON.parse(req.body.coordinates);
      } catch (e) {
        console.error("Failed to parse coordinates");
      }
    }

    const issue = new Issue({
      title: req.body.title,
      description: description,
      location: req.body.location,
      category: req.body.category,
      reporterEmail: req.body.reporterEmail,
      image: req.file ? req.file.filename : "",
      coordinates: coordinates,
      sentiment: sentiment,
      ai_category: ai_category,
      is_duplicate: is_duplicate,
      duplicate_confidence: duplicate_confidence,
      matched_complaint: matched_complaint
    });

    await issue.save();

    res.send("Issue reported with AI metadata");

  } catch (error) {
    console.error(error);
    res.status(500).send("Error reporting issue");
  }
});

/* ---------- GET ALL ISSUES ---------- */

app.get("/issues", async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------- NOTIFICATIONS ---------- */

app.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/notifications", isAdmin, async (req, res) => {
  try {
    const notification = new Notification({
      message: req.body.message,
      recipientEmail: req.body.recipientEmail || ""
    });
    await notification.save();

    // Send physical email if a recipient is specified
    if (req.body.recipientEmail && transporter) {
      try {
        await transporter.sendMail({
          from: `"CivicConnect Admin" <${process.env.EMAIL_USER}>`,
          to: req.body.recipientEmail,
          subject: "New Update from CivicConnect",
          text: req.body.message
        });
        console.log("Notification email sent to: %s", req.body.recipientEmail);
      } catch (emailErr) {
        console.error("Failed to send notification email:", emailErr);
      }
    }

    res.json(notification);
  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------- UPDATE ISSUE STATUS (PROTECTED) ---------- */

app.put("/issues/:id", isAdmin, async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (req.body.status === "Resolved" && updatedIssue.reporterEmail && transporter) {
      try {
        const info = await transporter.sendMail({
          from: `"CivicConnect Admin" <${process.env.EMAIL_USER}>`,
          to: updatedIssue.reporterEmail,
          subject: "Your Complaint has been Resolved!",
          text: `Great news! Your reported issue "${updatedIssue.title}" has been successfully resolved by our team.`
        });
        console.log("Email sent to: %s", updatedIssue.reporterEmail);
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    res.json(updatedIssue);
  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------- DELETE ISSUE (PROTECTED) ---------- */

app.delete("/issues/:id", isAdmin, async (req, res) => {
  try {
    await Issue.findByIdAndDelete(req.params.id);
    res.send("Issue deleted successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------- REGISTER USER (UPDATED) ---------- */

app.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || "user"   // ✅ NEW
    });

    await user.save();

    res.send("User registered successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------- LOGIN USER (UPDATED) ---------- */

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    });

    if (user && await bcrypt.compare(req.body.password, user.password)) {
      res.json({
        message: "Login successful",
        role: user.role   // ✅ NEW
      });
    } else {
      res.send("Invalid email or password");
    }

  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------- ADD COMMENT ---------- */

app.post("/issues/:id/comment", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    issue.comments.push({
      text: req.body.text
    });

    await issue.save();

    res.send("Comment added successfully");

  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------- UPVOTE ISSUE ---------- */

app.post("/issues/:id/upvote", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    issue.votes += 1;

    await issue.save();

    res.send("Issue upvoted");

  } catch (error) {
    res.status(500).send(error);
  }
});

/* ---------- AI CHATBOT ---------- */

app.post("/chat", async (req, res) => {
  try {
    const AI_URL = "http://127.0.0.1:8000";
    const chatRes = await axios.post(`${AI_URL}/api/chat`, { 
      message: req.body.message || "", 
      has_image: req.body.has_image || false 
    });
    res.json(chatRes.data);
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    res.status(500).json({ response: "I'm having trouble connecting to my AI brain right now, but I can still help you with standard project questions!" });
  }
});

/* ---------- START SERVER ---------- */

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});