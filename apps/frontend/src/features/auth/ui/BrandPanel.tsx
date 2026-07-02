import { C } from './design-tokens';

interface BrandPanelProps {
  mode: 'login' | 'register'; // Determines which text headings/taglines to render
}

// BrandPanel displays promotional product details and visuals on the left side of the Auth screen
export function BrandPanel({ mode }: BrandPanelProps) {
  return (
    <div className="auth-brand-panel" style={{
      flex: "0 0 380px", minHeight: 560,
      background: `linear-gradient(160deg, ${C.brand} 0%, #1E40AF 50%, #1D4ED8 100%)`,
      borderRadius: "16px 0 0 16px",
      padding: "44px 40px",
      display: "flex", flexDirection: "column",
      justifyContent: "space-between",
      position: "relative", overflow: "hidden",
    }}>
      {/* Absolute decorative circle shapes for visual elegance */}
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 220, height: 220, borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: -40,
        width: 160, height: 160, borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        pointerEvents: "none",
      }} />

      {/* Header section containing app logo icon */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>S</span>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: -0.5 }}>
            ServeSync
          </span>
        </div>

        {/* Small header text changing dynamically based on active page route */}
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
          {mode === "login" ? "Welcome back" : "Get started"}
        </div>

        {/* Dynamic promotional tagline */}
        <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.5, marginBottom: 16 }}>
          {mode === "login"
            ? "Your support\nteam is waiting."
            : "One platform for\nevery client conversation."}
        </div>

        {/* Dynamic subtext description */}
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.6 }}>
          {mode === "login"
            ? "Sign in to manage tickets, reply to clients, and keep everything moving."
            : "Set up your account and start resolving tickets in minutes."}
        </div>
      </div>

      {/* Feature checklist highlights */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { icon: "🎫", text: "Smart ticket routing" },
          { icon: "🤖", text: "AI-powered draft replies" },
          { icon: "📊", text: "Real-time agent dashboard" },
          { icon: "🔒", text: "Role-based access control" },
        ].map(f => (
          <div key={f.text} style={{
            display: "flex", alignItems: "center", gap: 10,
            color: "rgba(255,255,255,0.8)", fontSize: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}>
              {f.icon}
            </div>
            {f.text}
          </div>
        ))}
      </div>

      {/* Brand Footer Tag */}
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
        Trusted by support teams worldwide
      </div>
    </div>
  );
}
