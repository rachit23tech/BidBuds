import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "../components/shared"
import API from "../services/api"
import {
  Sparkles, Zap, Crown, Star, CheckCircle,
  CreditCard, ArrowRight
} from "lucide-react"
 
const font = "'DM Sans', 'Segoe UI', sans-serif"
 
const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 500,
    price: 500,
    icon: <Zap size={24} color="#2563eb" />,
    bg: "#eff6ff",
    iconBg: "#dbeafe",
    color: "#2563eb",
    popular: false,
    perks: ["500 credits", "Good for small auctions", "Never expires"],
  },
  {
    id: "popular",
    name: "Popular",
    credits: 1500,
    price: 1500,
    icon: <Star size={24} color="#7c3aed" fill="#7c3aed" />,
    bg: "#f5f3ff",
    iconBg: "#ede9fe",
    color: "#7c3aed",
    popular: true,
    badge: "BEST VALUE",
    perks: ["1500 credits", "For active bidders", "Never expires"],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 3500,
    price: 3500,
    icon: <Crown size={24} color="#d97706" fill="#d97706" />,
    bg: "#fffbeb",
    iconBg: "#fef3c7",
    color: "#d97706",
    popular: false,
    badge: "MOST CREDITS",
    perks: ["3500 credits", "For heavy bidding", "Never expires"],
  },
  {
    id: "elite",
    name: "Elite",
    credits: 10000,
    price: 10000,
    icon: <Sparkles size={24} color="#dc2626" />,
    bg: "#fef2f2",
    iconBg: "#fee2e2",
    color: "#dc2626",
    popular: false,
    badge: "POWER BIDDER",
    perks: ["10,000 credits", "For premium auctions", "Never expires"],
  },
]
 
export default function BuyCredits() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [credits, setCredits] = useState(null)
  const [toast, setToast] = useState(null)
 
  useEffect(() => {
    const token = localStorage.getItem("token")
    const params = new URLSearchParams(window.location.search)
 
    // Handle cancelled payment FIRST - redirect immediately
    if (params.get("cancelled") === "true") {
      alert("❌ Payment cancelled. No credits were added.")
      navigate("/buy-credits")
      return
    }
 
    const loadCredits = async () => {
      if (!token) return
      try {
        const res = await API.get("/bids/credits", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setCredits(res.data.credits ?? 0)
      } catch (err) {
        console.error(err)
      }
    }
 
    const confirmSession = async () => {
      const sessionId = params.get("session_id")
      if (params.get("success") !== "true" || !sessionId || !token) return
 
      try {
        const res = await API.post(
          "/payments/confirm-credits",
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
 
        setCredits(res.data.credits ?? 0)
        setToast({
          type: "success",
          msg: `${(res.data.added || 0).toLocaleString()} credits added to your account.`,
        })
      } catch {
        setToast({
          type: "error",
          msg: "Payment succeeded but credit confirmation failed. Contact support.",
        })
      } finally {
        window.history.replaceState({}, "", "/buy-credits")
      }
    }
 
    loadCredits()
    confirmSession()
  }, [navigate])
 
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])
 
  const handleBuy = async (pkg) => {
    const token = localStorage.getItem("token")
    if (!token) {
      setToast({ type: "error", msg: "Please log in to buy credits." })
      return
    }
 
    setLoading(pkg.id)
    try {
      const res = await API.post(
        "/payments/create-credits-checkout",
        { credits: pkg.credits },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      window.location.href = res.data.url
    } catch (err) {
      const message = err?.response?.data?.error
      if (err?.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setToast({ type: "error", msg: "Session expired. Please log in again." })
        setTimeout(() => navigate("/"), 800)
      } else {
        setToast({ type: "error", msg: message || "Failed to start Stripe checkout." })
      }
      setLoading(null)
    }
  }
 
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", fontFamily: font }}>
      <Navbar credits={credits} onAIClick={() => {}} showAI={false} />
 
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: "20px", padding: "6px 14px",
            fontSize: "12px", fontWeight: "700", color: "#2563eb",
            marginBottom: "16px",
          }}>
            <CreditCard size={12} /> Credits Store
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px", letterSpacing: "-1px" }}>
            Buy Credits
          </h1>
          <p style={{ fontSize: "16px", color: "#64748b", margin: 0, maxWidth: "480px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            1 credit = $1. Top up instantly with Stripe and use credits to settle winning bids.
          </p>
        </div>
 
        {toast && (
          <div style={{
            background: toast.type === "success" ? "#f0fdf4" : toast.type === "info" ? "#eff6ff" : "#fef2f2",
            border: `1px solid ${toast.type === "success" ? "#bbf7d0" : toast.type === "info" ? "#bfdbfe" : "#fecaca"}`,
            color: toast.type === "success" ? "#16a34a" : toast.type === "info" ? "#2563eb" : "#dc2626",
            borderRadius: "14px", padding: "14px 20px",
            fontSize: "14px", fontWeight: "600",
            marginBottom: "24px", textAlign: "center",
          }}>
            {toast.msg}
          </div>
        )}
 
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "40px" }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.id} style={{
              background: "white",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: pkg.popular ? "0 8px 32px rgba(124,58,237,0.15)" : "0 2px 16px rgba(0,0,0,0.07)",
              border: pkg.popular ? "2px solid #7c3aed" : "1.5px solid #e5e7eb",
              position: "relative",
            }}>
              {pkg.badge && (
                <div style={{
                  position: "absolute", top: "-12px", left: "20px",
                  background: `linear-gradient(135deg, ${pkg.color}, ${pkg.color}dd)`,
                  color: "white", fontSize: "10px", fontWeight: "800",
                  padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.5px",
                }}>
                  {pkg.badge}
                </div>
              )}
 
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", marginTop: pkg.badge ? "8px" : 0 }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: pkg.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pkg.icon}
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{pkg.name}</div>
                  <div style={{ fontSize: "13px", color: pkg.color, fontWeight: "700" }}>{pkg.credits.toLocaleString()} credits</div>
                </div>
              </div>
 
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "40px", fontWeight: "800", color: "#0f172a", letterSpacing: "-1px" }}>${pkg.price.toLocaleString()}</span>
                <span style={{ fontSize: "14px", color: "#94a3b8", marginLeft: "4px" }}>USD</span>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>1 credit = $1</div>
              </div>
 
              <div style={{ marginBottom: "20px" }}>
                {pkg.perks.map((perk, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <CheckCircle size={14} color={pkg.color} />
                    <span style={{ fontSize: "13px", color: "#374151" }}>{perk}</span>
                  </div>
                ))}
              </div>
 
              <button
                onClick={() => handleBuy(pkg)}
                disabled={loading === pkg.id}
                style={{
                  width: "100%", padding: "13px",
                  background: loading === pkg.id ? "#e5e7eb" : `linear-gradient(135deg, ${pkg.color}, ${pkg.color}cc)`,
                  color: loading === pkg.id ? "#94a3b8" : "white",
                  border: "none", borderRadius: "12px",
                  fontSize: "14px", fontWeight: "700",
                  cursor: loading === pkg.id ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                }}
              >
                <>
                  <CreditCard size={14} />
                  {loading === pkg.id ? "Redirecting..." : `Get ${pkg.credits.toLocaleString()} Credits`}
                  <ArrowRight size={14} />
                </>
              </button>
            </div>
          ))}
        </div>
      </div>
 
      <div style={{ borderTop: "1px solid #e5e7eb", background: "white", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px" }}>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>© 2026 BidBudz. AI-powered live auctions.</span>
        <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
        </span>
      </div>
    </div>
  )
}