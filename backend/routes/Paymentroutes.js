const express = require("express")
const router = express.Router()
const Stripe = require("stripe")
const auth = require("../middleware/authMiddleware")
const User = require("../models/user")
const Auction = require("../models/auction")
const CreditTopup = require("../models/creditTopup")
const { pushNotification } = require("../services/notificationService")
const {
  trySettlePendingAuctionsForUser,
  settleAuction,
} = require("../services/auctionSettlementService")

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set in .env")
  }
  if (!key.startsWith("sk_")) {
    throw new Error("STRIPE_SECRET_KEY must start with sk_ (use Stripe Secret Key, not publishable key)")
  }
  return new Stripe(key)
}

router.post("/create-credits-checkout", auth, async (req, res) => {
  try {
    const requestedCredits = Number(req.body.credits)
    if (!Number.isInteger(requestedCredits) || requestedCredits <= 0) {
      return res.status(400).json({ error: "Credits must be a positive integer" })
    }

    const stripe = getStripe()
    const credits = requestedCredits
    const amountUsd = credits

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "BidBuds Credits",
              description: `${credits} credits (1 credit = 1 USD)`,
            },
            unit_amount: amountUsd * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/buy-credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/buy-credits?cancelled=true`,
      metadata: {
        type: "credit_topup",
        userId: String(req.user.id),
        credits: String(credits),
        amountUsd: String(amountUsd),
      },
    })

    res.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error("Stripe credits checkout error:", err.message)
    res.status(500).json({ error: err.message || "Failed to create credits checkout session" })
  }
})

router.post("/confirm-credits", auth, async (req, res) => {
  try {
    const { sessionId } = req.body
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" })
    }

    const existing = await CreditTopup.findOne({ sessionId })
    if (existing) {
      const user = await User.findById(req.user.id).select("credits")
      return res.json({
        success: true,
        alreadyProcessed: true,
        credits: user?.credits ?? 0,
      })
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Session is not paid" })
    }

    if ((session.metadata?.type || "") !== "credit_topup") {
      return res.status(400).json({ error: "Invalid checkout session type" })
    }

    const metadataUserId = String(session.metadata.userId || "")
    if (metadataUserId !== String(req.user.id)) {
      return res.status(403).json({ error: "Session does not belong to this user" })
    }

    const credits = Number(session.metadata.credits || 0)
    const amountUsd = Number(session.metadata.amountUsd || 0)

    await CreditTopup.create({
      sessionId,
      userId: metadataUserId,
      credits,
      amountUsd,
    })

    const user = await User.findByIdAndUpdate(
      metadataUserId,
      { $inc: { credits } },
      { new: true }
    ).select("_id credits")

    const io = req.app.get("io")
    await pushNotification({
      io,
      userId: metadataUserId,
      type: "credits_added",
      title: "Credits added",
      body: `${credits} credits were added to your account.`,
    })

    await trySettlePendingAuctionsForUser(metadataUserId, io)

    res.json({ success: true, credits: user?.credits ?? 0, added: credits })
  } catch (err) {
    console.error("Confirm credits error:", err.message)
    res.status(500).json({ error: "Failed to confirm credits purchase" })
  }
})

router.post("/pay-winning-bid", auth, async (req, res) => {
  try {
    const { auctionId } = req.body
    if (!auctionId) {
      return res.status(400).json({ error: "auctionId is required" })
    }

    const auction = await Auction.findById(auctionId)
    if (!auction) return res.status(404).json({ error: "Auction not found" })

    if (auction.status !== "pending_payment") {
      return res.status(400).json({ error: "Auction is not pending payment" })
    }

    if (String(auction.winnerId) !== String(req.user.id)) {
      return res.status(403).json({ error: "Only current winner can pay this bid" })
    }

    if (auction.paymentDueAt && new Date(auction.paymentDueAt) <= new Date()) {
      return res.status(400).json({ error: "Payment window has expired" })
    }

    const io = req.app.get("io")
    const settled = await settleAuction(auction, io)
    const user = await User.findById(req.user.id).select("credits")

    if (settled.status === "sold" && String(settled.winnerId) === String(req.user.id)) {
      return res.json({
        success: true,
        status: "sold",
        credits: user?.credits ?? 0,
        finalPrice: settled.finalPrice || settled.currentBid || 0,
      })
    }

    return res.status(400).json({
      error: "Not enough credits. Please top up to complete payment.",
      credits: user?.credits ?? 0,
      required: Math.max(
        0,
        Number(settled.finalPrice || settled.currentBid || 0) - Number(user?.credits || 0)
      ),
    })
  } catch (err) {
    console.error("Pay winning bid error:", err.message)
    res.status(500).json({ error: "Failed to process winning-bid payment" })
  }
})

module.exports = router
