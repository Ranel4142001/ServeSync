import { BrandPanel } from './BrandPanel';
import { C } from './design-tokens';

interface AuthLayoutProps {
  children: React.ReactNode;      // The auth page forms to render on the right panel
  mode: 'login' | 'register';     // The current authentication mode (passed to BrandPanel)
}

// AuthLayout wraps the login and registration pages, rendering a shared double-panel layout
export function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div style={{
      minHeight: "100vh",
      background: C.brandPale,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Dynamic spinner keyframes, form styling resets, and responsive media queries */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder { color: #9CA3AF; }
        @media (max-width: 768px) {
          .auth-brand-panel {
            display: none !important;
          }
          .auth-card-wrapper {
            max-width: 480px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>

      {/* Main card box containing the BrandPanel and active page form */}
      <div className="auth-card-wrapper" style={{
        display: "flex",
        width: "100%",
        maxWidth: 860,
        background: C.white,
        borderRadius: 16,
        boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
        overflow: "hidden",
        minHeight: 580,
      }}>
        {/* Left-side brand showcase */}
        <BrandPanel mode={mode} />
        
        {/* Right-side dynamic auth form */}
        {children}
      </div>
    </div>
  );
}
