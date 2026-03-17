// src/components/shared.jsx
// Shared Navbar, Notification Panel, and AI Advisor Panel
// Used by both auctions.jsx and auctionRoom.jsx
 
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"
import socket from "../utils/socket"
import {
  Gavel, Sparkles, Bell, ChevronDown, LogOut, User,
  X, Bot, TrendingUp, TrendingDown, AlertTriangle,
  Star, ArrowRight, RefreshCw, Zap, BarChart2
} from "lucide-react"
 
const font = "'DM Sans', 'Segoe UI', sans-serif"
 
// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar({ onAIClick, showAI, showAdmin, credits }) {
  const navigate = useNavigate()
  const path = window.location.pathname
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"
 
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [walletCredits, setWalletCredits] = useState(
    credits ?? (typeof user.credits === "number" ? user.credits : null)
  )
  const displayedCredits = credits ?? walletCredits

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

    const loadCredits = async () => {
      try {
        const res = await API.get("/bids/credits", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setWalletCredits(Number(res.data?.credits ?? 0))
      } catch (err) {
        console.error("Failed to load credits", err)
      }
    }

    loadCredits()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token || !user?._id) return

    socket.emit("joinUser", String(user._id))

    const loadNotifications = async () => {
      try {
        const res = await API.get("/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setNotifications(res.data || [])
      } catch (err) {
        console.error("Failed to load notifications", err)
      }
    }

    const onIncoming = (payload) => {
      setNotifications((prev) => [payload, ...prev])
    }

    loadNotifications()
    socket.on("notification", onIncoming)

    return () => {
      socket.off("notification", onIncoming)
    }
  }, [user?._id])
 
  const signOut = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const openProfile = () => {
    setShowDropdown(false)
    navigate("/profile")
  }
 
  const unread = notifications.filter(n => !n.read).length

  const typeStyle = (type) => {
    if (type === "outbid") return { color: "#ef4444", bg: "#fef2f2", icon: <Bell size={15} color="#ef4444" /> }
    if (type === "winner" || type === "winner_promoted") return { color: "#16a34a", bg: "#f0fdf4", icon: <Gavel size={15} color="#16a34a" /> }
    if (type === "payment_required" || type === "payment_expired") return { color: "#d97706", bg: "#fffbeb", icon: <Sparkles size={15} color="#d97706" /> }
    return { color: "#2563eb", bg: "#eff6ff", icon: <Sparkles size={15} color="#2563eb" /> }
  }

  const formatTime = (value) => {
    if (!value) return "Now"
    return new Date(value).toLocaleString()
  }

  const markOneRead = async (id) => {
    const token = localStorage.getItem("token")
    setNotifications((prev) => prev.map((x) => (x._id === id ? { ...x, read: true } : x)))
    try {
      await API.post(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (err) {
      console.error("Failed to mark read", err)
    }
  }

  const markAllRead = async () => {
    const token = localStorage.getItem("token")
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })))
    try {
      await API.post("/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (err) {
      console.error("Failed to mark all read", err)
    }
  }
 
  return (
    <nav style={{
      background: "white", borderBottom: "1px solid #e5e7eb",
      padding: "0 32px", height: "60px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100, fontFamily: font,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          width: "36px", height: "36px", borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
        }}>
          <Gavel size={18} color="white" />
        </div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", lineHeight: 1.1 }}>BidBudz</div>
          <div style={{ fontSize: "9px", fontWeight: "600", color: "#2563eb", letterSpacing: "0.8px", textTransform: "uppercase" }}>
            AI Powered Auctions
          </div>
        </div>
      </div>
 
      {/* Nav links */}
      <div style={{ display: "flex", gap: "6px" }}>
        <div
          onClick={() => navigate("/auctions")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: !path.includes("/admin") ? "#eff6ff" : "transparent",
            color: !path.includes("/admin") ? "#2563eb" : "#64748b",
            padding: "8px 16px", borderRadius: "10px",
            fontSize: "13px", fontWeight: "600", cursor: "pointer",
          }}
        >
          <Gavel size={14} /> Live Auctions
        </div>
        {showAdmin !== false && (
          <div
            onClick={() => navigate("/admin")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: path.includes("/admin") ? "#eff6ff" : "transparent",
              color: path.includes("/admin") ? "#2563eb" : "#64748b",
              padding: "8px 16px", borderRadius: "10px",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}
          >
            <BarChart2 size={14} /> Admin
          </div>
        )}
      </div>
 
      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
 
        {/* Credits Badge — clickable to buy more */}
        {displayedCredits !== null && displayedCredits !== undefined && (
          <div
            onClick={() => navigate("/buy-credits")}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: "#fffbeb", border: "1px solid #fde68a",
              padding: "6px 12px", borderRadius: "20px",
              fontSize: "12px", fontWeight: "700", color: "#d97706",
              cursor: "pointer", transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
            onMouseLeave={e => e.currentTarget.style.background = "#fffbeb"}
            title="Buy more credits"
          >
            💳 {displayedCredits.toLocaleString()} <span style={{ fontSize: "10px", opacity: 0.7 }}>+ Buy</span>
          </div>
        )}
 
 
        {/* AI Active button */}
        <button
          onClick={onAIClick}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: showAI ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#f0fdf4",
            color: showAI ? "white" : "#16a34a",
            padding: "7px 14px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "700",
            border: "none", cursor: "pointer",
            boxShadow: showAI ? "0 4px 12px rgba(37,99,235,0.35)" : "none",
            transition: "all 0.2s",
          }}
          title="Open AI Bidding Advisor"
        >
          <Sparkles size={12} /> AI Active
        </button>
 
        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <div onClick={() => setShowNotifications(p => !p)} style={{ cursor: "pointer", position: "relative" }}>
            <Bell size={20} color={showNotifications ? "#2563eb" : "#64748b"} />
            {unread > 0 && (
              <div style={{
                position: "absolute", top: "-3px", right: "-3px",
                width: "16px", height: "16px", borderRadius: "50%",
                background: "#ef4444", border: "2px solid white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "9px", fontWeight: "700", color: "white",
              }}>
                {unread}
              </div>
            )}
          </div>
 
          {showNotifications && (
            <>
              <div onClick={() => setShowNotifications(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                background: "white", borderRadius: "16px", width: "320px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #f1f5f9", zIndex: 100, overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Notifications</span>
                  {unread > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>
                        {unread} new
                      </span>
                      <span
                        onClick={markAllRead}
                        style={{ fontSize: "11px", color: "#94a3b8", cursor: "pointer", fontWeight: "600" }}
                      >
                        Mark all read
                      </span>
                    </div>
                  )}
                </div>
 
                {/* List */}
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  {notifications.map(n => {
                    const style = typeStyle(n.type)
                    return (
                    <div
                      key={n._id}
                      onClick={() => markOneRead(n._id)}
                      style={{
                        padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "12px",
                        background: n.read ? "white" : "#fafbff",
                        borderBottom: "1px solid #f8fafc", cursor: "pointer", transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? "white" : "#fafbff"}
                    >
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                        background: style.bg, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {style.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: n.read ? "500" : "700", color: "#0f172a", lineHeight: 1.3 }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", lineHeight: 1.4 }}>
                          {n.body}
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                          {formatTime(n.createdAt)}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#2563eb", flexShrink: 0, marginTop: "4px" }} />
                      )}
                    </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
 
        {/* User dropdown */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowDropdown(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <div style={{
              width: "34px", height: "34px", borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "12px", fontWeight: "700",
            }}>
              {initials}
            </div>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{user.name || "User"}</span>
            <ChevronDown size={14} color="#64748b" style={{
              transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }} />
          </div>
 
          {showDropdown && (
            <>
              <div onClick={() => setShowDropdown(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                background: "white", borderRadius: "14px", minWidth: "200px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                border: "1px solid #f1f5f9", zIndex: 100, overflow: "hidden",
              }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{user.name || "User"}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{user.email || ""}</div>
                </div>
                <div
                  onClick={openProfile}
                  style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#1e3a8a", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid #f8fafc" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <User size={14} /> Profile
                </div>
                <div
                  onClick={signOut}
                  style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#ef4444", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fff1f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <LogOut size={14} /> Sign out
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
 
// ─── AI Advisor Panel ─────────────────────────────────────────────────────────
export function AIAdvisorPanel({ auctions, onClose, formatBid }) {
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
 
  const fetchAdvice = async () => {
    if (!auctions.length) { setError("No live auctions to analyze yet."); return }
    setLoading(true); setError(null); setAdvice(null)
 
    const auctionSummary = auctions.map(a => ({
      id: a._id,
      name: a.itemName,
      category: a.category || "General",
      currentBid: a.currentBid || 0,
      bidderCount: a.bidderCount || 0,
      endTime: a.endTime,
      startingBid: a.startingBid || 0,
    }))
 
    const timeLeftMap = {}
    auctions.forEach(a => {
      if (a.endTime) {
        const diff = new Date(a.endTime) - new Date()
        timeLeftMap[a._id] = diff > 0
          ? (Math.floor(diff / 3600000) > 0 ? `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m` : `${Math.floor((diff % 3600000) / 60000)}m`)
          : "Ended"
      } else { timeLeftMap[a._id] = "Unknown" }
    })
 
    try {
      const res = await API.post("/ai/advice", {
        auctions: auctionSummary.map(a => ({ ...a, timeLeft: timeLeftMap[a.id] }))
      })
      setAdvice(res.data)
    } catch {
      setError("Failed to get AI analysis. Please try again.")
    } finally {
      setLoading(false)
    }
  }
 
  useEffect(() => { fetchAdvice() }, [])
 
  const auctionMap = {}
  auctions.forEach(a => { auctionMap[a._id] = a })
 
  const confidenceColor = (c) => {
    if (c === "High")   return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" }
    if (c === "Medium") return { bg: "#fffbeb", color: "#d97706", border: "#fde68a" }
    return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" }
  }
 
  const riskColor = (r) => r === "Low Risk" ? "#16a34a" : r === "Medium Risk" ? "#d97706" : "#dc2626"
 
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 200, backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "440px",
        background: "white", zIndex: 201, boxShadow: "-8px 0 48px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column", fontFamily: font,
        animation: "slideIn 0.25s ease",
      }}>
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
          @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          .ai-card:hover { background: #f8faff !important; }
        `}</style>
 
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "white" }}>AI Bidding Advisor</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "4px" }}>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={fetchAdvice} disabled={loading} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: loading ? "not-allowed" : "pointer", display: "flex" }} title="Refresh">
              <RefreshCw size={15} color="white" style={loading ? { animation: "spin 1s linear infinite" } : {}} />
            </button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
              <X size={15} color="white" />
            </button>
          </div>
        </div>
 
        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#64748b", margin: "0 0 4px" }}>Analyzing all auctions...</p>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>AI is evaluating bids, competition & timing</p>
            </div>
          )}
 
          {error && !loading && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#dc2626", margin: "0 0 4px" }}>Analysis Failed</p>
                <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0 }}>{error}</p>
              </div>
            </div>
          )}
 
          {advice && !loading && (
            <div>
              {/* Overview */}
              <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Sparkles size={14} color="#2563eb" />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>AI Market Overview</span>
                </div>
                <p style={{ fontSize: "13px", color: "#1e40af", lineHeight: 1.6, margin: 0 }}>{advice.overview}</p>
              </div>
 
              {/* Auction cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {advice.auctions?.map(rec => {
                  const auction = auctionMap[rec.id]
                  if (!auction) return null
                  const isTopPick = advice.topPick === rec.id
                  const cc = confidenceColor(rec.confidence)
                  return (
                    <div key={rec.id} className="ai-card" style={{ border: isTopPick ? "2px solid #2563eb" : "1.5px solid #e5e7eb", borderRadius: "16px", padding: "16px", background: isTopPick ? "#f0f6ff" : "white", transition: "background 0.15s", position: "relative" }}>
                      {isTopPick && (
                        <div style={{ position: "absolute", top: "-10px", left: "14px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "3px" }}>
                          <Star size={9} fill="white" /> TOP PICK
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px", marginTop: isTopPick ? "6px" : 0 }}>
                        <div style={{ flex: 1, marginRight: "8px" }}>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{auction.itemName}</div>
                          {auction.category && <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{auction.category}</div>}
                        </div>
                        <div style={{ background: rec.worthIt ? "#f0fdf4" : "#fef2f2", color: rec.worthIt ? "#16a34a" : "#dc2626", border: `1px solid ${rec.worthIt ? "#bbf7d0" : "#fecaca"}`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "700", flexShrink: 0, display: "flex", alignItems: "center", gap: "3px" }}>
                          {rec.worthIt ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {rec.worthIt ? "Worth It" : "Skip"}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "10px 12px" }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "3px" }}>Current Bid</div>
                          <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{formatBid(auction.currentBid)}</div>
                        </div>
                        <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "10px 12px" }}>
                          <div style={{ fontSize: "10px", color: "#93c5fd", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "3px" }}>Recommended Bid</div>
                          <div style={{ fontSize: "16px", fontWeight: "800", color: "#2563eb" }}>{formatBid(rec.recommendedBid)}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                        <span style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.border}`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600" }}>{rec.confidence} Confidence</span>
                        <span style={{ background: "#f8fafc", color: riskColor(rec.risk), border: "1px solid #e5e7eb", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600" }}>{rec.risk}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5, margin: "0 0 12px", padding: "10px 12px", background: "#f8fafc", borderRadius: "10px", borderLeft: "3px solid #e5e7eb" }}>{rec.reason}</p>
                      {rec.worthIt && (
                        <button onClick={() => { window.location.href = `/auction/${rec.id}` }} style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                          <Zap size={12} /> Bid Now <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
              <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", marginTop: "20px", lineHeight: 1.5 }}>
                AI recommendations are based on current data. Always bid within your budget.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
