import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"
import { Gavel, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Shield, Bot, Zap } from "lucide-react"
 
export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
 
  const login = async () => {
    setLoading(true)
    try {
      const res = await API.post("/auth/login", { email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/auctions")
    } catch (err) {
      alert("Login failed")
    } finally {
      setLoading(false)
    }
  }
 
  const demoLogin = async () => {
    setLoading(true)
    try {
      const res = await API.post("/auth/login", {
        email: "demo@bidbudz.com",
        password: "demo123",
      })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/auctions")
    } catch (err) {
      alert("Demo login failed")
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e8edf5 0%, #dce6f5 40%, #e4ecf7 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "24px 16px",
    }}>
 
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          width: "64px",
          height: "64px",
          borderRadius: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
          boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
        }}>
          <Gavel size={30} color="white" />
        </div>
 
        <h1 style={{
          fontSize: "26px",
          fontWeight: "800",
          color: "#0f172a",
          margin: "0 0 6px",
          letterSpacing: "-0.5px",
        }}>
          BidBudz
        </h1>
 
        <p style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "#2563eb",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          margin: 0,
        }}>
          <Sparkles size={13} />
          AI Powered Live Auctions
        </p>
      </div>
 
      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "white",
        borderRadius: "24px",
        padding: "36px 36px 28px",
        boxShadow: "0 4px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
      }}>
 
        <h2 style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "#0f172a",
          margin: "0 0 6px",
          letterSpacing: "-0.4px",
        }}>
          Welcome back
        </h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 28px" }}>
          Sign in to join live auctions
        </p>
 
        {/* Email */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block",
            fontSize: "13px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px",
          }}>
            Email address
          </label>
          <div style={{
            display: "flex",
            alignItems: "center",
            border: "1.5px solid #e5e7eb",
            borderRadius: "12px",
            padding: "0 14px",
            background: "#f9fafb",
            transition: "border-color 0.2s",
          }}
            onFocus={() => {}}
          >
            <Mail size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: "13px 10px",
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "14px",
                color: "#111827",
              }}
            />
          </div>
        </div>
 
        {/* Password */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
              Password
            </label>
            <span style={{ fontSize: "13px", color: "#2563eb", fontWeight: "600", cursor: "pointer" }}>
              Forgot password?
            </span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            border: "1.5px solid #e5e7eb",
            borderRadius: "12px",
            padding: "0 14px",
            background: "#f9fafb",
          }}>
            <Lock size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                flex: 1,
                padding: "13px 10px",
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "14px",
                color: "#111827",
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
            >
              {showPassword
                ? <EyeOff size={16} color="#9ca3af" />
                : <Eye size={16} color="#9ca3af" />}
            </button>
          </div>
        </div>
 
        {/* Sign In Button */}
        <button
          onClick={login}
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
            letterSpacing: "0.2px",
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
          {loading ? "Signing in..." : <>Sign In <ArrowRight size={16} /></>}
        </button>
 
        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "20px 0",
        }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" }}>or continue with</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>
 
        {/* Demo Login */}
        <button
          onClick={demoLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "white",
            color: "#111827",
            border: "1.5px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "border-color 0.2s, background 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "#2563eb"
            e.currentTarget.style.background = "#f0f6ff"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "#e5e7eb"
            e.currentTarget.style.background = "white"
          }}
        >
          Demo Login (No credentials needed)
        </button>
 
        {/* Register */}
        <p style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#6b7280",
          marginTop: "24px",
          marginBottom: 0,
        }}>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{ color: "#2563eb", fontWeight: "700", cursor: "pointer" }}
          >
            Create account
          </span>
        </p>
      </div>
 
      {/* Footer Badges */}
      <div style={{
        display: "flex",
        gap: "24px",
        marginTop: "24px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {[
          { icon: <Shield size={13} />, label: "256-bit SSL" },
          { icon: <Bot size={13} />, label: "AI Secured" },
          { icon: <Zap size={13} />, label: "Real-time Bids" },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            color: "#64748b",
            fontWeight: "500",
          }}>
            <span style={{ color: "#22c55e", display: "flex" }}>{icon}</span>
            {label}
          </div>
        ))}
      </div>
 
    </div>
  )
}