const Notification = require("../models/notification")

async function pushNotification({ io, userId, auctionId = null, type, title, body }) {
  const saved = await Notification.create({
    userId: String(userId),
    auctionId: auctionId ? String(auctionId) : null,
    type,
    title,
    body,
  })

  if (io) {
    io.to(`user:${String(userId)}`).emit("notification", saved)
  }

  return saved
}

module.exports = { pushNotification }
