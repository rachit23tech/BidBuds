import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"
import { Navbar, AIAdvisorPanel } from "../components/shared"
import {
  Gavel, Users, TrendingUp, Clock, Search,
  SlidersHorizontal, Sparkles, Zap, Flame, Timer
} from "lucide-react"
 
const font = "'DM Sans', 'Segoe UI', sans-serif"
 
// ─── Auction Card ─────────────────────────────────────────────────────────────
function AuctionCard({ auction, navigate, formatBid, getTimeLeft, isHot }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(auction.endTime))
  const hot = isHot(auction)
 
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeLeft(auction.endTime)), 1000)
    return () => clearInterval(t)
  }, [auction.endTime])
 
  const winScore = auction.aiWinScore ?? Math.min(99, 40 + ((auction.bidderCount || 0) % 60))
 
  return (
    <div
      style={{
        background: "white", borderRadius: "20px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)"
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)"
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "200px", background: "#1e293b", overflow: "hidden" }}>
        {auction.imageUrl ? (
          <img src={auction.imageUrl} alt={auction.itemName} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Gavel size={40} color="#475569" />
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
 
        {/* Top badges */}
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
          {auction.category && (
            <span style={{ background: "rgba(255,255,255,0.9)", color: "#111827", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
              {auction.category}
            </span>
          )}
          {hot && (
            <span style={{ background: "#ef4444", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "3px" }}>
              <Flame size={11} /> HOT
            </span>
          )}
        </div>
 
        {/* Timer */}
        <div style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
          <Timer size={11} /> {timeLeft}
        </div>
 
        {/* Bid + bidders */}
        <div style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>Current Bid</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "white", letterSpacing: "-0.5px" }}>{formatBid(auction.currentBid)}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            <Users size={11} /> {auction.bidderCount || 0}
          </div>
        </div>
      </div>
 
      {/* Card body */}
      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "0 0 12px", lineHeight: 1.3 }}>
          {auction.itemName}
        </h3>
 
        {/* AI Win Score */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
              <Sparkles size={11} color="#2563eb" /> AI Win Score
            </span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>{winScore}%</span>
          </div>
          <div style={{ height: "5px", background: "#e5e7eb", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${winScore}%`, background: "linear-gradient(90deg, #2563eb, #60a5fa)", borderRadius: "99px" }} />
          </div>
        </div>
 
        {/* Join Button */}
        <button
          onClick={() => navigate(`/auction/${auction._id}`)}
          style={{
            width: "100%", padding: "13px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "white", border: "none", borderRadius: "12px",
            fontSize: "14px", fontWeight: "700", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            boxShadow: "0 4px 12px rgba(37,99,235,0.35)", transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(37,99,235,0.45)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.35)" }}
        >
          <Zap size={14} /> Join Auction
        </button>
      </div>
    </div>
  )
}
 
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Auctions() {
  const [auctions, setAuctions] = useState([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Ending Soon")
  const [loading, setLoading] = useState(true)
  const [showAI, setShowAI] = useState(false)
  const navigate = useNavigate()
 
  useEffect(() => { loadAuctions() }, [])
 
  const loadAuctions = async () => {
    setLoading(true)
    try {
      const res = await API.get("/auctions")
      setAuctions(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
 
  const categories = ["All", "Watches", "Fine Art", "Automobiles", "Jewelry", "Fine Wine", "Collectibles"]
 
  const filtered = auctions.filter(a => {
    const matchSearch = a.itemName?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === "All" || a.category?.toLowerCase() === activeCategory.toLowerCase()
    return matchSearch && matchCat
  })
 
  const totalBidders = auctions.reduce((sum, a) => sum + (a.bidderCount || 0), 0)
  const highestBid = auctions.length ? Math.max(...auctions.map(a => a.currentBid || 0)) : 0
  const endingSoon = auctions.filter(a => {
    if (!a.endTime) return false
    return (new Date(a.endTime) - new Date()) < 2 * 60 * 60 * 1000
  }).length
 
  const formatBid = (val) => {
    if (!val && val !== 0) return "$0"
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
    return `$${val}`
  }
 
  const getTimeLeft = (endTime) => {
    if (!endTime) return "N/A"
    const diff = new Date(endTime) - new Date()
    if (diff <= 0) return "Ended"
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m ${s}s`
  }
 
  const isHot = (a) => (a.bidderCount || 0) > 20
 
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", fontFamily: font }}>
 
      {/* AI Advisor Panel */}
      {showAI && (
        <AIAdvisorPanel
          auctions={auctions}
          onClose={() => setShowAI(false)}
          formatBid={formatBid}
        />
      )}
 
      {/* Navbar */}
      <Navbar onAIClick={() => setShowAI(p => !p)} showAI={showAI} />
 
      {/* Main Content */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "32px 24px" }}>
 
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              Live Auctions
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              {auctions.length} active auctions — AI insights enabled
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff1f2", border: "1px solid #fecaca", padding: "8px 16px", borderRadius: "20px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626" }}>LIVE</span>
            <span style={{ fontSize: "13px", color: "#64748b" }}>· {totalBidders} bidders active</span>
          </div>
        </div>
 
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { icon: <Gavel size={20} color="#2563eb" />, value: auctions.length, label: "Active Auctions", bg: "#eff6ff" },
            { icon: <Users size={20} color="#7c3aed" />, value: totalBidders,    label: "Total Bidders",   bg: "#f5f3ff" },
            { icon: <TrendingUp size={20} color="#16a34a" />, value: formatBid(highestBid), label: "Highest Bid", bg: "#f0fdf4" },
            { icon: <Clock size={20} color="#ea580c" />, value: endingSoon,       label: "Ending Soon",    bg: "#fff7ed" },
          ].map(({ icon, value, label, bg }) => (
            <div key={label} style={{ background: "white", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
 
        {/* Search + Sort */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", background: "white", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "0 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <Search size={16} color="#9ca3af" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search auctions..."
              style={{ flex: 1, padding: "13px 0", border: "none", outline: "none", fontSize: "14px", background: "transparent", color: "#111827" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SlidersHorizontal size={16} color="#64748b" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ padding: "12px 16px", border: "1.5px solid #e5e7eb", borderRadius: "12px", fontSize: "13px", fontWeight: "600", color: "#374151", background: "white", outline: "none", cursor: "pointer" }}
            >
              <option>Ending Soon</option>
              <option>Highest Bid</option>
              <option>Most Bidders</option>
              <option>Newest</option>
            </select>
          </div>
        </div>
 
        {/* Category Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
                border: activeCategory === cat ? "none" : "1.5px solid #e5e7eb",
                background: activeCategory === cat ? "#2563eb" : "white",
                color: activeCategory === cat ? "white" : "#374151",
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: activeCategory === cat ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
 
        {/* Auction Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8", fontSize: "15px" }}>
            Loading auctions...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "white", borderRadius: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <Gavel size={40} color="#cbd5e1" style={{ marginBottom: "16px" }} />
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#94a3b8", margin: 0 }}>No auctions found</p>
            <p style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "6px" }}>Check back soon or try a different filter</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {filtered.map(a => (
              <AuctionCard
                key={a._id}
                auction={a}
                navigate={navigate}
                formatBid={formatBid}
                getTimeLeft={getTimeLeft}
                isHot={isHot}
              />
            ))}
          </div>
        )}
      </div>
 
      {/* Footer */}
      <div style={{ borderTop: "1px solid #e5e7eb", background: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px" }}>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>© 2026 BidBudz. AI-powered live auctions.</span>
        <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
        </span>
      </div>
    </div>
  )
}