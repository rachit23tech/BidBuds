const Auction = require("../models/auction")
const Bid = require("../models/bid")
const User = require("../models/user")

// PLACE BID
exports.placeBid = async (req,res)=>{

 try{

  const { auctionId, amount } = req.body

  const user = await User.findById(req.user.id)

  if(!user){
   return res.status(404).json({message:"User not found"})
  }

  if(user.credits <= 0){
   return res.status(400).json({message:"No credits left"})
  }

  const auction = await Auction.findById(auctionId)

  if(!auction){
   return res.status(404).json({message:"Auction not found"})
  }

  if(amount <= auction.currentBid){
   return res.status(400).json({message:"Bid too low"})
  }

  // update auction
  auction.currentBid = amount
  auction.highestBidder = user._id
  await auction.save()

  // deduct credit
  user.credits -= 1
  await user.save()

  // save bid history
  const bid = new Bid({
   userId:user._id,
   auctionId,
   amount
  })

  await bid.save()

  // emit realtime update
  const io = req.app.get("io")

  if(io){
   io.to(auctionId).emit("bidUpdate",{
    auctionId,
    amount,
    bidder:user.name
   })
  }

  res.json({
   message:"Bid placed",
   currentBid:auction.currentBid
  })

 }catch(err){

  console.error(err)
  res.status(500).json({message:"Server error"})

 }

}



// BID HISTORY
exports.getBidHistory = async (req,res)=>{

 try{

  const { auctionId } = req.params

  const bids = await Bid.find({auctionId})
   .populate("userId","name")
   .sort({createdAt:-1})
   .limit(10)

  res.json(bids)

 }catch(err){

  console.error(err)
  res.status(500).json({message:"Server error"})

 }

}



// LEADERBOARD
exports.getLeaderboard = async (req,res)=>{

 try{

  const { auctionId } = req.params

  const leaderboard = await Bid.aggregate([
   {
    $match:{
     auctionId: require("mongoose").Types.ObjectId(auctionId)
    }
   },
   {
    $group:{
     _id:"$userId",
     totalBids:{ $sum:1 },
     highestBid:{ $max:"$amount" }
    }
   },
   {
    $sort:{ highestBid:-1 }
   }
  ])

  res.json(leaderboard)

 }catch(err){

  console.error(err)
  res.status(500).json({message:"Server error"})

 }

}