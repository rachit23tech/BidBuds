const express = require("express")
const router = express.Router()

const { getBidSuggestion } = require("../controllers/aiController")

router.get("/suggest/:auctionId", getBidSuggestion)

module.exports = router