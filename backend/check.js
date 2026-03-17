const mongoose = require("mongoose")
 
mongoose.connect("mongodb://127.0.0.1:27017/bidbuds").then(async () => {
  const Auction = require("./models/auction")
  const auctions = await Auction.find({}, "itemName imageUrl category").limit(5)
  console.log(JSON.stringify(auctions, null, 2))
  process.exit()
})
