const mongoose = require("mongoose")
 
const auctionSchema = new mongoose.Schema({
 
  itemName: { type: String, required: true },
 
  category: { type: String, default: "General" },
 
  description: { type: String, default: "" },
 
  basePrice: { type: Number, required: true },
 
  startingBid: { type: Number },
 
  currentBid: { type: Number, default: 0 },
 
  highestBidder: { type: String, default: null },
 
  bidderCount: { type: Number, default: 0 },
 
  endTime: { type: Date },
 
  status: {
    type: String,
    enum: ["active", "pending_payment", "sold", "ended", "awaiting_admin"],
    default: "active",
  },

  winnerId: { type: String, default: null },

  finalPrice: { type: Number, default: 0 },

  paymentDueAt: { type: Date, default: null },

  settlementCandidates: [{ type: String }],

  currentCandidateIndex: { type: Number, default: 0 },
 
  imageUrl: { type: String, default: null },   // ← stores uploaded image URL
 
}, { timestamps: true })
 
module.exports = mongoose.models.Auction || mongoose.model("Auction", auctionSchema)
