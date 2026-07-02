import { C } from './design-tokens';

interface BannerProps {
  message?: string | null; // Optional message string. When null or empty, banner renders nothing.
}

// ErrorBanner displays validation errors or API rejection warnings in red
export function ErrorBanner({ message }: BannerProps) {
  if (!message) return null;
  return (
    <div style={{
      padding: "10px 12px",
      background: C.redPale, border: `1px solid ${C.redBorder}`,
      borderRadius: 8, fontSize: 12, color: "#991B1B",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>⚠</span>
      <span>{message}</span>
    </div>
  );
}

// SuccessBanner displays positive checkmarks and instructions in green
export function SuccessBanner({ message }: BannerProps) {
  if (!message) return null;
  return (
    <div style={{
      padding: "10px 12px",
      background: "#F0FDF4", border: "1px solid #BBF7D0",
      borderRadius: 8, fontSize: 12, color: "#166534",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>✓</span>
      <span>{message}</span>
    </div>
  );
}
