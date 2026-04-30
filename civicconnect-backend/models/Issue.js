const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  category: String,
  image: String,
  reporterEmail: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },

  status: {
    type: String,
    default: "reported"
  },

  votes: {
    type: Number,
    default: 0
  },

  comments: [
    {
      text: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // AI Metadata fields
  sentiment: {
    type: String,
    default: "Neutral"
  },
  ai_category: {
    type: String,
    default: ""
  },
  is_duplicate: {
    type: Boolean,
    default: false
  },
  duplicate_confidence: {
    type: Number,
    default: 0
  },
  matched_complaint: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("Issue", issueSchema);