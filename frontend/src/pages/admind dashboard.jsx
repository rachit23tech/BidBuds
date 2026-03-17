import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"
import { Navbar } from "../components/shared"
import {
  Gavel, TrendingUp, Users, DollarSign, Plus, Search,
  Clock, ExternalLink, MoreVertical, Sparkles,
  BarChart2, ChevronLeft, ChevronRight, ImageIcon, X,
  Upload, Bot, RefreshCw, AlertTriangle, ArrowUp, ArrowDown,
  Minus, TrendingDown, Zap, CheckCircle, CreditCard, Send
} from "lucide-react"
 
const font = "'DM Sans', 'Segoe UI', sans-serif"
const CATEGORIES = ["Watches", "Fine Art", "Automobiles", "Jewelry", "Fine Wine", "Collectibles", "Instruments", "Other"]
 
const formatMoney = (val) => {
  if (!val && val !== 0) return "—"
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`
  return `$${val}`
}
 
const formatDate = (d) => {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}
 
const getStatus = (a) => {
  if (a?.status === "awaiting_admin") return "awaiting_admin"
  if (a?.status === "pending_payment") return "pending_payment"
  if (a?.status === "sold") return "sold"
  if (!a.endTime) return "live"
  return new Date(a.endTime) < new Date() ? "ended" : "live"
}
 
// ─── AI Price Advisor Panel ───────────────────────────────────────────────────
function AIPriceAdvisor({ itemName, category, onUsePrice, onClose }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
 
  const analyze = async () => {
    if (!itemName?.trim()) { setError("Please enter an item name first."); return }
    setLoading(true); setError(null); setAnalysis(null)
 
    try {
      const res = await API.post("/ai/price", { itemName, category })
      setAnalysis(res.data)
    } catch (err) {
      setError("Failed to get AI price analysis. Please try again.")
    } finally {
      setLoading(false)
    }
  }
 
  useEffect(() => { if (itemName?.trim()) analyze() }, [])
 
  const sentimentColor = (s) => {
    if (s === "bullish") return "#16a34a"
    if (s === "bearish") return "#dc2626"
    return "#d97706"
  }
 
  const sentimentBg = (s) => {
    if (s === "bullish") return "#f0fdf4"
    if (s === "bearish") return "#fef2f2"
    return "#fffbeb"
  }
 
  const recommendColor = (r) => {
    if (r === "Price Higher") return "#16a34a"
    if (r === "Price Lower") return "#dc2626"
    return "#d97706"
  }
 
  const recommendIcon = (r) => {
    if (r === "Price Higher") return <ArrowUp size={13} />
    if (r === "Price Lower") return <ArrowDown size={13} />
    return <Minus size={13} />
  }
 
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 200, backdropFilter: "blur(2px)" }} />
 
      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "420px",
        background: "white", zIndex: 201,
        boxShadow: "-8px 0 48px rgba(0,0,0,0.15)",
        display: "flex", flexDirection: "column", fontFamily: font,
        animation: "slideIn 0.25s ease",
      }}>
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
          @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        `}</style>
 
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "white" }}>AI Price Advisor</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Sparkles size={10} /> Market analysis for "{itemName}"
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={analyze} disabled={loading} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: loading ? "not-allowed" : "pointer", display: "flex" }}>
              <RefreshCw size={15} color="white" style={loading ? { animation: "spin 1s linear infinite" } : {}} />
            </button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", display: "flex" }}>
              <X size={15} color="white" />
            </button>
          </div>
        </div>
 
        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
 
          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontSize: "14px", fontWeight: "600", color: "#64748b", margin: "0 0 4px" }}>Analyzing market data...</p>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>Checking comparable sales & demand trends</p>
            </div>
          )}
 
          {/* Error */}
          {error && !loading && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", display: "flex", gap: "10px" }}>
              <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "#dc2626", margin: "0 0 4px" }}>Analysis Failed</p>
                <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0 }}>{error}</p>
              </div>
            </div>
          )}
 
          {/* Results */}
          {analysis && !loading && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
 
              {/* Recommendation banner */}
              <div style={{
                background: `linear-gradient(135deg, ${sentimentBg(analysis.sentiment)}, white)`,
                border: `1.5px solid ${sentimentColor(analysis.sentiment)}33`,
                borderRadius: "14px", padding: "16px", marginBottom: "16px",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: sentimentBg(analysis.sentiment), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {analysis.sentiment === "bullish" ? <TrendingUp size={20} color={sentimentColor(analysis.sentiment)} /> :
                   analysis.sentiment === "bearish" ? <TrendingDown size={20} color={sentimentColor(analysis.sentiment)} /> :
                   <Minus size={20} color={sentimentColor(analysis.sentiment)} />}
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: sentimentColor(analysis.sentiment), textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Market is {analysis.sentiment}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                    {analysis.recommendation}
                  </div>
                </div>
              </div>
 
              {/* Price range */}
              <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                  Suggested Price Range
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                  {[
                    { label: "Conservative", value: analysis.priceLow, color: "#64748b", bg: "#f8fafc" },
                    { label: "Optimal", value: analysis.priceRecommended, color: "#2563eb", bg: "#eff6ff" },
                    { label: "Aggressive", value: analysis.priceHigh, color: "#7c3aed", bg: "#f5f3ff" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} style={{ background: bg, borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                      <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "600", marginBottom: "4px" }}>{label}</div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color }}>{formatMoney(value)}</div>
                    </div>
                  ))}
                </div>
 
                {/* Use optimal price button */}
                <button
                  onClick={() => { onUsePrice(analysis.priceRecommended); onClose() }}
                  style={{
                    width: "100%", padding: "11px",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "white", border: "none", borderRadius: "10px",
                    fontSize: "13px", fontWeight: "700", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    boxShadow: "0 3px 10px rgba(37,99,235,0.35)",
                  }}
                >
                  <Zap size={14} /> Use Optimal Price ({formatMoney(analysis.priceRecommended)})
                </button>
              </div>
 
              {/* Market insight */}
              <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "14px", padding: "14px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Sparkles size={13} color="#2563eb" />
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>Market Insight</span>
                </div>
                <p style={{ fontSize: "13px", color: "#1e40af", lineHeight: 1.6, margin: 0 }}>{analysis.insight}</p>
              </div>
 
              {/* Comparable sales */}
              {analysis.comparables?.length > 0 && (
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                    Recent Comparable Sales
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {analysis.comparables.map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#f8fafc", borderRadius: "8px" }}>
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{c.name}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{c.date}</div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>{formatMoney(c.price)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
 
              {/* Demand factors */}
              {analysis.factors?.length > 0 && (
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: "14px", padding: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                    Pricing Factors
                  </div>
                  {analysis.factors.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                      <CheckCircle size={13} color="#2563eb" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
 
              <p style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", marginTop: "16px", lineHeight: 1.5 }}>
                Prices are AI estimates based on market trends. Final pricing is at your discretion.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
 
// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [menuOpen, setMenuOpen] = useState(null)
  const [showAIPricing, setShowAIPricing] = useState(false)
 
  // Credit manager state
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [creditAmount, setCreditAmount] = useState("")
  const [creditNote, setCreditNote] = useState("")
  const [creditAction, setCreditAction] = useState("add")
  const [addingCredits, setAddingCredits] = useState(false)
  const [creditSuccess, setCreditSuccess] = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
 
  // Form state
  const [itemName, setItemName] = useState("")
  const [category, setCategory] = useState("Watches")
  const [basePrice, setBasePrice] = useState("")
  const [endTime, setEndTime] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
 
  const token = localStorage.getItem("token")
  const PER_PAGE = 5
 
  useEffect(() => { loadAuctions(); loadUsers() }, [])
 
  // Debug: Log state for credit manager
  useEffect(() => {
    const isDisabled = !selectedUser || !creditAmount || (creditAction === "deduct" && Number(creditAmount || 0) > Number(selectedUser?.credits || 0))
    console.log("Credit Manager State:", {
      selectedUser: selectedUser?._id,
      selectedUserEmail: selectedUser?.email,
      creditAmount,
      creditAction,
      isDisabled,
      reason: !selectedUser ? "No user selected" : !creditAmount ? "No amount" : (creditAction === "deduct" && Number(creditAmount || 0) > Number(selectedUser?.credits || 0)) ? "Deduction exceeds balance" : "ENABLED"
    })
  }, [selectedUser, creditAmount, creditAction])
 
  const loadAuctions = async () => {
    setLoading(true)
    try {
      const res = await API.get("/auctions")
      setAuctions(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }
 
  const createAuction = async () => {
    if (!itemName || !basePrice || !endTime) { alert("Please fill all required fields"); return }
    setCreating(true)
    try {
      const formData = new FormData()
      formData.append("itemName", itemName)
      formData.append("category", category)
      formData.append("basePrice", Number(basePrice))
      formData.append("endTime", new Date(endTime).toISOString())
      formData.append("description", description)
      if (imageFile) formData.append("image", imageFile)
 
      await API.post("/auctions/create", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      })
      setItemName(""); setCategory("Watches"); setBasePrice("")
      setEndTime(""); setDescription(""); setImageFile(null); setImagePreview(null)
      loadAuctions()
    } catch (err) { alert("Failed to create auction") }
    finally { setCreating(false) }
  }
 
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }
 
  const removeImage = () => { setImageFile(null); setImagePreview(null) }
 
  const deleteAuction = async (id) => {
    if (!window.confirm("Delete this auction?")) return
    try {
      await API.delete(`/auctions/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      loadAuctions()
    } catch (err) { alert("Failed to delete") }
    setMenuOpen(null)
  }
 
  const resolveUnclaimedAuction = async (auctionId, action) => {
    const relistEnd = action === "reauction"
      ? window.prompt("Enter new end date/time (YYYY-MM-DDTHH:mm). Leave empty for +24h:")
      : null
 
    try {
      await API.post(
        "/admin/auction-decision",
        { auctionId, action, endTime: relistEnd || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      loadAuctions()
    } catch (err) {
      alert(err.response?.data?.error || "Failed to apply admin decision")
    } finally {
      setMenuOpen(null)
    }
  }
 
  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data)
    } catch (err) { console.error(err) }
    finally { setLoadingUsers(false) }
  }
 
  const submitCreditAction = async () => {
    if (!selectedUser || !creditAmount) return
    const amount = Number(creditAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setCreditSuccess("❌ Enter a valid positive credit amount.")
      return
    }
    if (creditAction === "deduct" && amount > Number(selectedUser.credits || 0)) {
      setCreditSuccess(`❌ Cannot deduct ${amount}. User only has ${(selectedUser.credits || 0).toLocaleString()} credits.`)
      return
    }
 
    setAddingCredits(true)
    setCreditSuccess(null)
    try {
      await API.post(creditAction === "add" ? "/admin/add-credits" : "/admin/deduct-credits", {
        userId: selectedUser._id,
        amount,
        note: creditNote,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setCreditSuccess(
        creditAction === "add"
          ? `✅ Added ${amount} credits to ${selectedUser.name}`
          : `✅ Deducted ${amount} credits from ${selectedUser.name}`
      )
      setCreditAmount("")
      setCreditNote("")
      setSelectedUser(null)
      setUserSearch("")
      loadUsers()
    } catch (err) {
      setCreditSuccess(err.response?.data?.error ? `❌ ${err.response.data.error}` : "❌ Failed to update credits. Please try again.")
    } finally {
      setAddingCredits(false)
    }
  }
 
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  )
 
  const totalBidders = auctions.reduce((s, a) => s + (a.bidderCount || 0), 0)
  const liveCount = auctions.filter(a => getStatus(a) === "live").length
  const totalRevenue = auctions.reduce((s, a) => s + (a.currentBid || 0), 0)
 
  const filteredAuctions = auctions.filter(a => {
    const matchSearch = a.itemName?.toLowerCase().includes(search.toLowerCase())
    const status = getStatus(a)
    const matchFilter =
      filter === "All" ? true :
      filter === "Live" ? status === "live" :
      filter === "Ended" ? status === "ended" :
      filter === "Unclaimed" ? status === "awaiting_admin" :
      true
    return matchSearch && matchFilter
  })
  const totalPages = Math.ceil(filteredAuctions.length / PER_PAGE)
  const paginated = filteredAuctions.slice((page - 1) * PER_PAGE, page * PER_PAGE)
 
  const inputStyle = {
    width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb",
    borderRadius: "10px", fontSize: "13px", color: "#111827",
    background: "white", outline: "none", boxSizing: "border-box", fontFamily: font,
  }
  const labelStyle = { fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }
 
  // Calculate button disabled state
  const buttonDisabled = !selectedUser || !creditAmount || (creditAction === "deduct" && Number(creditAmount || 0) > Number(selectedUser?.credits || 0))
 
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", fontFamily: font }}>
 
      {/* AI Price Advisor panel */}
      {showAIPricing && (
        <AIPriceAdvisor
          itemName={itemName}
          category={category}
          onUsePrice={(price) => setBasePrice(String(price))}
          onClose={() => setShowAIPricing(false)}
        />
      )}
 
      <Navbar onAIClick={() => setShowAIPricing(p => !p)} showAI={showAIPricing} showAdmin />
 
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "32px 24px" }}>
 
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.5px" }}>Admin Dashboard</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Manage and monitor all auctions</p>
        </div>
 
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { icon: <Gavel size={20} color="#2563eb" />,      bg: "#eff6ff", value: auctions.length,         label: "Total Auctions", sub: "+2 today",       subColor: "#16a34a" },
            { icon: <TrendingUp size={20} color="#16a34a" />,  bg: "#f0fdf4", value: liveCount,              label: "Live Auctions",  sub: "Active now",      subColor: "#16a34a" },
            { icon: <Users size={20} color="#7c3aed" />,       bg: "#f5f3ff", value: totalBidders,           label: "Total Bidders",  sub: "+15 this hour",   subColor: "#16a34a" },
            { icon: <DollarSign size={20} color="#ea580c" />,  bg: "#fff7ed", value: formatMoney(totalRevenue), label: "Total Revenue", sub: "+$2.1K today", subColor: "#16a34a" },
          ].map(({ icon, bg, value, label, sub, subColor }) => (
            <div key={label} style={{ background: "white", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
                <BarChart2 size={16} color="#e2e8f0" />
              </div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>{value}</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{label}</div>
              <div style={{ fontSize: "12px", color: subColor, fontWeight: "600", marginTop: "4px" }}>{sub}</div>
            </div>
          ))}
        </div>
 
        {/* Main 2-col */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", alignItems: "start" }}>
 
          {/* ── Create Form ── */}
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plus size={16} color="#2563eb" />
              </div>
              <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Create New Auction</span>
            </div>
 
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
 
              {/* Item Name */}
              <div>
                <label style={labelStyle}>Item Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={inputStyle} placeholder="e.g. 2024 Rolex Submariner" value={itemName} onChange={e => setItemName(e.target.value)} />
              </div>
 
              {/* Category */}
              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
 
              {/* Base Price + AI button */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Base / Starting Price (USD) <span style={{ color: "#ef4444" }}>*</span></label>
                  <button
                    onClick={() => {
                      if (!itemName.trim()) { alert("Enter an item name first"); return }
                      setShowAIPricing(true)
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                      color: "#2563eb", border: "1px solid #bfdbfe",
                      borderRadius: "20px", padding: "4px 10px",
                      fontSize: "11px", fontWeight: "700", cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    title="Get AI price recommendation"
                  >
                    <Sparkles size={11} /> AI Price
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#9ca3af", fontWeight: "600" }}>$</span>
                  <input
                    style={{ ...inputStyle, paddingLeft: "28px", borderColor: basePrice ? "#2563eb" : "#e5e7eb" }}
                    type="number" placeholder="0.00"
                    value={basePrice} onChange={e => setBasePrice(e.target.value)}
                  />
                </div>
                {!itemName.trim() && (
                  <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Sparkles size={10} /> Enter item name to unlock AI price suggestion
                  </p>
                )}
                {itemName.trim() && !showAIPricing && (
                  <p style={{ fontSize: "11px", color: "#2563eb", marginTop: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}
                    onClick={() => setShowAIPricing(true)}>
                    <Sparkles size={10} /> Click "AI Price" for market analysis →
                  </p>
                )}
              </div>
 
              {/* End Time */}
              <div>
                <label style={labelStyle}>Auction End Date & Time <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={inputStyle} type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
 
              {/* Description */}
              <div>
                <label style={labelStyle}>Description <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "400" }}>(optional)</span></label>
                <textarea
                  style={{ ...inputStyle, height: "80px", resize: "vertical", lineHeight: 1.5 }}
                  placeholder="Item description, condition, provenance..."
                  value={description} onChange={e => setDescription(e.target.value)}
                />
              </div>
 
              {/* Image Upload */}
              <div>
                <label style={labelStyle}>Item Image <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "400" }}>(optional)</span></label>
                {imagePreview ? (
                  <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "1.5px solid #e5e7eb" }}>
                    <img src={imagePreview} alt="preview" style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }} />
                    <button onClick={removeImage} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <X size={14} color="white" />
                    </button>
                    <div style={{ padding: "8px 12px", background: "#f8fafc", fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                      <ImageIcon size={11} /> {imageFile?.name}
                    </div>
                  </div>
                ) : (
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "24px", border: "2px dashed #e2e8f0", borderRadius: "12px", cursor: "pointer", background: "#f8fafc", transition: "border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Upload size={18} color="#2563eb" />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Click to upload image</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>PNG, JPG, WEBP up to 5MB</div>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                  </label>
                )}
              </div>
 
              {/* Submit */}
              <button
                onClick={createAuction}
                disabled={creating}
                style={{
                  width: "100%", padding: "14px",
                  background: creating ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "white", border: "none", borderRadius: "12px",
                  fontSize: "14px", fontWeight: "700", cursor: creating ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
                }}
              >
                <Plus size={16} /> {creating ? "Creating..." : "Create Auction"}
              </button>
            </div>
          </div>
 
          {/* ── Auctions Table ── */}
          <div style={{ background: "white", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "0 12px" }}>
                <Search size={14} color="#9ca3af" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search auctions..."
                  style={{ flex: 1, padding: "9px 0", border: "none", outline: "none", fontSize: "13px", background: "transparent", color: "#111827", fontFamily: font }} />
              </div>
              {["All", "Live", "Ended", "Unclaimed"].map(f => (
                <button key={f} onClick={() => { setFilter(f); setPage(1) }} style={{
                  padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                  border: filter === f ? "none" : "1.5px solid #e5e7eb",
                  background: filter === f ? "#2563eb" : "white",
                  color: filter === f ? "white" : "#374151",
                  cursor: "pointer", transition: "all 0.15s",
                  boxShadow: filter === f ? "0 4px 10px rgba(37,99,235,0.3)" : "none",
                }}>{f}</button>
              ))}
            </div>
 
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["ITEM", "CATEGORY", "BASE PRICE", "CURRENT BID", "BIDDERS", "STATUS", "END TIME", "ACTIONS"].map(h => (
                      <th key={h} style={{ padding: "11px 16px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.5px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Loading...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>No auctions found</td></tr>
                  ) : paginated.map((a) => {
                    const status = getStatus(a)
                    return (
                      <tr key={a._id} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                      >
                        <td style={{ padding: "14px 16px", minWidth: "160px" }}>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", lineHeight: 1.3 }}>{a.itemName}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                            Created {new Date(a.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>
                            {a.category || "General"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "600", color: "#374151", whiteSpace: "nowrap" }}>
                          ${a.startingBid || a.basePrice || 0}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: "800", color: a.currentBid ? "#16a34a" : "#94a3b8", whiteSpace: "nowrap" }}>
                          {a.currentBid ? `$${a.currentBid.toLocaleString()}` : "—"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#374151", fontWeight: "600" }}>
                            <Users size={13} color="#94a3b8" /> {a.bidderCount || 0}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <div style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background:
                                status === "live" ? "#16a34a" :
                                status === "awaiting_admin" ? "#ea580c" :
                                status === "pending_payment" ? "#d97706" :
                                status === "sold" ? "#2563eb" : "#94a3b8",
                            }} />
                            <span style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              color:
                                status === "live" ? "#16a34a" :
                                status === "awaiting_admin" ? "#ea580c" :
                                status === "pending_payment" ? "#d97706" :
                                status === "sold" ? "#2563eb" : "#64748b",
                            }}>
                              {status === "live" ? "Live" :
                               status === "awaiting_admin" ? "Unclaimed" :
                               status === "pending_payment" ? "Pending Payment" :
                               status === "sold" ? "Sold" : "Ended"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
                            <Clock size={11} /> {formatDate(a.endTime)}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative" }}>
                            <button onClick={() => navigate(`/auction/${a._id}`)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", color: "#64748b" }} title="View auction">
                              <ExternalLink size={15} />
                            </button>
                            <button onClick={() => setMenuOpen(menuOpen === a._id ? null : a._id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", color: "#64748b" }}>
                              <MoreVertical size={15} />
                            </button>
                            {menuOpen === a._id && (
                              <>
                                <div onClick={() => setMenuOpen(null)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
                                <div style={{ position: "absolute", right: 0, top: "100%", zIndex: 50, background: "white", borderRadius: "12px", minWidth: "130px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                                  <div onClick={() => { navigate(`/auction/${a._id}`); setMenuOpen(null) }}
                                    style={{ padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "#374151", fontWeight: "600" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                    onMouseLeave={e => e.currentTarget.style.background = "white"}>
                                    View Room
                                  </div>
                                  <div onClick={() => deleteAuction(a._id)}
                                    style={{ padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "#ef4444", fontWeight: "600" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fff1f2"}
                                    onMouseLeave={e => e.currentTarget.style.background = "white"}>
                                    Delete
                                  </div>
                                  {status === "awaiting_admin" && (
                                    <>
                                      <div
                                        onClick={() => resolveUnclaimedAuction(a._id, "reauction")}
                                        style={{ padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "#2563eb", fontWeight: "600" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                                      >
                                        Re-auction
                                      </div>
                                      <div
                                        onClick={() => resolveUnclaimedAuction(a._id, "remove")}
                                        style={{ padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "#dc2626", fontWeight: "600" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#fff1f2"}
                                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                                      >
                                        Remove Item
                                      </div>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
 
            {totalPages > 1 && (
              <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filteredAuctions.length)} of {filteredAuctions.length}
                </span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "white", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: page === 1 ? "#cbd5e1" : "#374151" }}>
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: "32px", height: "32px", borderRadius: "8px", border: page === p ? "none" : "1.5px solid #e5e7eb", background: page === p ? "#2563eb" : "white", color: page === p ? "white" : "#374151", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid #e5e7eb", background: "white", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: page === totalPages ? "#cbd5e1" : "#374151" }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
 
        {/* ── Credit Manager ── */}
        <div style={{ marginTop: "24px", background: "white", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", overflow: "hidden" }}>
 
          {/* Header */}
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CreditCard size={16} color="#ea580c" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>Credit Manager</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Add or deduct credits from any user account</div>
            </div>
          </div>
 
          <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
 
            {/* Left: User selector */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                Search & Select User
              </label>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "0 12px", background: "#f9fafb" }}>
                  <Search size={14} color="#9ca3af" />
                  <input
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setSelectedUser(null) }}
                    placeholder="Search by name or email..."
                    style={{ flex: 1, padding: "10px 0", border: "none", outline: "none", fontSize: "13px", background: "transparent", color: "#111827", fontFamily: font }}
                  />
                </div>
 
                {/* Dropdown */}
                {userSearch && !selectedUser && filteredUsers.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1.5px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, maxHeight: "200px", overflowY: "auto", marginTop: "4px" }}>
                    {filteredUsers.map(u => (
                      <div
                        key={u._id}
                        onClick={() => { setSelectedUser(u); setUserSearch(u.name) }}
                        style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{u.name}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{u.email}</div>
                        </div>
                        <div style={{ background: "#fff7ed", color: "#ea580c", padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                          💳 {(u.credits || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
 
              {/* Selected user card */}
              {selectedUser && (
                <div style={{ background: "#f8fafc", border: "1.5px solid #e5e7eb", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{selectedUser.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{selectedUser.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "right" }}>Current Balance</div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "#ea580c" }}>💳 {(selectedUser.credits || 0).toLocaleString()}</div>
                  </div>
                </div>
              )}
 
              {/* All users list */}
              {!userSearch && (
                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "8px" }}>All Users ({users.length})</div>
                  <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {loadingUsers ? (
                      <div style={{ fontSize: "13px", color: "#94a3b8", padding: "16px", textAlign: "center" }}>Loading users...</div>
                    ) : users.map(u => (
                      <div
                        key={u._id}
                        onClick={() => { setSelectedUser(u); setUserSearch(u.name) }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: selectedUser?._id === u._id ? "#eff6ff" : "#f8fafc", borderRadius: "10px", cursor: "pointer", border: selectedUser?._id === u._id ? "1.5px solid #2563eb" : "1.5px solid transparent", transition: "all 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                        onMouseLeave={e => e.currentTarget.style.background = selectedUser?._id === u._id ? "#eff6ff" : "#f8fafc"}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{u.name}</div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{u.email}</div>
                        </div>
                        <div style={{ background: "#fff7ed", color: "#ea580c", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                          💳 {(u.credits || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
 
            {/* Right: Add credits form */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                Credit Action
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <button
                  onClick={() => setCreditAction("add")}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border: creditAction === "add" ? "none" : "1.5px solid #e5e7eb",
                    background: creditAction === "add" ? "#16a34a" : "white",
                    color: creditAction === "add" ? "white" : "#374151",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Plus size={14} /> Add Credits
                </button>
                <button
                  onClick={() => setCreditAction("deduct")}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border: creditAction === "deduct" ? "none" : "1.5px solid #e5e7eb",
                    background: creditAction === "deduct" ? "#dc2626" : "white",
                    color: creditAction === "deduct" ? "white" : "#374151",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Minus size={14} /> Deduct Credits
                </button>
              </div>
 
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
                {creditAction === "add" ? "Credits to Add" : "Credits to Deduct"}
              </label>
 
              {/* Quick amounts */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "12px" }}>
                {[100, 250, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCreditAmount(String(amt))}
                    style={{
                      padding: "9px", background: creditAmount === String(amt) ? "#2563eb" : "#f1f5f9",
                      border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: "700",
                      color: creditAmount === String(amt) ? "white" : "#374151",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {creditAction === "add" ? `+${amt}` : `-${amt}`}
                  </button>
                ))}
              </div>
 
              {/* Custom amount */}
              <div style={{ border: "1.5px solid #e5e7eb", borderRadius: "10px", padding: "0 14px", background: "#f9fafb", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "600" }}>💳</span>
                <input
                  type="number"
                  placeholder={creditAction === "add" ? "Or enter custom amount to add" : "Or enter custom amount to deduct"}
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                  style={{ flex: 1, padding: "12px 0", border: "none", outline: "none", fontSize: "14px", fontWeight: "700", background: "transparent", color: "#111827", fontFamily: font }}
                />
              </div>
 
              {/* Note */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Note <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "400" }}>(optional)</span>
                </label>
                <input
                  placeholder="e.g. Welcome bonus, Refund, Promotion..."
                  value={creditNote}
                  onChange={e => setCreditNote(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontSize: "13px", color: "#111827", background: "white", outline: "none", boxSizing: "border-box", fontFamily: font }}
                />
              </div>
 
              {/* Preview */}
              {selectedUser && creditAmount && (
                <div style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "12px 16px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: "600", marginBottom: "4px" }}>Preview</div>
                  <div style={{ fontSize: "13px", color: "#1e40af" }}>
                    <span style={{ fontWeight: "700" }}>{selectedUser.name}</span> will go from{" "}
                    <span style={{ fontWeight: "700" }}>💳 {(selectedUser.credits || 0).toLocaleString()}</span> →{" "}
                    <span style={{ fontWeight: "800", color: creditAction === "add" ? "#16a34a" : "#dc2626" }}>
                      💳 {Math.max(0, creditAction === "add"
                        ? (selectedUser.credits || 0) + Number(creditAmount)
                        : (selectedUser.credits || 0) - Number(creditAmount)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
 
              {selectedUser && creditAction === "deduct" && Number(creditAmount || 0) > Number(selectedUser.credits || 0) && (
                <div style={{
                  padding: "10px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "600",
                  background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", marginBottom: "12px",
                }}>
                  Deduction cannot exceed current balance.
                </div>
              )}
 
              {/* Success/error message */}
              {creditSuccess && (
                <div style={{
                  padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600",
                  background: creditSuccess.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
                  color: creditSuccess.startsWith("✅") ? "#16a34a" : "#dc2626",
                  border: `1px solid ${creditSuccess.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`,
                  marginBottom: "12px",
                }}>
                  {creditSuccess}
                </div>
              )}
 
              {/* Submit */}
              <button
                onClick={submitCreditAction}
                disabled={buttonDisabled}
                style={{
                  width: "100%", padding: "13px",
                  background: buttonDisabled
                    ? "#e5e7eb"
                    : creditAction === "add"
                    ? "linear-gradient(135deg, #ea580c, #c2410c)"
                    : "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: buttonDisabled ? "#94a3b8" : "white",
                  border: "none", borderRadius: "12px",
                  fontSize: "14px", fontWeight: "700",
                  cursor: buttonDisabled ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  boxShadow: buttonDisabled
                    ? "none"
                    : creditAction === "add"
                    ? "0 4px 12px rgba(234,88,12,0.35)"
                    : "0 4px 12px rgba(220,38,38,0.35)",
                  transition: "all 0.15s",
                }}
              >
                <Send size={15} /> {addingCredits ? "Updating credits..." : creditAction === "add" ? "Add Credits" : "Deduct Credits"}
              </button>
            </div>
          </div>
        </div>
 
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