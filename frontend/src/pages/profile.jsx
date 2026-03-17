import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "../components/shared"
import API from "../services/api"
import { CreditCard, Mail, Phone, Trophy, Wallet, Clock3 } from "lucide-react"

const font = "'DM Sans', 'Segoe UI', sans-serif"

const QUICK_TOPUPS = [500, 1500, 3500]

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [payingAuctionId, setPayingAuctionId] = useState(null)
  const [buyingCredits, setBuyingCredits] = useState(null)
  const [toast, setToast] = useState(null)

  const token = useMemo(() => localStorage.getItem("token"), [])

  const loadProfile = useCallback(async () => {
    if (!token) {
      navigate("/")
      return
    }

    setLoading(true)
    setError("")
    try {
      const res = await API.get("/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProfile(res.data)
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/")
        return
      }
      setError(err?.response?.data?.error || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }, [navigate, token])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4500)
    return () => clearTimeout(t)
  }, [toast])

  const formatAmount = (value) => `$${Number(value || 0).toLocaleString()}`

  const openCreditCheckout = async (credits) => {
    if (!token) return
    setBuyingCredits(credits)
    try {
      const res = await API.post(
        "/payments/create-credits-checkout",
        { credits },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      window.location.href = res.data.url
    } catch (err) {
      setToast({
        type: "error",
        msg: err?.response?.data?.error || "Failed to start Stripe checkout.",
      })
      setBuyingCredits(null)
    }
  }

  const payWinningBid = async (auctionId) => {
    if (!token) return
    setPayingAuctionId(auctionId)
    try {
      const res = await API.post(
        "/payments/pay-winning-bid",
        { auctionId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setToast({
        type: "success",
        msg: `Payment completed. Remaining credits: ${Number(res.data?.credits || 0).toLocaleString()}`,
      })
      await loadProfile()
    } catch (err) {
      const required = Number(err?.response?.data?.required || 0)
      if (required > 0) {
        setToast({
          type: "error",
          msg: `Not enough credits. Buy at least ${required.toLocaleString()} more credits.`,
        })
        setTimeout(() => navigate("/buy-credits"), 900)
      } else {
        setToast({
          type: "error",
          msg: err?.response?.data?.error || "Failed to pay winning bid.",
        })
      }
    } finally {
      setPayingAuctionId(null)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", fontFamily: font }}>
      <Navbar onAIClick={() => {}} showAI={false} credits={profile?.user?.credits ?? null} />

      <div style={{ maxWidth: "1050px", margin: "0 auto", padding: "28px 20px 48px" }}>
        <h1 style={{ margin: 0, fontSize: "30px", color: "#0f172a", fontWeight: 800 }}>My Profile</h1>
        <p style={{ margin: "6px 0 24px", color: "#64748b", fontSize: "14px" }}>
          Track your credits, winning auctions, and contact admin for delivery.
        </p>

        {toast && (
          <div
            style={{
              marginBottom: "18px",
              borderRadius: "12px",
              padding: "12px 14px",
              fontWeight: 600,
              fontSize: "14px",
              background: toast.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: toast.type === "success" ? "#166534" : "#b91c1c",
              border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {toast.msg}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: "18px",
              borderRadius: "12px",
              padding: "12px 14px",
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "18px",
              boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Wallet size={16} color="#2563eb" />
              <span style={{ fontWeight: 700, fontSize: "13px", color: "#1e3a8a" }}>Credits</span>
            </div>
            <div style={{ fontSize: "34px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
              {loading ? "..." : Number(profile?.user?.credits || 0).toLocaleString()}
            </div>
            <div style={{ marginTop: "8px", color: "#64748b", fontSize: "13px" }}>1 credit = $1</div>
            <button
              onClick={() => navigate("/buy-credits")}
              style={{
                marginTop: "14px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "none",
                background: "#2563eb",
                color: "white",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Open Full Credit Store
            </button>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "18px",
              boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <CreditCard size={16} color="#7c3aed" />
              <span style={{ fontWeight: 700, fontSize: "13px", color: "#5b21b6" }}>Quick Top-Up</span>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {QUICK_TOPUPS.map((credits) => (
                <button
                  key={credits}
                  onClick={() => openCreditCheckout(credits)}
                  disabled={buyingCredits === credits}
                  style={{
                    border: "1px solid #ddd6fe",
                    background: "#f5f3ff",
                    color: "#6d28d9",
                    borderRadius: "10px",
                    padding: "9px 12px",
                    cursor: buyingCredits === credits ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: "12px",
                  }}
                >
                  {buyingCredits === credits ? "Redirecting..." : `Buy ${credits.toLocaleString()} Credits`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "18px",
            boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Trophy size={16} color="#d97706" />
            <h2 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Auctions You Won</h2>
          </div>

          {loading ? (
            <div style={{ color: "#94a3b8", fontSize: "14px" }}>Loading wins...</div>
          ) : profile?.wonAuctions?.length ? (
            <div style={{ display: "grid", gap: "10px" }}>
              {profile.wonAuctions.map((auction) => {
                const final = Number(auction.finalPrice || auction.currentBid || 0)
                const dueText =
                  auction.status === "pending_payment" && auction.paymentDueAt
                    ? new Date(auction.paymentDueAt).toLocaleString()
                    : null

                const adminEmail = profile?.adminContact?.email || "admin@bidbudz.com"
                const adminPhone = profile?.adminContact?.phone || "+1-800-000-0000"
                const subject = encodeURIComponent(`Winning item help: ${auction.itemName}`)
                const body = encodeURIComponent(
                  `Hi Admin,\n\nI won "${auction.itemName}" (Auction ID: ${auction._id}) for ${formatAmount(final)} and need help with delivery/contact details.\n\nThanks`
                )

                return (
                  <div
                    key={auction._id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                        {auction.itemName}
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                        Final amount: <strong>{formatAmount(final)}</strong>
                      </div>
                      <div style={{ marginTop: "5px", fontSize: "12px", color: "#64748b" }}>
                        Status:{" "}
                        <strong style={{ color: auction.status === "sold" ? "#15803d" : "#d97706" }}>
                          {auction.status === "sold" ? "Paid / Sold" : "Pending payment"}
                        </strong>
                      </div>
                      {dueText && (
                        <div style={{ marginTop: "4px", fontSize: "12px", color: "#b45309", display: "flex", gap: "5px", alignItems: "center" }}>
                          <Clock3 size={12} />
                          Pay before: {dueText}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "7px", alignItems: "flex-end" }}>
                      {auction.status === "pending_payment" && (
                        <button
                          onClick={() => payWinningBid(auction._id)}
                          disabled={payingAuctionId === auction._id}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 11px",
                            background: "#16a34a",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: payingAuctionId === auction._id ? "not-allowed" : "pointer",
                          }}
                        >
                          {payingAuctionId === auction._id ? "Processing..." : "Pay With Credits"}
                        </button>
                      )}

                      <a
                        href={`mailto:${adminEmail}?subject=${subject}&body=${body}`}
                        style={{
                          textDecoration: "none",
                          color: "#1d4ed8",
                          fontSize: "12px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Mail size={12} />
                        Mail Admin About Item
                      </a>
                      <a
                        href={`tel:${adminPhone}`}
                        style={{
                          textDecoration: "none",
                          color: "#0f766e",
                          fontSize: "12px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Phone size={12} />
                        Call Admin
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ color: "#64748b", fontSize: "14px" }}>You have no won auctions yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
