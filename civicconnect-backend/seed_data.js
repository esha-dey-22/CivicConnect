const mongoose = require("mongoose");
const Issue = require("./models/Issue");

const CHENNAI_COORDS = { latitude: 13.08, longitude: 80.27 }; // Medium Density (8)
const BENGALURU_COORDS = { latitude: 12.97, longitude: 77.59 }; // High Density (16)

const seedData = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/civicconnect");
    console.log("Connected to MongoDB for seeding...");

    const mockIssues = [];

    // Add 8 issues for Chennai (Medium Density)
    for (let i = 0; i < 8; i++) {
      mockIssues.push({
        title: `Mock Medium Density Issue ${i + 1}`,
        description: "This is an automatically generated issue to demonstrate medium density (yellow marker).",
        location: "Chennai",
        category: "Roads & Traffic",
        coordinates: CHENNAI_COORDS,
        status: "reported",
        sentiment: "Neutral",
        ai_category: "Roads & Traffic",
      });
    }

    // Add 16 issues for Bengaluru (High Density)
    for (let i = 0; i < 16; i++) {
      mockIssues.push({
        title: `Mock High Density Issue ${i + 1}`,
        description: "This is an automatically generated issue to demonstrate high density (red marker).",
        location: "Bengaluru",
        category: "Waste Management",
        coordinates: BENGALURU_COORDS,
        status: "reported",
        sentiment: "Negative",
        ai_category: "Waste Management",
      });
    }

    await Issue.insertMany(mockIssues);
    console.log(`Successfully inserted ${mockIssues.length} mock complaints!`);

  } catch (err) {
    console.error("Error seeding data:", err);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

seedData();
