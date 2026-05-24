export default function Badge({ children, type = "info" }) {
  const styles = {
    success: { bg:"rgba(0,214,143,0.12)", color:"#00d68f", border:"rgba(0,214,143,0.25)" },
    warn:    { bg:"rgba(255,185,48,0.12)", color:"#ffb930", border:"rgba(255,185,48,0.25)" },
    danger:  { bg:"rgba(255,71,87,0.12)",  color:"#ff4757", border:"rgba(255,71,87,0.25)" },
    info:    { bg:"rgba(26,107,255,0.12)", color:"#1a6bff", border:"rgba(26,107,255,0.3)" },
  };
  const s = styles[type] || styles.info;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>{children}</span>;
}
