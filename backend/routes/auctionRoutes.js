const express = require("express")
const router = express.Router()
const Auction = require("../models/auction")
const auth = require("../middleware/authMiddleware")
const upload = require("../middleware/upload")
 
// ── GET all auctions ──────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 })
    res.json(auctions)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch auctions" })
  }
})
 
// ── CREATE auction (with optional image) ──────────────────────────────────────
router.post("/create", auth, upload.single("image"), async (req, res) => {
  try {
    console.log("FILE:", req.file)
    console.log("BODY:", req.body)
 
    const { itemName, category, basePrice, endTime, description } = req.body
 
    if (!itemName || !basePrice || !endTime) {
      return res.status(400).json({ error: "itemName, basePrice and endTime are required" })
    }
 
    const imageUrl = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : null
 
    console.log("imageUrl:", imageUrl)
 
    const auction = new Auction({
      itemName,
      category: category || "General",
      startingBid: Number(basePrice),
      basePrice: Number(basePrice),
      currentBid: Number(basePrice),
      endTime: new Date(endTime),
      description: description || "",
      imageUrl,
      status: "active",
    })
 
    await auction.save()
    res.status(201).json(auction)
  } catch (err) {
    console.error("Create auction error:", err)
    res.status(500).json({ error: "Failed to create auction" })
  }
})
 
// ── DELETE auction ────────────────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    await Auction.findByIdAndDelete(req.params.id)
    res.json({ message: "Auction deleted" })
  } catch (err) {
    res.status(500).json({ error: "Failed to delete auction" })
  }
})
 
module.exports = router
