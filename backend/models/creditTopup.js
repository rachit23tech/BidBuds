const mongoose = require("mongoose")

const creditTopupSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    credits: { type: Number, required: true },
    amountUsd: { type: Number, required: true },
  },
  { timestamps: true }
)

module.exports =
  mongoose.models.CreditTopup || mongoose.model("CreditTopup", creditTopupSchema)
