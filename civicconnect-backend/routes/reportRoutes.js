const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// POST route
router.post("/report", upload.single("image"), (req, res) => {
  console.log("Data received:", req.body);
  console.log("File:", req.file);

  res.send("Report submitted successfully");
});

module.exports = router;