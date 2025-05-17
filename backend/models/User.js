const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  likedCountries: { type: [String], default: [] },
  wishList: { type: [String], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
