const express = require("express")
const router = express.Router()
const Bid = require("../models/bid")
const Auction = require("../models/auction")
const User = require("../models/user")
const auth = require("../middleware/authMiddleware")
const { pushNotification } = require("../services/notificationService")

router.post("/place", auth, async (req, res) => {
  try {
    const { auctionId, amount } = req.body
    const userId = String(req.user.id)
    const bidAmount = Number(amount)

    if (!bidAmount || bidAmount <= 0) {
      return res.status(400).json({ error: "Invalid bid amount" })
    }

    const [auction, user] = await Promise.all([
      Auction.findById(auctionId),
      User.findById(userId),
    ])

    if (!auction) return res.status(404).json({ error: "Auction not found" })
    if (!user) return res.status(404).json({ error: "User not found" })
    if (auction.status !== "active") {
      return res.status(400).json({ error: "This auction is no longer active" })
    }

    if (auction.endTime && new Date(auction.endTime) < new Date()) {
      return res.status(400).json({ error: "This auction has ended" })
    }

    if (bidAmount <= (auction.currentBid || 0)) {
      return res.status(400).json({
        error: `Bid must be higher than current bid of $${auction.currentBid || 0}`,
      })
    }

    const previousHighestBidder = auction.highestBidder

    await Bid.create({ auctionId: String(auctionId), userId, amount: bidAmount })

    const distinctBidders = await Bid.distinct("userId", {
      auctionId: String(auctionId),
    })

    auction.currentBid = bidAmount
    auction.highestBidder = userId
    auction.bidderCount = distinctBidders.length
    await auction.save()

    const io = req.app.get("io")
    if (io) {
      io.to(String(auctionId)).emit("bidUpdate", {
        auctionId: String(auctionId),
        amount: bidAmount,
        userId,
        bidderName: user.name,
      })
    }

    if (previousHighestBidder && String(previousHighestBidder) !== userId) {
      await pushNotification({
        io,
        userId: String(previousHighestBidder),
        auctionId,
        type: "outbid",
        title: "You've been outbid",
        body: `${user.name} placed a higher bid on ${auction.itemName}.`,
      })
    }

    const refreshedUser = await User.findById(userId).select("credits")

    res.json({
      success: true,
      currentBid: bidAmount,
      credits: refreshedUser?.credits ?? 0,
    })
  } catch (err) {
    console.error("Bid error:", err.message)
    res.status(500).json({ error: "Failed to place bid: " + err.message })
  }
})

router.get("/credits", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("credits name")
    res.json({ credits: user?.credits ?? 0, name: user?.name })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch credits" })
  }
})

router.get("/history/:auctionId", async (req, res) => {
  try {
    const bids = await Bid.find({ auctionId: String(req.params.auctionId) })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    const userIds = [...new Set(bids.map((b) => String(b.userId)))]
    const users = await User.find({ _id: { $in: userIds } })
      .select("_id name email")
      .lean()
    const userMap = new Map(users.map((u) => [String(u._id), u]))

    const hydrated = bids.map((bid) => ({
      ...bid,
      userId: userMap.get(String(bid.userId))
        ? {
            _id: String(bid.userId),
            name: userMap.get(String(bid.userId)).name,
            email: userMap.get(String(bid.userId)).email,
          }
        : { _id: String(bid.userId), name: "Bidder" },
    }))

    res.json(hydrated)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" })
  }
})

router.get("/leaderboard/:auctionId", async (req, res) => {
  try {
    const auctionId = String(req.params.auctionId)
    const bids = await Bid.find({ auctionId }).sort({ amount: -1 }).lean()

    const grouped = new Map()
    for (const bid of bids) {
      const userId = String(bid.userId)
      const current = grouped.get(userId) || { _id: userId, highestBid: 0, bidCount: 0 }
      current.bidCount += 1
      if (Number(bid.amount) > current.highestBid) {
        current.highestBid = Number(bid.amount)
      }
      grouped.set(userId, current)
    }

    const leaders = [...grouped.values()]
      .sort((a, b) => b.highestBid - a.highestBid)
      .slice(0, 10)

    const users = await User.find({ _id: { $in: leaders.map((l) => l._id) } })
      .select("_id name")
      .lean()
    const userMap = new Map(users.map((u) => [String(u._id), u.name]))

    res.json(
      leaders.map((l) => ({
        ...l,
        name: userMap.get(l._id) || "Bidder",
      }))
    )
  } catch (err) {
    console.error("Leaderboard error:", err.message)
    res.status(500).json({ error: "Failed to fetch leaderboard" })
  }
})

module.exports = router
