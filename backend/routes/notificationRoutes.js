const express = require("express")
const router = express.Router()
const Notification = require("../models/notification")
const auth = require("../middleware/authMiddleware")

router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: String(req.user.id) })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" })
  }
})

router.post("/:id/read", auth, async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: String(req.user.id) },
      { read: true },
      { new: true }
    )
    if (!updated) {
      return res.status(404).json({ error: "Notification not found" })
    }
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: "Failed to update notification" })
  }
})

router.post("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: String(req.user.id), read: false },
      { read: true }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notifications as read" })
  }
})

module.exports = router
