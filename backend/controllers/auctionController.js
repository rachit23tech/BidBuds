const Auction = require("../models/auction")

exports.createAuction = async (req,res)=>{

 try{

 const {itemName,basePrice,endTime} = req.body

 const auction = new Auction({
  itemName,
  basePrice,
  currentBid:basePrice,
  endTime
 })

 await auction.save()

 res.json(auction)

 }catch(err){
  res.status(500).json(err)
 }

}


exports.getAuctions = async (req,res)=>{

 const auctions = await Auction.find()

 res.json(auctions)

}