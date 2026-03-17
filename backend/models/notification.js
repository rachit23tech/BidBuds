const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    auctionId: { type: String, default: null },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema)
