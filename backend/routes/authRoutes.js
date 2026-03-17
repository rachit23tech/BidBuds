// routes/authRoutes.js
// Make sure your register route includes credits: 1000
 
const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/user")

const JWT_SECRET = process.env.JWT_SECRET || "secret123"
 
// ── Register ──────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
 
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: "Email already in use" })
 
    const hashed = await bcrypt.hash(password, 10)
 
    const user = new User({
      name,
      email,
      password: hashed,
      credits: 1000,   // ← every new user starts with 1000 credits
    })
 
    await user.save()
    res.status(201).json({ message: "Account created successfully" })
 
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Registration failed" })
  }
})
 
// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
 
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: "Invalid credentials" })
 
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ error: "Invalid credentials" })
 
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    )
 
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,  // ← send credits to frontend on login
      }
    })
 
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Login failed" })
  }
})
 
module.exports = router
