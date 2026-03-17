const User = require("../models/user.js")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// REGISTER
exports.register = async (req, res) => {

 try {

  const { name, email, password } = req.body

  // check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
   return res.status(400).json({ message: "User already exists" })
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = new User({
   name,
   email,
   password: hashed
  })

  await user.save()

  res.json({ message: "User registered successfully" })

 } catch (err) {
  console.error(err)
  res.status(500).json({ message: "Server error" })
 }

}


// LOGIN
exports.login = async (req, res) => {

 try {

  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (!user) {
   return res.status(400).json({ message: "User not found" })
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
   return res.status(400).json({ message: "Wrong password" })
  }

  const token = jwt.sign(
   { id: user._id, role: user.role },
   "secret123",
   { expiresIn: "1d" }
  )

  res.json({
   token,
   user
  })

 } catch (err) {
  console.error(err)
  res.status(500).json({ message: "Server error" })
 }

}