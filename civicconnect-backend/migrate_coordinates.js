const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/civicconnect")
  .then(() => {
    console.log("Connected to MongoDB for migration");
    runMigration();
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

const Issue = mongoose.model("Issue", new mongoose.Schema({
  title: String,
  location: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, { timestamps: true }));

async function runMigration() {
  try {
    // Find all issues with coordinate (0, 0) that have a location text
    const issues = await Issue.find({
      "coordinates.latitude": 0,
      "coordinates.longitude": 0,
      location: { $ne: "" }
    });

    console.log(`Found ${issues.length} issues needing geocoding correction.`);

    for (let index = 0; index < issues.length; index++) {
      const issue = issues[index];
      console.log(`Processing issue [${issue._id}] "${issue.title}" with location: "${issue.location}"`);

      const parts = issue.location.split(",").map(p => p.trim()).filter(Boolean);
      let coordinatesResolved = null;

      for (let i = 0; i < parts.length; i++) {
        const searchStr = parts.slice(i).join(", ");
        if (!searchStr) continue;

        try {
          console.log(`  Trying Nominatim query: "${searchStr}"`);
          const geoRes = await axios.get(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchStr)}`,
            {
              headers: {
                "User-Agent": "CivicConnect/1.0"
              },
              timeout: 4000
            }
          );

          if (geoRes.data && geoRes.data.length > 0) {
            coordinatesResolved = {
              latitude: Number(geoRes.data[0].lat),
              longitude: Number(geoRes.data[0].lon)
            };
            console.log(`  Successfully resolved to:`, coordinatesResolved);
            break;
          }
        } catch (geoErr) {
          console.error(`  Nominatim query failed for "${searchStr}":`, geoErr.message);
        }

        // Wait 1.5 seconds between requests to respect Nominatim rate limit
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (coordinatesResolved) {
        issue.coordinates = coordinatesResolved;
        await issue.save();
        console.log(`  Updated issue [${issue._id}] coordinates in database.\n`);
      } else {
        console.log(`  Could not resolve coordinates for location "${issue.location}"\n`);
      }

      // Wait 1.5 seconds between issues to respect Nominatim rate limit
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    mongoose.connection.close();
  }
}
