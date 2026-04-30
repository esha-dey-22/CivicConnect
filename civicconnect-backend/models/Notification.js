const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  recipientEmail: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
