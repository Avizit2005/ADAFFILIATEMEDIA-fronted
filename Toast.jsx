import { useEffect } from "react";
export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "#00d68f", error: "#ff4757", info: "#1a6bff" };
  const icons  = { success: "✓", error: "✕", info: "ℹ" };
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background:"#0a1628", border:`1px solid ${colors[type]}`, borderRadius:12, padding:"12px 20px", fontSize:13, color:"#e8f0ff", boxShadow:"0 8px 32px rgba(0,0,0,0.5)", display:"flex", alignItems:"center", gap:10, animation:"toastIn .3s ease", fontFamily:"'Sora',sans-serif" }}>
      <span style={{ color:colors[type], fontWeight:700 }}>{icons[type]}</span>
      {message}
    </div>
  );
}
