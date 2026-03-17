// middleware/upload.js
const multer = require("multer")
const path = require("path")
const fs = require("fs")
 
// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `auction-${unique}${ext}`)
  },
})
 
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false)
  }
}
 
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})
 
module.exports = upload