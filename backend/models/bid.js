const mongoose = require("mongoose")

const bidSchema = new mongoose.Schema({

 userId:String,

 auctionId:String,

 amount:Number,

 createdAt:{
    type:Date,
    default:Date.now
 }

})

module.exports = mongoose.models.Bid || mongoose.model("Bid", bidSchema)