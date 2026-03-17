const mongoose = require("mongoose")
 
const userSchema = new mongoose.Schema({
 
  name: { type: String, required: true },
 
  email: { type: String, required: true, unique: true },
 
  password: { type: String, required: true },
 
  role: { type: String, default: "user" },
 
  credits: { type: Number, default: 1000 },  // ← every new user starts with 1000
 
}, { timestamps: true })
 
module.exports = mongoose.models.User || mongoose.model("User", userSchema)