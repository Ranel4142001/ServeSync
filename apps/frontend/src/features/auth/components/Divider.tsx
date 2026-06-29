import { C } from './design-tokens';

interface DividerProps {
  text: string; // The text to display in the middle of the divider line
}

// Divider renders a clean text-centered line split separating form sections
export function Divider({ text }: DividerProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: C.gray200 }} />
      <span style={{ fontSize: 11, color: C.gray400, whiteSpace: "nowrap" }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: C.gray200 }} />
    </div>
  );
}
