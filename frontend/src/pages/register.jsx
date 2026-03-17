import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"
import {
  Gavel, Mail, Lock, Eye, EyeOff,
  Sparkles, ArrowRight, User, CheckCircle
} from "lucide-react"
 
export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
 
  const register = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      await API.post("/auth/register", { name, email, password })
      alert("Account created")
      navigate("/")
    } catch (err) {
      alert("Registration failed")
    } finally {
      setLoading(false)
    }
  }
 
  const features = [
    "Join 10,000+ live auctions daily",
    "AI-powered bidding insights",
    "Real-time bid notifications",
  ]
 
  const stats = [
    { value: "50K+", label: "Bidders" },
    { value: "$2.4M", label: "Sold Daily" },
    { value: "98%", label: "Satisfaction" },
  ]
 
  const inputWrapper = {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #e5e7eb",
    borderRadius: "12px",
    padding: "0 14px",
    background: "#f9fafb",
  }
 
  const inputStyle = {
    flex: 1,
    padding: "13px 10px",
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "14px",
    color: "#111827",
  }
 
  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  }
 
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f0f4ff 0%, #dce6f5 50%, #e8f0fe 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "32px 24px",
    }}>
      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: "1000px",
        gap: "60px",
        alignItems: "center",
        flexWrap: "wrap",
      }}>
 
        {/* ── Left Panel ── */}
        <div style={{ flex: 1, minWidth: "280px" }}>
 
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
            <div style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
              flexShrink: 0,
            }}>
              <Gavel size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", lineHeight: 1.2 }}>
                BidBudz
              </div>
              <div style={{
                fontSize: "10px",
                fontWeight: "600",
                color: "#2563eb",
                letterSpacing: "1px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}>
                <Sparkles size={10} /> AI Powered
              </div>
            </div>
          </div>
 
          {/* Headline */}
          <h1 style={{
            fontSize: "42px",
            fontWeight: "800",
            color: "#0f172a",
            lineHeight: 1.15,
            margin: "0 0 16px",
            letterSpacing: "-1px",
          }}>
            Start bidding<br />
            <span style={{ color: "#2563eb" }}>smarter today</span>
          </h1>
 
          <p style={{
            fontSize: "15px",
            color: "#64748b",
            lineHeight: 1.6,
            margin: "0 0 32px",
            maxWidth: "380px",
          }}>
            Join thousands of bidders who use AI-powered insights to win auctions at the best price.
          </p>
 
          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
            {features.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(37,99,235,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <CheckCircle size={15} color="#2563eb" />
                </div>
                <span style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>{f}</span>
              </div>
            ))}
          </div>
 
          {/* Stats */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {stats.map(({ value, label }) => (
              <div key={label} style={{
                background: "white",
                borderRadius: "16px",
                padding: "16px 20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                minWidth: "90px",
              }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#2563eb" }}>{value}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "500", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
 
        {/* ── Right Card ── */}
        <div style={{
          width: "100%",
          maxWidth: "420px",
          flexShrink: 0,
          background: "white",
          borderRadius: "24px",
          padding: "36px",
          boxShadow: "0 4px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <h2 style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#0f172a",
            margin: "0 0 6px",
            letterSpacing: "-0.4px",
          }}>
            Create your account
          </h2>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px" }}>
            Join BidBudz and start winning auctions
          </p>
 
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
 
            {/* Full Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={inputWrapper}>
                <User size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                <input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
 
            {/* Email */}
            <div>
              <label style={labelStyle}>Email address</label>
              <div style={inputWrapper}>
                <Mail size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
 
            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={inputWrapper}>
                <Lock size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                >
                  {showPassword ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </button>
              </div>
            </div>
 
            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={inputWrapper}>
                <Lock size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
                <button
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                >
                  {showConfirm ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </button>
              </div>
            </div>
 
          </div>
 
          {/* Terms */}
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "16px 0 20px", lineHeight: 1.6 }}>
            By creating an account, you agree to our{" "}
            <span style={{ color: "#2563eb", fontWeight: "600", cursor: "pointer" }}>Terms of Service</span>
            {" "}and{" "}
            <span style={{ color: "#2563eb", fontWeight: "600", cursor: "pointer" }}>Privacy Policy</span>.
          </p>
 
          {/* Submit */}
          <button
            onClick={register}
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)"
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.5)"
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.4)"
            }}
          >
            {loading ? "Creating account..." : <>Create Account <ArrowRight size={16} /></>}
          </button>
 
          {/* Sign in */}
          <p style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "20px",
            marginBottom: 0,
          }}>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              style={{ color: "#2563eb", fontWeight: "700", cursor: "pointer" }}
            >
              Sign in
            </span>
          </p>
        </div>
 
      </div>
    </div>
  )
}