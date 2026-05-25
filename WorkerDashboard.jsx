import { useState, useEffect, useCallback } from "react";
import { api } from "./api.js";
import { GlobalStyles, Sidebar, useToast, StatCard } from "./Layout.jsx";
import Badge from "./Badge.jsx";
import { generateInvoice } from "./invoice.js";

// offers loaded from API

const SMARTLINKS = [
  { id:"sl1",name:"General Smartlink",description:"Auto-optimized — routes to best converting offer" },
  { id:"sl2",name:"Finance Smartlink",description:"Finance & credit offer rotator" },
];

const PAYMENT_METHODS = ["Bkash","Nagad","Rocket"];
const MIN_WITHDRAW = 50;

export default function WorkerDashboard({ user, onLogout }) {
  const [page, setPage] = useState("overview");
  const [worker, setWorker] = useState(user);
  const [leads, setLeads] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [customLinks, setCustomLinks] = useState([]);
  const [offers, setOffers] = useState([]);
  const { showToast, ToastEl } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [me, l, wd, cl, offData] = await Promise.all([api.get("/api/workers/me"), api.get("/api/leads/mine"), api.get("/api/withdrawals/mine"), api.get("/api/workerlinks/mine"), api.get("/api/offers")]);
      setCustomLinks(cl); setOffers(offData || []);
      setWorker(me); setLeads(l); setWithdrawals(wd);
    } catch(e) {}
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const POSTBACK_BASE = `${window.location.origin.replace(":5173","") || ""}/postback`;

  const navItems = [
    { key:"overview", icon:"📊", label:"Overview" },
    { key:"offers",   icon:"💼", label:"CPA Offers" },
    { key:"smart",    icon:"🔗", label:"Smartlinks" },
    { key:"earnings", icon:"💰", label:"Earnings" },
    { key:"withdraw", icon:"💳", label:"Withdraw" },
    { key:"profile",  icon:"👤", label:"My Profile" },
  ];

  const copyText = (text, label="Copied!") => {
    navigator.clipboard.writeText(text).then(()=>showToast(label)).catch(()=>showToast("Copy failed","error"));
  };

  return (
    <>
      <GlobalStyles />
      <div className="grid-bg" /><div className="orb1" /><div className="orb2" />
      <div className="layout">
        <Sidebar navItems={navItems} active={page} onNav={(p)=>{setPage(p);loadData();}} user={worker} onLogout={onLogout} />
        <div className="content">

          {page === "overview" && (
            <>
              <div className="page-header"><div className="page-title">Welcome, {worker.fullName} 👋</div><div className="page-sub">Worker ID: <span style={{ fontFamily:"monospace",color:"#1a6bff" }}>{worker.workerId}</span></div></div>
              <div className="stats-grid">
                <StatCard label="Available Balance" value={`$${(worker.balance||0).toFixed(2)}`} icon="💵" delay={0} />
                <StatCard label="Total Earned" value={`$${(worker.totalEarned||0).toFixed(2)}`} icon="📈" delay={.05} />
                <StatCard label="Total Leads" value={worker.totalLeads||0} icon="🎯" delay={.1} />
                <StatCard label="Total Withdrawals" value={withdrawals.length} icon="💳" delay={.15} />
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="section-title">Your Postback URL <div className="section-line" /></div>
                  <div className="postback-box">{POSTBACK_BASE}?worker_id=<span style={{ color:"#1a6bff" }}>{worker.workerId}</span>&offer_id={"{OFFER_ID}"}&payout={"{PAYOUT}"}&status=lead</div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop:10 }} onClick={()=>copyText(`${POSTBACK_BASE}?worker_id=${worker.workerId}&offer_id={OFFER_ID}&payout={PAYOUT}&status=lead`)}>📋 Copy Postback URL</button>
                </div>
                <div className="card">
                  <div className="section-title">Recent Leads <div className="section-line" /></div>
                  {leads.length === 0 ? <div style={{ color:"#4d6a99",fontSize:13 }}>No leads yet. Start promoting!</div> :
                    leads.slice(0,5).map((l,i) => (
                      <div key={i} className="info-row">
                        <div><div style={{ fontSize:13,color:"#e8f0ff" }}>{l.offerName||l.offerId}</div><div style={{ fontSize:11,color:"#4d6a99" }}>{new Date(l.createdAt).toLocaleString()}</div></div>
                        <span style={{ color:"#00d68f",fontFamily:"monospace",fontSize:13 }}>${l.payout}</span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {page === "offers" && (
            <>
              <div className="page-header"><div className="page-title">CPA Offers</div><div className="page-sub">Earn per qualified lead. Custom link থাকলে সেটাই দেখাবে।</div></div>
              <div className="offers-grid">
                {offers.map((o,i) => {
                  const custom = customLinks.find(cl => cl.offerId === o.id);
                  const activeLink = custom ? custom.customLink : o.link;
                  const hasCustom = !!custom;
                  return (
                    <div className="offer-card" key={o.offerId} style={{ animationDelay:`${i*.06}s` }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                        <Badge type="info">{o.category}</Badge>
                        {hasCustom
                          ? <span style={{ fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:4,background:"rgba(0,214,143,0.15)",color:"#00d68f",border:"1px solid rgba(0,214,143,0.3)" }}>✦ Custom Link</span>
                          : <Badge type="success">Active</Badge>
                        }
                      </div>
                      <div style={{ fontSize:28,fontWeight:700,color:"#00d68f",fontFamily:"monospace" }}>${o.payout.toFixed(2)}</div>
                      <div style={{ fontSize:10,color:"#4d6a99",marginBottom:6 }}>Per Lead Payout</div>
                      <div style={{ fontSize:14,fontWeight:600,color:"#e8f0ff",marginBottom:4 }}>{o.name}</div>
                      {hasCustom && (
                        <div style={{ fontSize:10,color:"#00d68f",marginBottom:4,display:"flex",alignItems:"center",gap:4 }}>
                          <span>✦</span> Admin দেওয়া custom link active
                        </div>
                      )}
                      <div style={{ fontSize:11,color:"#4d6a99",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:14 }}>{activeLink}</div>
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={()=>copyText(`${activeLink}${activeLink.includes("?")?"&":"?"}click_id=${worker.workerId}_${Date.now()}&aff=${worker.workerId}&offer=${o.offerId}`,"Tracking link copied!")} style={{ flex:1,padding:"7px 12px",background:hasCustom?"rgba(0,214,143,.1)":"rgba(26,107,255,.1)",border:`1px solid ${hasCustom?"rgba(0,214,143,.3)":"rgba(26,107,255,.3)"}`,borderRadius:6,color:hasCustom?"#00d68f":"#1a6bff",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .2s" }}>
                          📋 Copy Tracking Link
                        </button>
                        <a href={activeLink} target="_blank" rel="noreferrer"><button style={{ padding:"7px 12px",background:"rgba(26,107,255,.1)",border:"1px solid rgba(26,107,255,.3)",borderRadius:6,color:"#1a6bff",fontSize:13,cursor:"pointer" }}>↗</button></a>
                      </div>
                      {hasCustom && custom.note && (
                        <div style={{ marginTop:10,fontSize:11,color:"#4d6a99",fontStyle:"italic" }}>📝 {custom.note}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {page === "smart" && (
            <>
              <div className="page-header"><div className="page-title">Smartlinks</div><div className="page-sub">Auto-routed links that find the best converting offer for each visitor</div></div>
              <div className="grid-2" style={{ marginBottom:20 }}>
                {SMARTLINKS.map(sl => (
                  <div key={sl.id} style={{ background:"linear-gradient(135deg,rgba(26,107,255,.07),rgba(0,214,143,.04))",border:"1px solid rgba(26,107,255,.2)",borderRadius:12,padding:20 }}>
                    <div style={{ display:"inline-block",background:"#1a6bff",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,letterSpacing:1,marginBottom:10 }}>SMARTLINK</div>
                    <div style={{ fontSize:16,fontWeight:700,color:"#e8f0ff",marginBottom:6 }}>{sl.name}</div>
                    <div style={{ fontSize:12,color:"#8ba3cc",marginBottom:12 }}>{sl.description}</div>
                    <div className="postback-box" style={{ fontSize:11,marginBottom:12 }}>https://adaffiliatemedia.com/go/{sl.id.replace("sl","")}?wid={worker.workerId}</div>
                    <button className="btn btn-outline btn-sm" onClick={()=>copyText(`https://adaffiliatemedia.com/go/${sl.id.replace("sl","")}?wid=${worker.workerId}`,"Smartlink copied!")}>📋 Copy Smartlink</button>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="section-title">How Smartlinks Work <div className="section-line" /></div>
                <div style={{ fontSize:13,color:"#8ba3cc",lineHeight:1.8 }}>
                  Smartlinks automatically route your traffic to the highest-converting offer based on geo, device type, and real-time performance data. Your worker ID (<span style={{ fontFamily:"monospace",color:"#1a6bff" }}>{worker.workerId}</span>) is embedded in every click, ensuring all conversions are credited to your account.
                </div>
              </div>
            </>
          )}

          {page === "earnings" && (
            <>
              <div className="page-header"><div className="page-title">Earnings History</div><div className="page-sub">All your conversions and lead history</div></div>
              <div className="stats-grid" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
                <StatCard label="Current Balance" value={`$${(worker.balance||0).toFixed(2)}`} icon="💵" />
                <StatCard label="Total Earned" value={`$${(worker.totalEarned||0).toFixed(2)}`} icon="📈" delay={.05} />
                <StatCard label="Total Leads" value={worker.totalLeads||0} icon="🎯" delay={.1} />
              </div>
              <div className="card"><div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Offer</th><th>Payout</th><th>Status</th><th>Click ID</th></tr></thead>
                  <tbody>
                    {leads.length === 0 ? <tr><td colSpan={5} style={{ textAlign:"center",color:"#4d6a99" }}>No leads yet. Promote your tracking links to earn!</td></tr> :
                      leads.map((l,i) => (
                        <tr key={i}>
                          <td style={{ fontSize:11 }}>{new Date(l.createdAt).toLocaleString()}</td>
                          <td>{l.offerName||l.offerId}</td>
                          <td style={{ color:"#00d68f",fontFamily:"monospace" }}>${l.payout}</td>
                          <td><Badge type={l.status==="lead"||l.status==="sale"?"success":"danger"}>{l.status}</Badge></td>
                          <td style={{ fontFamily:"monospace",fontSize:11 }}>{l.clickId||"—"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div></div>
            </>
          )}

          {page === "withdraw" && <WithdrawPage worker={worker} withdrawals={withdrawals} showToast={showToast} onRefresh={loadData} />}
          {page === "profile" && <ProfilePage worker={worker} showToast={showToast} onRefresh={loadData} />}

        </div>
        {ToastEl}
      </div>
    </>
  );
}

function WithdrawPage({ worker, withdrawals, showToast, onRefresh }) {
  const [tab, setTab] = useState("request");
  const [method, setMethod] = useState(worker.paymentMethod||"");
  const [account, setAccount] = useState(worker.paymentAccount||"");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const balance = worker.balance||0;
  const canWithdraw = balance >= MIN_WITHDRAW;

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/api/withdrawals", { amount: parseFloat(amount), method, account });
      showToast("Withdrawal request submitted! Pending admin approval.");
      setAmount(""); onRefresh();
    } catch(e) { showToast(e.message,"error"); }
    setLoading(false);
  };

  return (
    <>
      <div className="page-header"><div className="page-title">Withdraw Earnings</div><div className="page-sub">Minimum $50 · Net-30 payment terms · Admin approval required</div></div>
      <div style={{ background:"rgba(10,22,40,.9)",border:"1px solid rgba(26,107,255,.12)",borderRadius:12,padding:20,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:12,color:"#4d6a99",marginBottom:4 }}>Available Balance</div>
          <div style={{ fontSize:36,fontWeight:700,color:"#00d68f",fontFamily:"monospace" }}>${balance.toFixed(2)}</div>
          {!canWithdraw && <div style={{ fontSize:12,color:"#ffb930",marginTop:6 }}>⚠ Need ${(MIN_WITHDRAW-balance).toFixed(2)} more to withdraw</div>}
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:12,color:"#4d6a99",marginBottom:4 }}>Payment Terms</div>
          <div style={{ fontWeight:700,color:"#e8f0ff" }}>Net-30</div>
          <div style={{ fontSize:11,color:"#4d6a99" }}>Monthly Payments</div>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab==="request"?"active":""}`} onClick={()=>setTab("request")}>Request Withdrawal</div>
        <div className={`tab ${tab==="history"?"active":""}`} onClick={()=>setTab("history")}>History</div>
      </div>

      {tab === "request" && (
        <div className="card">
          <div className="section-title">Select Payment Method <div className="section-line" /></div>
          <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
            {PAYMENT_METHODS.map(m => (
              <div key={m} className={`pay-chip ${method===m?"selected":""}`} onClick={()=>setMethod(m)}>
                {m==="Bkash"?"🩷":m==="Nagad"?"🟠":"🚀"} {m}
              </div>
            ))}
          </div>
          <div className="form-group"><label>{method||"Payment Method"} Account Number</label><input value={account} onChange={e=>setAccount(e.target.value)} placeholder="01XXXXXXXXX" /></div>
          <div className="form-group"><label>Amount (USD) — Minimum $50</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="50.00" min="50" max={balance} /></div>
          <button className="btn btn-primary" onClick={submit} disabled={loading||!canWithdraw}>
            {loading?"Processing...":"Submit Withdrawal Request →"}
          </button>
        </div>
      )}

      {tab === "history" && (
        <div className="card"><div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Invoice</th></tr></thead>
            <tbody>
              {withdrawals.length === 0 ? <tr><td colSpan={6} style={{ textAlign:"center",color:"#4d6a99" }}>No withdrawals yet</td></tr> :
                withdrawals.map(w => (
                  <tr key={w._id}>
                    <td style={{ fontSize:11 }}>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td style={{ color:"#00d68f",fontFamily:"monospace",fontWeight:700 }}>${w.amount.toFixed(2)}</td>
                    <td>{w.method}</td>
                    <td style={{ fontFamily:"monospace",fontSize:12 }}>{w.account}</td>
                    <td><Badge type={w.status==="paid"?"success":w.status==="rejected"?"danger":"warn"}>{w.status==="paid"?"✅ Paid":w.status==="rejected"?"✕ Rejected":"⏳ Pending"}</Badge></td>
                    <td><button className="btn btn-outline btn-sm" onClick={()=>generateInvoice(w, worker)}>📄 Invoice</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div></div>
      )}
    </>
  );
}

function ProfilePage({ worker, showToast, onRefresh }) {
  const [form, setForm] = useState({ ...worker });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const save = async () => {
    setSaving(true);
    try {
      await api.patch("/api/workers/me", form);
      showToast("Profile updated!"); onRefresh();
    } catch(e) { showToast(e.message,"error"); }
    setSaving(false);
  };

  return (
    <>
      <div className="page-header"><div className="page-title">My Profile</div><div className="page-sub">Worker ID: <span style={{ fontFamily:"monospace",color:"#1a6bff" }}>{worker.workerId}</span></div></div>
      <div className="card">
        <div className="section-title">Personal Information <div className="section-line" /></div>
        <div className="form-grid">
          <div className="form-group"><label>Full Name</label><input value={form.fullName||""} onChange={e=>set("fullName",e.target.value)} /></div>
          <div className="form-group"><label>Email (read-only)</label><input value={form.email||""} readOnly style={{ opacity:.6 }} /></div>
        </div>
        <div className="form-group"><label>Address</label><input value={form.address||""} onChange={e=>set("address",e.target.value)} /></div>
        <div className="form-grid">
          <div className="form-group"><label>Phone</label><input value={form.phone||""} onChange={e=>set("phone",e.target.value)} /></div>
          <div className="form-group"><label>Country</label><input value={form.country||""} onChange={e=>set("country",e.target.value)} /></div>
        </div>
        <div className="form-grid-3">
          <div className="form-group"><label>City</label><input value={form.city||""} onChange={e=>set("city",e.target.value)} /></div>
          <div className="form-group"><label>State</label><input value={form.state||""} onChange={e=>set("state",e.target.value)} /></div>
          <div className="form-group"><label>Zipcode</label><input value={form.zipcode||""} onChange={e=>set("zipcode",e.target.value)} /></div>
        </div>
        <div className="section-title" style={{ marginTop:20 }}>Default Payment Info <div className="section-line" /></div>
        <div className="form-grid">
          <div className="form-group"><label>Payment Method</label>
            <select value={form.paymentMethod||""} onChange={e=>set("paymentMethod",e.target.value)}>
              <option value="">Select method</option>
              {PAYMENT_METHODS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Account Number</label><input value={form.paymentAccount||""} onChange={e=>set("paymentAccount",e.target.value)} placeholder="01XXXXXXXXX" /></div>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?"Saving...":"Save Changes"}</button>
      </div>
    </>
  );
}
