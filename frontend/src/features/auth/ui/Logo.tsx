import { C } from './design-tokens';

// Renders the ServeSync brand logo with a gradient symbol and company text
export function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
      {/* Visual symbol box with a modern color gradient */}
      <div style={{
        width:38, height:38, borderRadius:10,
        background:`linear-gradient(135deg, ${C.brand} 0%, ${C.brandLight} 100%)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:`0 2px 8px ${C.brand}40`,
      }}>
        <span style={{ color:"#fff", fontWeight:700, fontSize:18, letterSpacing:-1 }}>S</span>
      </div>
      
      {/* Brand title and description */}
      <div>
        <div style={{ fontWeight:700, fontSize:17, color:C.gray900, letterSpacing:-0.5 }}>
          ServeSync
        </div>
        <div style={{ fontSize:11, color:C.gray400, letterSpacing:0.2 }}>
          Helpdesk & Client Portal
        </div>
      </div>
    </div>
  );
}
