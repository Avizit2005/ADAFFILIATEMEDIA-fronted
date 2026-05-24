import { useState } from "react";
import Toast from "./Toast.jsx";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes toastIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes fadeUp { from { transform: translateY(14px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes slideIn { from { transform: translateX(-16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes orbFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-40px); } }
@keyframes gridPulse { 0%,100% { opacity:.6; } 50% { opacity:1; } }
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #050d1a; color: #e8f0ff; font-family: 'Sora', sans-serif; }
.grid-bg { position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(26,107,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,107,255,.04) 1px,transparent 1px);background-size:40px 40px;animation:gridPulse 8s ease-in-out infinite; }
.orb1 { position:fixed;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(26,107,255,.1) 0%,transparent 70%);top:-200px;left:-100px;z-index:0;pointer-events:none;animation:orbFloat 12s ease-in-out infinite; }
.orb2 { position:fixed;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(0,214,143,.07) 0%,transparent 70%);bottom:0;right:0;z-index:0;pointer-events:none;animation:orbFloat 9s ease-in-out infinite reverse; }
.layout { display:flex;min-height:100vh;position:relative;z-index:1; }
.sidebar { width:240px;min-height:100vh;background:#0a1628;border-right:1px solid rgba(26,107,255,.08);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;animation:slideIn .4s ease; }
.logo-area { padding:24px 20px 20px;border-bottom:1px solid rgba(26,107,255,.08); }
.logo-sub { font-size:11px;color:#1a6bff;font-weight:600;letter-spacing:2px;text-transform:uppercase;display:flex;align-items:center;gap:6px; }
.logo-dot { width:7px;height:7px;background:#1a6bff;border-radius:50%;animation:blink 2s ease infinite; }
.logo-title { font-size:15px;font-weight:700;color:#e8f0ff;letter-spacing:-.3px;margin-top:6px; }
.nav { flex:1;padding:16px 12px; }
.nav-item { display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;font-size:13px;color:#8ba3cc;margin-bottom:2px;transition:all .2s;border:1px solid transparent;font-weight:500; }
.nav-item:hover { background:rgba(26,107,255,.1);color:#e8f0ff;border-color:rgba(26,107,255,.2); }
.nav-item.active { background:rgba(26,107,255,.12);color:#1a6bff;border-color:rgba(26,107,255,.2); }
.nav-icon { font-size:16px;width:20px;text-align:center; }
.nav-badge { margin-left:auto;background:#ff4757;color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;font-weight:600;animation:pulse 2s ease infinite; }
.sidebar-footer { padding:16px;border-top:1px solid rgba(26,107,255,.08); }
.worker-chip { display:flex;align-items:center;gap:10px;padding:10px 12px;background:#0f1f3d;border-radius:8px;border:1px solid rgba(26,107,255,.08); }
.avatar { width:32px;height:32px;border-radius:50%;background:#1a6bff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0; }
.chip-name { font-size:12px;font-weight:600;color:#e8f0ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.chip-role { font-size:10px;color:#4d6a99; }
.content { flex:1;padding:32px;overflow-y:auto; }
.page-header { margin-bottom:28px;animation:fadeUp .4s ease; }
.page-title { font-size:24px;font-weight:700;color:#e8f0ff;letter-spacing:-.5px; }
.page-sub { font-size:13px;color:#8ba3cc;margin-top:4px; }
.card { background:rgba(10,22,40,.9);border:1px solid rgba(26,107,255,.08);border-radius:12px;padding:20px;transition:border-color .2s;animation:fadeUp .4s ease; }
.card:hover { border-color:rgba(26,107,255,.2); }
.stats-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px; }
.stat-card { background:rgba(10,22,40,.9);border:1px solid rgba(26,107,255,.08);border-radius:12px;padding:20px;position:relative;overflow:hidden;transition:all .3s;animation:fadeUp .4s ease both; }
.stat-card:hover { border-color:#1a6bff;transform:translateY(-2px); }
.stat-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#1a6bff,transparent); }
.stat-label { font-size:11px;color:#4d6a99;text-transform:uppercase;letter-spacing:1.5px;font-weight:600; }
.stat-value { font-size:28px;font-weight:700;color:#e8f0ff;margin:8px 0 4px;font-family:'JetBrains Mono',monospace; }
.stat-icon { position:absolute;right:16px;top:16px;font-size:24px;opacity:.15; }
.stat-change { font-size:11px;color:#00d68f; }
table { width:100%;border-collapse:collapse; }
th { font-size:11px;color:#4d6a99;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;padding:10px 16px;text-align:left;border-bottom:1px solid rgba(26,107,255,.08);white-space:nowrap; }
td { padding:12px 16px;font-size:13px;color:#8ba3cc;border-bottom:1px solid rgba(26,107,255,.06); }
tr:last-child td { border-bottom:none; }
tr:hover td { background:rgba(26,107,255,.05);color:#e8f0ff; }
.btn { display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s;font-family:'Sora',sans-serif; }
.btn-primary { background:#1a6bff;color:#fff; }
.btn-primary:hover { background:#0d4fd6;transform:translateY(-1px); }
.btn-outline { background:transparent;color:#1a6bff;border:1px solid rgba(26,107,255,.3); }
.btn-outline:hover { background:rgba(26,107,255,.1); }
.btn-success { background:rgba(0,214,143,.15);color:#00d68f;border:1px solid rgba(0,214,143,.3); }
.btn-danger { background:rgba(255,71,87,.12);color:#ff4757;border:1px solid rgba(255,71,87,.25); }
.btn-sm { padding:6px 14px;font-size:12px; }
.btn:disabled { opacity:.5;cursor:not-allowed; }
.form-group { margin-bottom:16px; }
label { font-size:12px;color:#8ba3cc;font-weight:500;display:block;margin-bottom:6px;letter-spacing:.3px; }
input,select,textarea { width:100%;background:#0f1f3d;border:1px solid rgba(26,107,255,.12);border-radius:8px;padding:10px 14px;font-size:13px;color:#e8f0ff;font-family:'Sora',sans-serif;outline:none;transition:border-color .2s; }
input:focus,select:focus,textarea:focus { border-color:#1a6bff;box-shadow:0 0 0 3px rgba(26,107,255,.12); }
select option { background:#0a1628; }
.form-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
.form-grid-3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px; }
.grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
.grid-3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px; }
.section-title { font-size:14px;font-weight:600;color:#e8f0ff;margin-bottom:16px;display:flex;align-items:center;gap:8px; }
.section-line { flex:1;height:1px;background:rgba(26,107,255,.08); }
.info-row { display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(26,107,255,.06); }
.info-row:last-child { border-bottom:none; }
.info-label { font-size:12px;color:#4d6a99; }
.info-value { font-size:13px;color:#e8f0ff;font-weight:500; }
.postback-box { background:#0f1f3d;border:1px solid rgba(26,107,255,.2);border-radius:10px;padding:14px 16px;font-family:'JetBrains Mono',monospace;font-size:12px;color:#00d68f;word-break:break-all;line-height:1.7; }
.offers-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:16px; }
.offer-card { background:rgba(10,22,40,.9);border:1px solid rgba(26,107,255,.08);border-radius:12px;padding:20px;transition:all .3s;position:relative;overflow:hidden;animation:fadeUp .4s ease both; }
.offer-card:hover { border-color:#1a6bff;transform:translateY(-3px); }
.offer-card::after { content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#1a6bff,#00d68f);transform:scaleX(0);transition:transform .3s; }
.offer-card:hover::after { transform:scaleX(1); }
.tabs { display:flex;gap:4px;margin-bottom:20px;background:#0f1f3d;border-radius:10px;padding:4px;width:fit-content; }
.tab { padding:8px 18px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#8ba3cc;transition:all .2s; }
.tab.active { background:#1a6bff;color:#fff; }
.pay-chip { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;background:#0f1f3d;border:1px solid rgba(26,107,255,.12);color:#8ba3cc;cursor:pointer;transition:all .2s; }
.pay-chip.selected { background:rgba(26,107,255,.12);border-color:#1a6bff;color:#1a6bff; }
.error-msg { color:#ff4757;font-size:12px;margin-top:4px; }
.success-msg { color:#00d68f;font-size:12px;margin-top:4px; }
.table-wrap { overflow-x:auto; }
`;

export function GlobalStyles() {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export function Sidebar({ navItems, active, onNav, user, onLogout }) {
  return (
    <div className="sidebar">
      <div className="logo-area">
        <div className="logo-sub"><span className="logo-dot" />{user.role === "admin" ? "ADMIN PANEL" : "WORKER PANEL"}</div>
        <div className="logo-title">ADaffiliateMedia</div>
      </div>
      <nav className="nav">
        {navItems.map(item => (
          <div key={item.key} className={`nav-item ${active === item.key ? "active" : ""}`} onClick={() => onNav(item.key)}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="worker-chip">
          <div className="avatar">{(user.fullName || "A").charAt(0).toUpperCase()}</div>
          <div>
            <div className="chip-name">{user.fullName || "Administrator"}</div>
            <div className="chip-role">{user.workerId || user.role}</div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" style={{ width:"100%", marginTop:10 }} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });
  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  return { showToast, ToastEl };
}

export function StatCard({ label, value, icon, change, delay = 0 }) {
  return (
    <div className="stat-card" style={{ animationDelay:`${delay}s` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {change && <div className="stat-change">{change}</div>}
    </div>
  );
}
