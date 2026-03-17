const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const User = require("../models/user")
const Auction = require("../models/auction")

router.get("/me", auth, async (req, res) => {
  try {
    const userId = String(req.user.id)

    const [user, wonAuctions] = await Promise.all([
      User.findById(userId).select("_id name email credits createdAt"),
      Auction.find({
        winnerId: userId,
        status: { $in: ["pending_payment", "sold"] },
      })
        .sort({ updatedAt: -1 })
        .select(
          "_id itemName category imageUrl status currentBid finalPrice paymentDueAt updatedAt createdAt"
        )
        .lean(),
    ])

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      user,
      wonAuctions: wonAuctions || [],
      adminContact: {
        email: process.env.ADMIN_EMAIL || "admin@bidbudz.com",
        phone: process.env.ADMIN_PHONE || "+1-800-000-0000",
      },
    })
  } catch (err) {
    console.error("Profile fetch error:", err.message)
    res.status(500).json({ error: "Failed to load profile" })
  }
})

module.exports = router
