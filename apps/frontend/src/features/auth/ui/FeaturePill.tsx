import { C } from './design-tokens';

interface FeaturePillProps {
  icon: string; // The icon emoji or symbol string to display
  text: string; // The badge content text
}

// FeaturePill renders a small pill badge highlighting specific features
export function FeaturePill({ icon, text }: FeaturePillProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "5px 10px", borderRadius: 20,
      background: C.brandPale, border: `1px solid ${C.brandBorder}`,
      fontSize: 11, color: C.brand, fontWeight: 500,
    }}>
      <span>{icon}</span> {text}
    </div>
  );
}
