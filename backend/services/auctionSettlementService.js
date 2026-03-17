const Auction = require("../models/auction")
const Bid = require("../models/bid")
const User = require("../models/user")
const { pushNotification } = require("./notificationService")

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

function getUniqueRankedCandidates(bids) {
  const seen = new Set()
  const ranked = []

  for (const bid of bids) {
    const userId = String(bid.userId)
    if (!seen.has(userId)) {
      seen.add(userId)
      ranked.push({ userId, amount: Number(bid.amount || 0) })
    }
  }

  return ranked
}

async function settleAuction(auction, io) {
  const bids = await Bid.find({ auctionId: String(auction._id) })
    .sort({ amount: -1, createdAt: 1 })
    .lean()

  if (!bids.length) {
    auction.status = "awaiting_admin"
    auction.winnerId = null
    auction.finalPrice = 0
    auction.settlementCandidates = []
    auction.paymentDueAt = null
    await auction.save()

    if (io) {
      io.to(String(auction._id)).emit("auctionAwaitingAdmin", {
        auctionId: String(auction._id),
        status: "awaiting_admin",
      })
    }
    return auction
  }

  const ranked = getUniqueRankedCandidates(bids)
  const candidateIds = ranked.map((r) => r.userId)

  auction.settlementCandidates = candidateIds

  for (let index = auction.currentCandidateIndex || 0; index < ranked.length; index += 1) {
    const { userId, amount } = ranked[index]
    const user = await User.findById(userId)
    if (!user) continue

    if ((user.credits || 0) >= amount) {
      user.credits -= amount
      await user.save()

      auction.status = "sold"
      auction.winnerId = userId
      auction.highestBidder = userId
      auction.currentBid = amount
      auction.finalPrice = amount
      auction.paymentDueAt = null
      auction.currentCandidateIndex = index
      await auction.save()

      if (io) {
        io.to(String(auction._id)).emit("auctionSettled", {
          auctionId: String(auction._id),
          status: "sold",
          winnerId: userId,
          finalPrice: amount,
          winnerName: user.name,
        })
      }

      await pushNotification({
        io,
        userId,
        auctionId: auction._id,
        type: "winner",
        title: "You won the auction",
        body: `You won ${auction.itemName} for $${amount}. ${amount} credits were deducted automatically.`,
      })

      return auction
    }

    auction.status = "pending_payment"
    auction.winnerId = userId
    auction.finalPrice = amount
    auction.paymentDueAt = new Date(Date.now() + TWENTY_FOUR_HOURS_MS)
    auction.currentCandidateIndex = index
    await auction.save()

    if (io) {
      io.to(String(auction._id)).emit("auctionPendingPayment", {
        auctionId: String(auction._id),
        status: "pending_payment",
        winnerId: userId,
        finalPrice: amount,
        paymentDueAt: auction.paymentDueAt,
      })
    }

    await pushNotification({
      io,
      userId,
      auctionId: auction._id,
      type: "payment_required",
      title: "Top up credits to claim your win",
      body: `You are highest bidder for ${auction.itemName} at $${amount}. Add credits within 24 hours.`,
    })

    return auction
  }

  auction.status = "awaiting_admin"
  auction.winnerId = null
  auction.finalPrice = 0
  auction.paymentDueAt = null
  await auction.save()

  if (io) {
    io.to(String(auction._id)).emit("auctionAwaitingAdmin", {
      auctionId: String(auction._id),
      status: "awaiting_admin",
    })
  }
  return auction
}

async function processEndedAuctions(io) {
  const endedActive = await Auction.find({
    status: "active",
    endTime: { $lte: new Date() },
  })

  for (const auction of endedActive) {
    await settleAuction(auction, io)
  }
}

async function processExpiredPendingPayments(io) {
  const expired = await Auction.find({
    status: "pending_payment",
    paymentDueAt: { $lte: new Date() },
  })

  for (const auction of expired) {
    const previousWinner = auction.winnerId
    auction.currentCandidateIndex = (auction.currentCandidateIndex || 0) + 1
    await auction.save()

    if (previousWinner) {
      await pushNotification({
        io,
        userId: previousWinner,
        auctionId: auction._id,
        type: "payment_expired",
        title: "Payment window expired",
        body: `Your 24-hour payment window for ${auction.itemName} has expired.`,
      })
    }

    const settled = await settleAuction(auction, io)

    if (settled.winnerId && settled.winnerId !== previousWinner) {
      await pushNotification({
        io,
        userId: settled.winnerId,
        auctionId: auction._id,
        type: "winner_promoted",
        title: "You are now the highest eligible winner",
        body: `Previous winner failed to pay for ${auction.itemName}. You now have priority.`,
      })
    }
  }
}

async function processAuctionSettlementCycle(io) {
  await processEndedAuctions(io)
  await processExpiredPendingPayments(io)
}

async function trySettlePendingAuctionsForUser(userId, io) {
  const auctions = await Auction.find({
    status: "pending_payment",
    winnerId: String(userId),
    paymentDueAt: { $gt: new Date() },
  })

  for (const auction of auctions) {
    await settleAuction(auction, io)
  }
}

module.exports = {
  processAuctionSettlementCycle,
  settleAuction,
  trySettlePendingAuctionsForUser,
  TWENTY_FOUR_HOURS_MS,
}
