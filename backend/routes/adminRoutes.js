// routes/adminRoutes.js
const express = require("express")
const router = express.Router()
const User = require("../models/user")
const Auction = require("../models/auction")
const Bid = require("../models/bid")
const auth = require("../middleware/authMiddleware")
 
// ── Middleware: admin only ────────────────────────────────────────────────────
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }
    next()
  } catch (err) {
    res.status(500).json({ error: "Auth check failed" })
  }
}
 
// ── GET all users ─────────────────────────────────────────────────────────────
router.get("/users", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "name email credits role createdAt").sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" })
  }
})
 
// ── POST add credits to a user ────────────────────────────────────────────────
router.post("/add-credits", auth, adminOnly, async (req, res) => {
  try {
    const { userId, amount, note } = req.body
 
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "userId and a positive amount are required" })
    }
 
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: Number(amount) } },
      { new: true }
    ).select("name email credits")
 
    if (!user) return res.status(404).json({ error: "User not found" })
 
    console.log(`Admin added ${amount} credits to ${user.name} (${user.email}). Note: ${note || "none"}. New balance: ${user.credits}`)
 
    res.json({
      success: true,
      user: { name: user.name, email: user.email, credits: user.credits },
      message: `Added ${amount} credits to ${user.name}. New balance: ${user.credits}`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to add credits" })
  }
})
// ── TEMPORARY: Make user admin by email (no auth needed for setup) ──────────
router.post("/make-admin", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "email is required" })
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      { new: true }
    ).select("name email role")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      success: true,
      message: `${user.email} is now an admin`,
      user,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to make user admin" })
  }
})
// ── POST deduct credits from a user ──────────────────────────────────────────
router.post("/deduct-credits", auth, adminOnly, async (req, res) => {
  try {
    const { userId, amount, note } = req.body
    const deductionAmount = Number(amount)

    if (!userId || !Number.isFinite(deductionAmount) || deductionAmount <= 0) {
      return res.status(400).json({ error: "userId and a positive amount are required" })
    }
 
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: "User not found" })
 
    if (user.credits < deductionAmount) {
      return res.status(400).json({ error: `User only has ${user.credits} credits` })
    }
 
    user.credits -= deductionAmount
    await user.save()

    console.log(
      `Admin deducted ${deductionAmount} credits from ${user.name} (${user.email}). Note: ${note || "none"}. New balance: ${user.credits}`
    )
 
    res.json({
      success: true,
      user: { name: user.name, email: user.email, credits: user.credits },
      message: `Deducted ${deductionAmount} credits from ${user.name}. New balance: ${user.credits}`,
    })
  } catch (err) {
    res.status(500).json({ error: "Failed to deduct credits" })
  }
})

router.get("/unclaimed-auctions", auth, adminOnly, async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "awaiting_admin" }).sort({ updatedAt: -1 })
    res.json(auctions)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unclaimed auctions" })
  }
})

router.post("/auction-decision", auth, adminOnly, async (req, res) => {
  try {
    const { auctionId, action, endTime } = req.body
    if (!auctionId || !action) {
      return res.status(400).json({ error: "auctionId and action are required" })
    }
    if (!["remove", "reauction"].includes(action)) {
      return res.status(400).json({ error: "action must be remove or reauction" })
    }

    const auction = await Auction.findById(auctionId)
    if (!auction) return res.status(404).json({ error: "Auction not found" })
    if (auction.status !== "awaiting_admin") {
      return res.status(400).json({ error: "Auction is not awaiting admin decision" })
    }

    if (action === "remove") {
      await Bid.deleteMany({ auctionId: String(auctionId) })
      await Auction.findByIdAndDelete(auctionId)
      return res.json({ success: true, action: "remove", message: "Auction removed" })
    }

    const nextEnd = endTime
      ? new Date(endTime)
      : new Date(Date.now() + 24 * 60 * 60 * 1000)

    await Bid.deleteMany({ auctionId: String(auctionId) })

    auction.status = "active"
    auction.winnerId = null
    auction.highestBidder = null
    auction.finalPrice = 0
    auction.paymentDueAt = null
    auction.currentCandidateIndex = 0
    auction.settlementCandidates = []
    auction.bidderCount = 0
    auction.currentBid = Number(auction.startingBid || auction.basePrice || 0)
    auction.endTime = nextEnd
    await auction.save()

    return res.json({
      success: true,
      action: "reauction",
      message: "Auction relisted",
      auction,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to apply auction decision" })
  }
})
 
module.exports = router
