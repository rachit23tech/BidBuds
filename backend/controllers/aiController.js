const Auction = require("../models/auction")
const Bid = require("../models/bid")

exports.getBidSuggestion = async (req,res)=>{

 try{

  const { auctionId } = req.params

  const auction = await Auction.findById(auctionId)

  const bids = await Bid.find({auctionId}).sort({createdAt:1})

  let avgIncrement = 100

  if(bids.length > 1){

   let increments = []

   for(let i=1;i<bids.length;i++){
    increments.push(bids[i].amount - bids[i-1].amount)
   }

   avgIncrement = Math.round(
    increments.reduce((a,b)=>a+b,0) / increments.length
   )

  }

  const suggestedBid = auction.currentBid + avgIncrement

  const winProbability = Math.min(
   90,
   50 + bids.length * 5
  )

  let strategy = "Bid early"

  if(bids.length > 5){
   strategy = "Wait for last seconds to bid"
  }

  res.json({
   suggestedBid,
   winProbability,
   strategy
  })

 }catch(err){

  console.error(err)
  res.status(500).json({message:"AI calculation failed"})

 }

}