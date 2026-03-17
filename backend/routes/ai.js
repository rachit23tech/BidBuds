// routes/ai.js
const express = require("express")
const router = express.Router()
const Groq = require("groq-sdk")
 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
 
router.post("/advice", async (req, res) => {
  const { auctions } = req.body
 
  if (!auctions || auctions.length === 0) {
    return res.status(400).json({ error: "No auctions provided" })
  }
 
  const prompt = `You are an expert AI auction bidding advisor for BidBudz, an AI-powered live auction platform.
 
Here are the currently live auctions:
${JSON.stringify(auctions, null, 2)}
 
Analyze each auction and provide bidding recommendations. For EACH auction, give:
1. A "worthIt" boolean (true/false) — is it worth bidding on?
2. A "recommendedBid" number — the optimal bid amount in USD
3. A "confidence" string — "High", "Medium", or "Low"
4. A "reason" string (1-2 sentences max) — why this is or isn't worth it
5. A "risk" string — "Low Risk", "Medium Risk", or "High Risk"
 
Also provide an "overview" string (2-3 sentences) summarizing the overall market and your top pick.
And a "topPick" string — the _id of the single best auction to bid on right now.
 
Respond ONLY with valid JSON in this exact format, no markdown, no extra text:
{
  "overview": "...",
  "topPick": "auction_id_here",
  "auctions": [
    {
      "id": "...",
      "worthIt": true,
      "recommendedBid": 5000,
      "confidence": "High",
      "reason": "...",
      "risk": "Low Risk"
    }
  ]
}`
 
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert auction bidding advisor. Always respond with valid JSON only, no markdown, no extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },  // forces pure JSON output
    })
 
    const text = completion.choices[0]?.message?.content || ""
    const parsed = JSON.parse(text)
 
    res.json(parsed)
  } catch (err) {
    console.error("AI advice error:", err)
    res.status(500).json({ error: "Failed to get AI analysis" })
  }
})
 
// ── GET /api/ai/suggest/:auctionId — Per-auction AI suggestion ────────────────
router.get("/suggest/:auctionId", async (req, res) => {
  try {
    const Auction = require("../models/auction")
    const auction = await Auction.findById(req.params.auctionId)
    if (!auction) return res.status(404).json({ error: "Auction not found" })
 
    const now = new Date()
    const timeLeft = auction.endTime
      ? Math.max(0, Math.floor((new Date(auction.endTime) - now) / 60000))
      : null
 
    const prompt = `You are an AI bidding advisor. Analyze this auction and give a quick recommendation.
 
Auction: "${auction.itemName}"
Category: ${auction.category || "General"}
Current Bid: $${auction.currentBid || 0}
Starting Bid: $${auction.startingBid || auction.basePrice || 0}
Active Bidders: ${auction.bidderCount || 0}
Time Left: ${timeLeft !== null ? timeLeft + " minutes" : "Unknown"}
 
Respond ONLY with valid JSON:
{
  "suggestedBid": 5250,
  "winProbability": 72,
  "strategy": [
    "Tip 1 specific to this auction",
    "Tip 2 specific to this auction",
    "Tip 3 specific to this auction"
  ]
}`
 
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an auction bidding advisor. Respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 512,
      response_format: { type: "json_object" },
    })
 
    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}")
    res.json(parsed)
  } catch (err) {
    console.error("AI suggest error:", err)
    res.status(500).json({ error: "Failed to get suggestion" })
  }
})
 
// ── POST /api/ai/price — Admin price recommendation ───────────────────────────
router.post("/price", async (req, res) => {
  const { itemName, category } = req.body
 
  if (!itemName) return res.status(400).json({ error: "itemName is required" })
 
  const prompt = `You are an expert auction pricing advisor with deep knowledge of the collectibles, luxury goods, and auction markets.
 
An admin wants to auction this item:
- Item: "${itemName}"
- Category: "${category || "General"}"
 
Analyze the current market value and provide pricing recommendations for an online auction starting bid.
 
Respond ONLY with valid JSON, no markdown, no extra text:
{
  "priceRecommended": 5000,
  "priceLow": 3500,
  "priceHigh": 7500,
  "sentiment": "bullish",
  "recommendation": "Price Higher — strong demand in this category",
  "insight": "2-3 sentence market analysis explaining why you recommend this price range, current demand trends, and what affects value for this item.",
  "comparables": [
    { "name": "Similar item name", "price": 4800, "date": "Jan 2026" },
    { "name": "Similar item name", "price": 5200, "date": "Feb 2026" },
    { "name": "Similar item name", "price": 4500, "date": "Mar 2026" }
  ],
  "factors": [
    "Factor 1 affecting price",
    "Factor 2 affecting price",
    "Factor 3 affecting price"
  ]
}
 
Rules:
- sentiment must be one of: "bullish", "bearish", "neutral"
- recommendation must start with "Price Higher", "Price Lower", or "Fair Price"
- priceRecommended should be the optimal starting bid
- priceLow is the conservative minimum, priceHigh is the aggressive maximum
- comparables should be realistic recent auction results for similar items
- factors should be 3-4 key things that affect this item's value`
 
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are an expert auction pricing advisor. Always respond with valid JSON only, no markdown, no extra text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    })
 
    const text = completion.choices[0]?.message?.content || ""
    const parsed = JSON.parse(text)
    res.json(parsed)
  } catch (err) {
    console.error("AI price error:", err)
    res.status(500).json({ error: "Failed to get price analysis" })
  }
})
 
module.exports = router
