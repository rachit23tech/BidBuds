const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env") })
 
const express = require("express")
const http = require("http")
const cors = require("cors")
const mongoose = require("mongoose")
const { Server } = require("socket.io")
 
const authRoutes = require("./routes/authRoutes")
const auctionRoutes = require("./routes/auctionRoutes")
const bidRoutes = require("./routes/bidRoutes")
const aiRoutes = require("./routes/ai")
const paymentRoutes = require("./routes/Paymentroutes")
const adminRoutes = require("./routes/adminRoutes")
const notificationRoutes = require("./routes/notificationRoutes")
const profileRoutes = require("./routes/profileRoutes")
const {
  processAuctionSettlementCycle,
} = require("./services/auctionSettlementService")

const app = express()                          // ← app must be created before use
 
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads")) // serve uploaded images
 
// Routes
app.use("/api/auth", authRoutes)
app.use("/api/auctions", auctionRoutes)
app.use("/api/bids", bidRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/admin", adminRoutes) 
app.use("/api/notifications", notificationRoutes)
app.use("/api/profile", profileRoutes)
// MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bidbuds")
 
mongoose.connection.once("open", () => {
  console.log("MongoDB connected")
  processAuctionSettlementCycle(app.get("io")).catch((err) => {
    console.error("Initial settlement cycle failed:", err.message)
  })
  setInterval(() => {
    processAuctionSettlementCycle(app.get("io")).catch((err) => {
      console.error("Settlement cycle failed:", err.message)
    })
  }, 60 * 1000)
})
 
// Create HTTP server
const server = http.createServer(app)
 
// Initialize socket.io
const io = new Server(server, {
  cors: { origin: "*" }
})
 
// store io globally
app.set("io", io)
 
// Socket events
io.on("connection", (socket) => {
 
  console.log("User connected:", socket.id)
 
  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId)
  })

  socket.on("joinUser", (userId) => {
    socket.join(`user:${userId}`)
  })
 
  socket.on("newBid", (data) => {
    io.to(data.auctionId).emit("bidUpdate", data)
  })
 
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
 
})
 
// Test route
app.get("/", (req, res) => {
  res.send("BidBuds API running")
})
 
// Start server
const PORT = Number(process.env.PORT || 5000)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
