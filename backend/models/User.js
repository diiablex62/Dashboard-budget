const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  emails: [
    {
      type: String,
      required: true,
    },
  ],
  authMethods: [
    {
      type: String,
      required: true,
    },
  ],
  photoURL: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  lastProvider: {
    type: String,
    default: "unknown",
  },
});

module.exports = mongoose.model("User", userSchema);
