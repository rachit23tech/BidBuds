import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import API from "../services/api"
import socket from "../utils/socket"
import { Navbar, AIAdvisorPanel } from "../components/shared"
import {
  Gavel, ArrowLeft, Users, Sparkles, Zap, TrendingUp,
  Clock, Trophy, Crown, Activity, CheckCircle, Bot,
  CreditCard, X, ChevronDown
} from "lucide-react"
 
const font = "'DM Sans', 'Segoe UI', sans-serif"
 
// ── Currency rates (approximate, update as needed) ────────────────────────────
const RATES = { USD: 1, INR: 92.42, EUR: 0.87 }
const SYMBOLS = { USD: "$", INR: "₹", EUR: "€" }
 
// ── Winner Banner ─────────────────────────────────────────────────────────────
function WinnerBanner({ auction, leaders, user, onPay, credits }) {
  const winner = leaders.find((l) => String(l._id) === String(auction?.winnerId)) || leaders[0]
  const isWinner = winner && String(winner._id) === String(user._id)
  const isPendingPayment = auction?.status === "pending_payment"
  const requiredCredits = Math.max(
    0,
    Number(auction?.finalPrice || auction?.currentBid || 0) - Number(credits || 0)
  )
  if (!winner) return null
 
  return (
    <div style={{
      background: isWinner
        ? "linear-gradient(135deg, #1e3a8a, #2563eb)"
        : "linear-gradient(135deg, #1e293b, #334155)",
      borderRadius: "20px", padding: "24px 28px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      marginBottom: "20px", fontFamily: font,
      animation: "fadeUp 0.4s ease",
    }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={24} color="#fbbf24" fill="#fbbf24" />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "3px" }}>
              {isPendingPayment ? "Payment Pending" : (isWinner ? "You Won This Auction" : "Auction Ended")}
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>
              {isWinner ? "Congratulations!" : `Winner: ${winner.name || "Anonymous"}`}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
              Final amount: <span style={{ fontWeight: "800", color: "#fbbf24" }}>${(auction.finalPrice || auction.currentBid || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        {isWinner && isPendingPayment && (
          <button
            onClick={() => onPay(requiredCredits)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "white", color: "#2563eb",
              border: "none", borderRadius: "12px",
              padding: "12px 20px", fontSize: "14px", fontWeight: "800",
              cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              flexShrink: 0,
            }}
          >
            <CreditCard size={16} /> {requiredCredits > 0 ? "Top Up Credits" : "Pay with Wallet Credits"}
          </button>
        )}
      </div>
    </div>
  )
}
 
// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ auction, onClose, neededCredits }) {
  const [currency, setCurrency] = useState("USD")
  const [loading, setLoading] = useState(false)
 
  const amount = Number(neededCredits || auction?.finalPrice || auction?.currentBid || 0)
  const converted = (amount * RATES[currency]).toFixed(2)
  const symbol = SYMBOLS[currency]
 
  const handlePay = async () => {
    setLoading(true)
    try {
      const res = await API.post("/payments/create-credits-checkout", {
        credits: Math.ceil(amount),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      // Redirect to Stripe checkout
      window.location.href = res.data.url
    } catch {
      alert("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 300, backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white", borderRadius: "24px",
        width: "100%", maxWidth: "440px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        zIndex: 301, fontFamily: font, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CreditCard size={20} color="white" />
            <div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "white" }}>Top Up Credits</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Secured by Stripe</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
            <X size={15} color="white" />
          </button>
        </div>
 
        <div style={{ padding: "24px" }}>
          {/* Item summary */}
          <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "14px 16px", marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600", marginBottom: "4px" }}>Credits Required</div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{Math.ceil(amount).toLocaleString()} credits</div>
          </div>
 
          {/* Currency selector */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
              Select Currency
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {["USD", "INR", "EUR"].map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{
                  padding: "10px", borderRadius: "10px", cursor: "pointer",
                  border: currency === c ? "2px solid #2563eb" : "1.5px solid #e5e7eb",
                  background: currency === c ? "#eff6ff" : "white",
                  fontWeight: "700", fontSize: "13px",
                  color: currency === c ? "#2563eb" : "#374151",
                  transition: "all 0.15s",
                }}>
                  {SYMBOLS[c]} {c}
                </button>
              ))}
            </div>
          </div>
 
          {/* Amount display */}
          <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "16px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Total Amount</div>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", letterSpacing: "-1px" }}>
              {symbol}{Number(converted).toLocaleString()}
            </div>
            {currency !== "USD" && (
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>≈ ${amount.toLocaleString()} USD</div>
            )}
          </div>
 
          <div style={{ marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
  Checkout will add credits directly to your BidBudz wallet.
</div>

{/* Pay button */}
          <button
            onClick={handlePay}
            disabled={loading}
            style={{
              width: "100%", padding: "15px",
              background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white", border: "none", borderRadius: "12px",
              fontSize: "15px", fontWeight: "800", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
            }}
          >
            <CreditCard size={16} />
            {loading ? "Redirecting to Stripe..." : `Buy ${Math.ceil(amount).toLocaleString()} Credits`}
          </button>
 
          <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", marginTop: "12px" }}>
            🔒 Secured by Stripe. Your payment info is never stored on our servers.
          </p>
        </div>
      </div>
    </>
  )
}
 
// ─── Main AuctionRoom ─────────────────────────────────────────────────────────
export default function AuctionRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
 
  const [auction, setAuction] = useState(null)
  const [currentBid, setCurrentBid] = useState(0)
  const [bid, setBid] = useState("")
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" })
  const [history, setHistory] = useState([])
  const [leaders, setLeaders] = useState([])
  const [ai, setAI] = useState(null)
  const [bidding, setBidding] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [credits, setCredits] = useState(0)
  const [bidError, setBidError] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentCreditsNeeded, setPaymentCreditsNeeded] = useState(0)
  const [currency, setCurrency] = useState("USD")
  const timerRef = useRef(null)
 
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const token = localStorage.getItem("token")
 
  useEffect(() => {
    loadAuction()
    loadHistory()
    loadLeaderboard()
    loadAI()
    loadCredits()
    socket.emit("joinAuction", id)
    const handleBidUpdate = (data) => {
      if (data.auctionId === id) {
        setCurrentBid(data.amount)
        loadHistory()
        loadLeaderboard()
        loadAuction()
      }
    }
    const handleAuctionStateChange = (data) => {
      if (data.auctionId === id) {
        loadAuction()
        loadLeaderboard()
        loadCredits()
      }
    }
    socket.on("bidUpdate", handleBidUpdate)
    socket.on("auctionSettled", handleAuctionStateChange)
    socket.on("auctionPendingPayment", handleAuctionStateChange)
    return () => {
      socket.off("bidUpdate", handleBidUpdate)
      socket.off("auctionSettled", handleAuctionStateChange)
      socket.off("auctionPendingPayment", handleAuctionStateChange)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [id])
 
  const loadAuction = async () => {
    try {
      const res = await API.get("/auctions")
      const a = res.data.find(x => x._id === id)
      if (!a) return
      setAuction(a)
      setCurrentBid(a.currentBid)
      startTimer(a.endTime)
    } catch (err) { console.error(err) }
  }
 
  const loadAI = async () => {
    try {
      const res = await API.get(`/ai/suggest/${id}`)
      setAI(res.data)
    } catch (err) { console.error(err) }
  }
 
  const loadCredits = async () => {
    try {
      const res = await API.get("/bids/credits", { headers: { Authorization: `Bearer ${token}` } })
      setCredits(res.data.credits ?? 0)
    } catch (err) { console.error(err) }
  }
 
  const loadHistory = async () => {
    try {
      const res = await API.get(`/bids/history/${id}`)
      setHistory(res.data)
    } catch (err) { console.error(err) }
  }
 
  const loadLeaderboard = async () => {
    try {
      const res = await API.get(`/bids/leaderboard/${id}`)
      setLeaders(res.data)
    } catch (err) { console.error(err) }
  }
 
  const startTimer = (endTime) => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const diff = new Date(endTime) - new Date()
      if (diff <= 0) {
        setTimeLeft({ h: "00", m: "00", s: "00", ended: true })
        clearInterval(timerRef.current)
        return
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0")
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0")
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0")
      setTimeLeft({ h, m, s })
    }, 1000)
  }
 
  const placeBid = async (amount) => {
    const finalBid = amount || Number(bid)
    if (!finalBid) return
    setBidError(null)
    setBidding(true)
    try {
      const res = await API.post("/bids/place",
        { auctionId: id, amount: finalBid },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCurrentBid(res.data.currentBid)
      setCredits(res.data.credits ?? 0)
      setBid("")
      loadHistory()
      loadLeaderboard()
    } catch (err) {
      const msg = err.response?.data?.error || "Bid failed. Please try again."
      setBidError(msg)
      if (err.response?.data?.credits !== undefined) setCredits(err.response.data.credits)
    } finally {
      setBidding(false)
    }
  }

  const payWinningBidFromWallet = async () => {
    try {
      const res = await API.post(
        "/payments/pay-winning-bid",
        { auctionId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCredits(res.data.credits ?? 0)
      loadAuction()
      loadLeaderboard()
      loadHistory()
    } catch (err) {
      const msg = err.response?.data?.error || "Unable to pay winning bid right now."
      alert(msg)
      if (err.response?.data?.required) {
        setPaymentCreditsNeeded(err.response.data.required)
        setShowPayment(true)
      }
    }
  }
 
  // Currency conversion helpers
  const convertAmount = (usd) => {
    if (!usd && usd !== 0) return "—"
    const val = usd * RATES[currency]
    const sym = SYMBOLS[currency]
    if (val >= 1000000) return `${sym}${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${sym}${(val / 1000).toFixed(1)}K`
    return `${sym}${val.toFixed(currency === "USD" ? 0 : 0)}`
  }
 
  const minBid = currentBid + 100
  const aboveBase = auction && (auction.startingBid || auction.basePrice) > 0
    ? Math.min(999, Math.round(((currentBid - (auction.startingBid || auction.basePrice || 0)) / (auction.startingBid || auction.basePrice || 1)) * 100))
    : 0
  const isEnded = timeLeft.ended || (auction?.endTime && new Date(auction.endTime) < new Date())
 
  const getInitials = (name) => {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }
  const isMe = (bidUserId) => bidUserId === user._id || bidUserId?.toString() === user._id?.toString()
 
  if (!auction) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6fb", fontFamily: font }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        <p style={{ color: "#64748b", fontWeight: "600" }}>Loading auction...</p>
      </div>
    </div>
  )
 
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", fontFamily: font }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .bid-btn:hover { opacity:0.88; transform:translateY(-1px); }
        .quick-btn:hover { background:#e5e7eb !important; }
        .hist-row:hover { background:#f8fafc !important; }
      `}</style>
 
      {showAI && <AIAdvisorPanel auctions={auction ? [auction] : []} onClose={() => setShowAI(false)} formatBid={convertAmount} />}
      {showPayment && <PaymentModal auction={auction} neededCredits={paymentCreditsNeeded} onClose={() => setShowPayment(false)} />}
 
      <Navbar onAIClick={() => setShowAI(p => !p)} showAI={showAI} credits={credits} />
 
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "24px" }}>
 
        {/* Back */}
        <div onClick={() => navigate("/auctions")} style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "20px", width: "fit-content" }}>
          <ArrowLeft size={15} /> Back to Auctions
        </div>
 
        {/* Winner Banner — shows when auction ended */}
        {isEnded && (leaders.length > 0 || auction?.winnerId) && (
          <WinnerBanner
            auction={{ ...auction, currentBid }}
            leaders={leaders}
            user={user}
            credits={credits}
            onPay={(needed) => {
              if (needed > 0) {
                setPaymentCreditsNeeded(needed)
                setShowPayment(true)
              } else {
                payWinningBidFromWallet()
              }
            }}
          />
        )}
 
        {/* Currency selector */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px", gap: "6px" }}>
          {["USD", "INR", "EUR"].map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{
              padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
              border: currency === c ? "none" : "1.5px solid #e5e7eb",
              background: currency === c ? "#2563eb" : "white",
              color: currency === c ? "white" : "#374151",
              cursor: "pointer", transition: "all 0.15s",
              boxShadow: currency === c ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
            }}>
              {SYMBOLS[c]} {c}
            </button>
          ))}
        </div>
 
        {/* 3-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 320px", gap: "20px", alignItems: "start" }}>
 
          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
 
            {/* Item card */}
            <div style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ position: "relative", height: "200px", background: "#1e293b" }}>
                {auction.imageUrl
                  ? <img src={auction.imageUrl} alt={auction.itemName} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Gavel size={48} color="#475569" /></div>
                }
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent 60%)" }} />
                {auction.category && (
                  <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(255,255,255,0.92)", color: "#111827", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                    {auction.category}
                  </div>
                )}
                {isEnded && (
                  <div style={{ position: "absolute", top: "12px", right: "12px", background: "#ef4444", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                    ENDED
                  </div>
                )}
                <div style={{ position: "absolute", bottom: "12px", left: "12px" }}>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "white" }}>{auction.itemName}</div>
                </div>
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b" }}>
                    <Users size={14} /> {auction.bidderCount || 0} bidders
                  </div>
                  {!isEnded && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#fef2f2", color: "#dc2626", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#dc2626", animation: "pulse 1.5s infinite" }} /> LIVE
                    </div>
                  )}
                </div>
                {auction.description && <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6, margin: "0 0 12px" }}>{auction.description}</p>}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginBottom: "2px" }}>Base Price</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{convertAmount(auction.startingBid || auction.basePrice || 0)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginBottom: "2px" }}>Total Bids</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{history.length}</div>
                  </div>
                </div>
              </div>
            </div>
 
            {/* AI Assistant */}
            <div style={{ background: "linear-gradient(135deg, #1e40af, #2563eb, #3b82f6)", borderRadius: "20px", padding: "20px", boxShadow: "0 4px 24px rgba(37,99,235,0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Bot size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "white" }}>AI Assistant</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)" }}>Powered by BidBudz AI</div>
                  </div>
                </div>
                <Sparkles size={16} color="rgba(255,255,255,0.6)" />
              </div>
 
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Suggested Bid</div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: "white", letterSpacing: "-0.5px" }}>
                  {ai?.suggestedBid ? convertAmount(ai.suggestedBid) : convertAmount(minBid + 50)}
                </div>
                <button onClick={() => setBid(String(ai?.suggestedBid || minBid + 50))}
                  style={{ marginTop: "8px", width: "100%", padding: "10px", background: "white", color: "#2563eb", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                  Use This Amount
                </button>
              </div>
 
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", marginBottom: "12px" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Winning Probability</div>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "white" }}>
                  {ai?.winProbability ?? 68}%
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "rgba(255,255,255,0.6)", marginLeft: "8px" }}>if you bid now</span>
                </div>
                <div style={{ marginTop: "8px", height: "6px", background: "rgba(255,255,255,0.2)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${ai?.winProbability ?? 68}%`, background: "linear-gradient(90deg, #4ade80, #22c55e)", borderRadius: "99px" }} />
                </div>
              </div>
 
              {(ai?.strategy || ["Wait until the last 2 minutes", "Bid in odd amounts to stand out", "Set your max and stay patient"]).slice(0, 3).map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white", flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.5 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
 
          {/* ── CENTER ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
 
            {/* Current Bid */}
            <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", textAlign: "center" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>Current Bid</div>
              <div style={{ fontSize: "52px", fontWeight: "800", color: "#0f172a", letterSpacing: "-2px", lineHeight: 1 }}>
                {convertAmount(currentBid)}
              </div>
              {currency !== "USD" && (
                <div style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}>${currentBid.toLocaleString()} USD</div>
              )}
              {aboveBase > 0 && aboveBase <= 999 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", marginTop: "8px", fontSize: "13px", color: "#16a34a", fontWeight: "600" }}>
                  <TrendingUp size={14} /> {aboveBase}% above base price
                </div>
              )}
            </div>
 
            {/* Timer */}
            <div style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
                <Clock size={13} /> {isEnded ? "Auction Ended" : "Time Remaining"}
              </div>
              {isEnded
                ? <div style={{ fontSize: "24px", fontWeight: "800", color: "#ef4444" }}>00:00:00</div>
                : <div style={{ fontSize: "48px", fontWeight: "800", color: "#0f172a", letterSpacing: "4px", fontVariantNumeric: "tabular-nums" }}>{timeLeft.h}:{timeLeft.m}:{timeLeft.s}</div>
              }
            </div>
 
            {/* Place Bid */}
            {!isEnded && (
              <div style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Your Bid Amount</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    background: credits < minBid ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${credits < minBid ? "#fecaca" : "#bbf7d0"}`,
                    borderRadius: "20px", padding: "4px 10px",
                    fontSize: "12px", fontWeight: "700",
                    color: credits < minBid ? "#dc2626" : "#16a34a",
                  }}>
                    💳 {credits.toLocaleString()} credits
                  </div>
                </div>
 
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "0 16px", background: "#f9fafb", marginBottom: "12px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "700", color: "#9ca3af", marginRight: "8px" }}>$</span>
                  <input type="number" value={bid} onChange={e => setBid(e.target.value)} placeholder={String(minBid)}
                    style={{ flex: 1, padding: "14px 0", border: "none", background: "transparent", outline: "none", fontSize: "18px", fontWeight: "700", color: "#0f172a" }} />
                </div>
 
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" }}>
                  {[100, 250, 500, 1000].map(inc => (
                    <button key={inc} className="quick-btn"
                      onClick={() => setBid(String((Number(bid) || currentBid) + inc))}
                      style={{ padding: "9px", background: "#f1f5f9", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: "700", color: "#374151", cursor: "pointer", transition: "all 0.15s" }}>
                      +${inc}
                    </button>
                  ))}
                </div>
 
                {bidError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", fontWeight: "600", color: "#dc2626", marginBottom: "12px" }}>
                    ⚠️ {bidError}
                  </div>
                )}
 
                <button className="bid-btn" onClick={() => placeBid()} disabled={bidding}
                  style={{
                    width: "100%", padding: "16px",
                    background: bidding ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "white", border: "none", borderRadius: "14px",
                    fontSize: "16px", fontWeight: "800", cursor: bidding ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    boxShadow: "0 4px 16px rgba(37,99,235,0.4)", transition: "all 0.15s",
                  }}>
                  <Zap size={18} /> {bidding ? "Placing bid..." : "Place Bid"}
                </button>
                <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "10px", marginBottom: 0 }}>
                  Min. bid: ${minBid} · All bids are binding
                </p>
              </div>
            )}
 
            {/* Bid Activity */}
            <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                <Activity size={15} color="#2563eb" />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Bid Activity</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px" }}>
                {(history.length > 0 ? history.slice(-12) : Array(12).fill(null)).map((b, i, arr) => {
                  const maxAmt = Math.max(...arr.filter(Boolean).map(x => x.amount || 0), 1)
                  const h = b ? Math.max(20, (b.amount / maxAmt) * 100) : 10 + (i * 3)
                  return <div key={i} style={{ flex: 1, height: `${h}%`, background: i === arr.length - 1 ? "#2563eb" : "#e2e8f0", borderRadius: "4px 4px 0 0" }} />
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Earlier</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>Now</span>
              </div>
            </div>
          </div>
 
          {/* ── RIGHT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
 
            {/* Live Bid History */}
            <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={15} color="#f59e0b" />
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Live Bid History</span>
                </div>
                {!isEnded && <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "700", color: "#16a34a" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", animation: "pulse 1.5s infinite" }} /> Live
                </div>}
              </div>
              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {history.length === 0
                  ? <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No bids yet</div>
                  : history.map((b, i) => {
                    const me = isMe(b.userId?._id || b.userId)
                    const name = b.userId?.name || "Bidder"
                    return (
                      <div key={i} className="hist-row" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #f8fafc", background: me ? "#f0f6ff" : "white", transition: "background 0.15s" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: me ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: me ? "white" : "#64748b", flexShrink: 0 }}>
                          {getInitials(name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: me ? "#2563eb" : "#0f172a" }}>{me ? "You" : name}</span>
                            {me && <span style={{ background: "#dbeafe", color: "#2563eb", fontSize: "9px", fontWeight: "700", padding: "1px 6px", borderRadius: "20px" }}>YOU</span>}
                            {i === 0 && <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "9px", fontWeight: "700", padding: "1px 6px", borderRadius: "20px" }}>TOP</span>}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>{i === 0 ? "just now" : `${i + 1}m ago`}</div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: me ? "#2563eb" : "#0f172a" }}>{convertAmount(b.amount)}</div>
                      </div>
                    )
                  })}
              </div>
            </div>
 
            {/* Top Bidders */}
            <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "8px" }}>
                <Trophy size={15} color="#f59e0b" />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Top Bidders</span>
              </div>
              <div>
                {leaders.length === 0
                  ? <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>No bidders yet</div>
                  : leaders.slice(0, 5).map((l, i) => {
                    const me = isMe(l._id)
                    const name = l.name || `Bidder ${i + 1}`
                    const crownColors = ["#f59e0b", "#94a3b8", "#cd7c2f"]
                    return (
                      <div key={i} className="hist-row" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #f8fafc", background: me ? "#f0f6ff" : "white", transition: "background 0.15s" }}>
                        <div style={{ width: "24px", textAlign: "center", flexShrink: 0 }}>
                          {i < 3 ? <Crown size={16} color={crownColors[i]} fill={crownColors[i]} /> : <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8" }}>#{i + 1}</span>}
                        </div>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: me ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: me ? "white" : "#64748b", flexShrink: 0 }}>
                          {getInitials(name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: me ? "#2563eb" : "#0f172a" }}>{me ? "You" : name}</span>
                            {me && <span style={{ background: "#dbeafe", color: "#2563eb", fontSize: "9px", fontWeight: "700", padding: "1px 6px", borderRadius: "20px" }}>YOU</span>}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{l.bidCount || "—"} bids</div>
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: me ? "#2563eb" : "#0f172a" }}>{convertAmount(l.highestBid)}</div>
                      </div>
                    )
                  })}
              </div>
            </div>
 
            {/* Auction Rules */}
            <div style={{ background: "white", borderRadius: "20px", padding: "16px 20px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <CheckCircle size={15} color="#64748b" />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Auction Rules</span>
              </div>
              {["All bids are final and binding", "Minimum increment: $100", "Winner pays within 24 hours", "Buyer's premium: 15% of final bid"].map((rule, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#94a3b8", flexShrink: 0, marginTop: "6px" }} />
                  <span style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      {/* Footer */}
      <div style={{ borderTop: "1px solid #e5e7eb", background: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>© 2026 BidBudz. AI-powered live auctions.</span>
        <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
        </span>
      </div>
    </div>
  )
}


