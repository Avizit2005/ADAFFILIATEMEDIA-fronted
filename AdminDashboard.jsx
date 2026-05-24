import { useState, useEffect, useCallback } from "react";
import { api } from "./api.js";
import { GlobalStyles, Sidebar, useToast, StatCard } from "./Layout.jsx";
import Badge from "./Badge.jsx";

const OFFERS = [
  { id:"1", name:"Rent To Own Gateway",              payout:1.0,  link:"https://getownrenthomeus.netlify.app/" },
  { id:"2", name:"Rent2Own",                          payout:1.3,  link:"https://renttoownhomeus.netlify.app/" },
  { id:"3", name:"CreditScoreIQ - $1 7 Day Trial",   payout:15.0, link:"https://creditscore1dollar.netlify.app/" },
  { id:"4", name:"TransUnion Credit Scores Trial",   payout:30.0, link:"https://transunionscore.netlify.app/" },
  { id:"5", name:"Win a $1000 Amazon Gift Card",     payout:1.0,  link:"https://amazonreward998.netlify.app/" },
  { id:"6", name:"Cash App Gift Card",               payout:1.3,  link:"https://cashappreward664.netlify.app/" },
  { id:"7", name:"FlexJobs Work Opportunities",      payout:3.0,  link:"https://usremoteflexjob.netlify.app/" },
];

export default function AdminDashboard({ user, onLogout }) {
  const [page, setPage] = useState("overview");
  const [workers, setWorkers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [workerLinks, setWorkerLinks] = useState([]);
  const { showToast, ToastEl } = useToast();

  const load = useCallback(async () => {
    try {
      const [w, l, wd, wl] = await Promise.all([
        api.get("/api/workers"),
        api.get("/api/leads"),
        api.get("/api/withdrawals"),
        api.get("/api/workerlinks"),
      ]);
      setWorkers(w); setLeads(l); setWithdrawals(wd); setWorkerLinks(wl);
    } catch(e) { showToast(e.message, "error"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending   = workers.filter(w => w.status === "pending");
  const pendingWd = withdrawals.filter(w => w.status === "pending");

  const approve    = async (id) => { await api.patch(`/api/workers/${id}/approve`);    showToast("Worker approved!"); load(); };
  const reject     = async (id) => { await api.patch(`/api/workers/${id}/reject`);     showToast("Worker rejected.", "error"); load(); };
  const approveWd  = async (id) => { await api.patch(`/api/withdrawals/${id}/approve`);showToast("Payment approved!"); load(); };
  const rejectWd   = async (id) => { await api.patch(`/api/withdrawals/${id}/reject`); showToast("Withdrawal rejected.", "error"); load(); };

  const navItems = [
    { key:"overview",     icon:"📊", label:"Overview" },
    { key:"approvals",    icon:"👥", label:"Worker Approvals", badge: pending.length || null },
    { key:"workers",      icon:"🧑‍💼", label:"All Workers" },
    { key:"workerlinks",  icon:"🔗", label:"Worker Links" },
    { key:"leads",        icon:"🎯", label:"Leads & Postback" },
    { key:"offers",       icon:"💼", label:"Offers" },
    { key:"withdrawals",  icon:"💳", label:"Withdrawals", badge: pendingWd.length || null },
  ];

  const POSTBACK_BASE = typeof window !== "undefined"
    ? `${window.location.origin}/postback`
    : "https://your-backend.railway.app/postback";

  return (
    <>
      <GlobalStyles />
      <div className="grid-bg" /><div className="orb1" /><div className="orb2" />
      <div className="layout">
        <Sidebar navItems={navItems} active={page} onNav={setPage} user={user} onLogout={onLogout} />
        <div className="content">

          {/* ── OVERVIEW ── */}
          {page === "overview" && (
            <>
              <div className="page-header"><div className="page-title">Dashboard Overview</div><div className="page-sub">ADaffiliateMedia Admin Control Center</div></div>
              <div className="stats-grid">
                <StatCard label="Active Workers"    value={workers.filter(w=>w.status==="approved").length} icon="👥" delay={0} />
                <StatCard label="Total Leads"       value={leads.length}   icon="🎯" delay={.05} />
                <StatCard label="Pending Approvals" value={pending.length} icon="⏳" delay={.1} />
                <StatCard label="Pending Payments"  value={pendingWd.length} icon="💳" delay={.15} />
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="section-title">Pending Workers <div className="section-line" /></div>
                  {pending.length === 0 ? <div style={{color:"#4d6a99",fontSize:13}}>No pending approvals ✓</div> :
                    pending.slice(0,5).map(w => (
                      <div key={w._id} className="info-row">
                        <div><div style={{fontSize:13,fontWeight:600,color:"#e8f0ff"}}>{w.fullName}</div><div style={{fontSize:11,color:"#4d6a99"}}>{w.email}</div></div>
                        <Badge type="warn">Pending</Badge>
                      </div>
                    ))}
                </div>
                <div className="card">
                  <div className="section-title">Pending Withdrawals <div className="section-line" /></div>
                  {pendingWd.length === 0 ? <div style={{color:"#4d6a99",fontSize:13}}>No pending withdrawals ✓</div> :
                    pendingWd.slice(0,5).map(w => (
                      <div key={w._id} className="info-row">
                        <div><div style={{fontSize:13,fontWeight:600,color:"#e8f0ff"}}>{w.workerName}</div><div style={{fontSize:11,color:"#4d6a99"}}>${w.amount} via {w.method}</div></div>
                        <Badge type="warn">Pending</Badge>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* ── APPROVALS ── */}
          {page === "approvals" && (
            <>
              <div className="page-header"><div className="page-title">Worker Approvals</div><div className="page-sub">{pending.length} worker{pending.length!==1?"s":""} awaiting approval</div></div>
              {pending.length === 0 ? (
                <div className="card" style={{textAlign:"center",padding:48}}><div style={{fontSize:40,marginBottom:12}}>✅</div><div style={{color:"#8ba3cc"}}>All caught up! No pending approvals.</div></div>
              ) : pending.map(w => (
                <div className="card" key={w._id} style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:16,color:"#e8f0ff",marginBottom:4}}>{w.fullName}</div>
                      <div style={{fontSize:12,color:"#4d6a99",marginBottom:12}}>Registered {new Date(w.createdAt).toLocaleDateString()}</div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"4px 16px"}}>
                        {[["Email",w.email],["Phone",w.phone],["Country",w.country],["City",w.city],["State",w.state],["Zipcode",w.zipcode]].map(([k,v])=>(
                          <div key={k}><span style={{fontSize:11,color:"#4d6a99"}}>{k}: </span><span style={{fontSize:12,color:"#8ba3cc"}}>{v||"—"}</span></div>
                        ))}
                      </div>
                      {w.address && <div style={{fontSize:12,color:"#8ba3cc",marginTop:6}}>📍 {w.address}</div>}
                    </div>
                    <div style={{display:"flex",gap:8,flexShrink:0}}>
                      <button className="btn btn-success btn-sm" onClick={()=>approve(w._id)}>✓ Approve</button>
                      <button className="btn btn-danger btn-sm"  onClick={()=>reject(w._id)}>✕ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ── ALL WORKERS ── */}
          {page === "workers" && (
            <>
              <div className="page-header"><div className="page-title">All Workers</div><div className="page-sub">{workers.length} total registered workers</div></div>
              <div className="card"><div className="table-wrap">
                <table>
                  <thead><tr><th>Worker</th><th>ID</th><th>Email</th><th>Country</th><th>Status</th><th>Balance</th><th>Leads</th><th>Joined</th></tr></thead>
                  <tbody>
                    {workers.length === 0
                      ? <tr><td colSpan={8} style={{textAlign:"center",color:"#4d6a99"}}>No workers yet</td></tr>
                      : workers.map(w => (
                        <tr key={w._id}>
                          <td style={{fontWeight:600,color:"#e8f0ff"}}>{w.fullName}</td>
                          <td style={{fontFamily:"monospace",fontSize:12}}>{w.workerId}</td>
                          <td>{w.email}</td>
                          <td>{w.country||"—"}</td>
                          <td><Badge type={w.status==="approved"?"success":w.status==="pending"?"warn":"danger"}>{w.status}</Badge></td>
                          <td style={{color:"#00d68f",fontFamily:"monospace"}}>${(w.balance||0).toFixed(2)}</td>
                          <td>{w.totalLeads||0}</td>
                          <td style={{fontSize:11}}>{new Date(w.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div></div>
            </>
          )}

          {/* ── WORKER CUSTOM LINKS ── */}
          {page === "workerlinks" && (
            <WorkerLinksPage
              workers={workers.filter(w=>w.status==="approved")}
              workerLinks={workerLinks}
              showToast={showToast}
              onRefresh={load}
            />
          )}

          {/* ── LEADS ── */}
          {page === "leads" && (
            <>
              <div className="page-header"><div className="page-title">Leads & Postback</div><div className="page-sub">Track all conversions via postback URL</div></div>
              <div className="card" style={{marginBottom:20}}>
                <div className="section-title">Postback URL Format <div className="section-line" /></div>
                <div className="postback-box">
                  {POSTBACK_BASE}?worker_id=<span style={{color:"#ffb930"}}>{"{WORKER_ID}"}</span>&offer_id=<span style={{color:"#ffb930"}}>{"{OFFER_ID}"}</span>&payout=<span style={{color:"#ffb930"}}>{"{PAYOUT}"}</span>&status=<span style={{color:"#ffb930"}}>{"{STATUS}"}</span>&click_id=<span style={{color:"#ffb930"}}>{"{CLICK_ID}"}</span>
                </div>
                <div style={{marginTop:12,fontSize:12,color:"#4d6a99"}}>Supported status: lead, sale, reject. GET or POST.</div>
              </div>
              <div className="card"><div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Worker ID</th><th>Offer</th><th>Payout</th><th>Status</th><th>Click ID</th></tr></thead>
                  <tbody>
                    {leads.length === 0
                      ? <tr><td colSpan={6} style={{textAlign:"center",color:"#4d6a99"}}>No leads yet.</td></tr>
                      : leads.map((l,i) => (
                        <tr key={i}>
                          <td style={{fontSize:11}}>{new Date(l.createdAt).toLocaleString()}</td>
                          <td style={{fontFamily:"monospace",fontSize:12}}>{l.workerId}</td>
                          <td>{l.offerName||l.offerId}</td>
                          <td style={{color:"#00d68f",fontFamily:"monospace"}}>${l.payout}</td>
                          <td><Badge type={l.status==="lead"||l.status==="sale"?"success":"danger"}>{l.status}</Badge></td>
                          <td style={{fontFamily:"monospace",fontSize:11}}>{l.clickId||"—"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div></div>
            </>
          )}

          {/* ── OFFERS ── */}
          {page === "offers" && (
            <>
              <div className="page-header"><div className="page-title">Offer Management</div><div className="page-sub">All active CPA offers</div></div>
              <div className="card"><div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Offer Name</th><th>Worker Payout</th><th>Default Link</th><th>Status</th></tr></thead>
                  <tbody>
                    {OFFERS.map(o => (
                      <tr key={o.id}>
                        <td style={{fontFamily:"monospace"}}>{o.id}</td>
                        <td style={{fontWeight:600,color:"#e8f0ff"}}>{o.name}</td>
                        <td style={{color:"#00d68f",fontFamily:"monospace",fontWeight:700}}>${o.payout.toFixed(2)}</td>
                        <td style={{fontSize:11,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.link}</td>
                        <td><Badge type="success">active</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div></div>
            </>
          )}

          {/* ── WITHDRAWALS ── */}
          {page === "withdrawals" && (
            <>
              <div className="page-header"><div className="page-title">Withdrawal Requests</div><div className="page-sub">Net-30 payment processing — minimum $50</div></div>
              <div className="card"><div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Worker</th><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {withdrawals.length === 0
                      ? <tr><td colSpan={7} style={{textAlign:"center",color:"#4d6a99"}}>No withdrawal requests yet</td></tr>
                      : withdrawals.map(w => (
                        <tr key={w._id}>
                          <td style={{fontSize:11}}>{new Date(w.createdAt).toLocaleDateString()}</td>
                          <td style={{fontWeight:600,color:"#e8f0ff"}}>{w.workerName}</td>
                          <td style={{color:"#00d68f",fontFamily:"monospace",fontWeight:700}}>${w.amount.toFixed(2)}</td>
                          <td>{w.method}</td>
                          <td style={{fontFamily:"monospace",fontSize:12}}>{w.account}</td>
                          <td><Badge type={w.status==="paid"?"success":w.status==="rejected"?"danger":"warn"}>{w.status}</Badge></td>
                          <td>
                            {w.status==="pending" && (
                              <div style={{display:"flex",gap:6}}>
                                <button className="btn btn-success btn-sm" onClick={()=>approveWd(w._id)}>Pay</button>
                                <button className="btn btn-danger btn-sm"  onClick={()=>rejectWd(w._id)}>Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div></div>
            </>
          )}

        </div>
        {ToastEl}
      </div>
    </>
  );
}

// ── Worker Custom Links Page ────────────────────────────────────────────────
function WorkerLinksPage({ workers, workerLinks, showToast, onRefresh }) {
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedOffer,  setSelectedOffer]  = useState("");
  const [customLink,     setCustomLink]      = useState("");
  const [note,           setNote]            = useState("");
  const [saving,         setSaving]          = useState(false);
  const [filterWorker,   setFilterWorker]    = useState("");

  const selectedOfferObj = OFFERS.find(o => o.id === selectedOffer);

  // Pre-fill default link when offer selected
  const handleOfferChange = (offerId) => {
    setSelectedOffer(offerId);
    const o = OFFERS.find(x => x.id === offerId);
    if (o && !customLink) setCustomLink(o.link);
  };

  const save = async () => {
    if (!selectedWorker || !selectedOffer || !customLink) {
      showToast("Worker, Offer আর Custom Link দাও", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/workerlinks", {
        workerId:   selectedWorker,
        offerId:    selectedOffer,
        offerName:  selectedOfferObj?.name || selectedOffer,
        customLink: customLink.trim(),
        note,
      });
      showToast("✅ Custom link save হয়েছে!");
      setCustomLink(""); setNote(""); setSelectedOffer("");
      onRefresh();
    } catch(e) { showToast(e.message, "error"); }
    setSaving(false);
  };

  const deleteLink = async (id) => {
    try {
      await api.patch(`/api/workerlinks/${id}/delete`).catch(() =>
        fetch(`/api/workerlinks/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${localStorage.getItem("adaff_token")}` } })
      );
      showToast("Link deleted!", "error");
      onRefresh();
    } catch(e) { showToast(e.message,"error"); }
  };

  const filtered = filterWorker
    ? workerLinks.filter(l => l.workerId === filterWorker)
    : workerLinks;

  const workerName = (wid) => workers.find(w => w.workerId === wid)?.fullName || wid;

  return (
    <>
      <div className="page-header">
        <div className="page-title">🔗 Worker Custom Links</div>
        <div className="page-sub">প্রতিটা Worker এর জন্য প্রতিটা Offer এর আলাদা link set করো</div>
      </div>

      {/* Add / Edit Form */}
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">নতুন Custom Link যোগ করো <div className="section-line" /></div>

        <div className="form-grid" style={{marginBottom:16}}>
          {/* Worker select */}
          <div className="form-group">
            <label>Worker বেছে নাও *</label>
            <select value={selectedWorker} onChange={e=>setSelectedWorker(e.target.value)}>
              <option value="">-- Worker select করো --</option>
              {workers.map(w => (
                <option key={w._id} value={w.workerId}>{w.fullName} ({w.workerId})</option>
              ))}
            </select>
          </div>

          {/* Offer select */}
          <div className="form-group">
            <label>Offer বেছে নাও *</label>
            <select value={selectedOffer} onChange={e=>handleOfferChange(e.target.value)}>
              <option value="">-- Offer select করো --</option>
              {OFFERS.map(o => (
                <option key={o.id} value={o.id}>#{o.id} — {o.name} (${o.payout})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Default link preview */}
        {selectedOfferObj && (
          <div style={{marginBottom:12,padding:"10px 14px",background:"rgba(26,107,255,0.06)",borderRadius:8,border:"1px solid rgba(26,107,255,0.12)"}}>
            <div style={{fontSize:11,color:"#4d6a99",marginBottom:4}}>Default link (reference)</div>
            <div style={{fontSize:12,color:"#8ba3cc",fontFamily:"monospace",wordBreak:"break-all"}}>{selectedOfferObj.link}</div>
          </div>
        )}

        {/* Custom link input */}
        <div className="form-group">
          <label>Custom Link * <span style={{fontSize:11,color:"#4d6a99"}}>(এই worker এর জন্য আলাদা link)</span></label>
          <input
            value={customLink}
            onChange={e=>setCustomLink(e.target.value)}
            placeholder="https://example.com/offer?sub1=WORKER_ID&sub2=custom"
          />
        </div>

        <div className="form-group">
          <label>Note (optional) <span style={{fontSize:11,color:"#4d6a99"}}>— নিজের জন্য memo</span></label>
          <input
            value={note}
            onChange={e=>setNote(e.target.value)}
            placeholder="যেমন: এই worker কে special rate দেওয়া হয়েছে"
          />
        </div>

        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Custom Link"}
        </button>
      </div>

      {/* Existing links table */}
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:12}}>
          <div className="section-title" style={{marginBottom:0}}>Saved Custom Links ({workerLinks.length}) <div className="section-line" /></div>
          <select
            value={filterWorker}
            onChange={e=>setFilterWorker(e.target.value)}
            style={{width:"auto",minWidth:180,padding:"6px 12px",fontSize:12}}
          >
            <option value="">সব Worker দেখাও</option>
            {workers.map(w=>(
              <option key={w._id} value={w.workerId}>{w.fullName}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Worker</th>
                <th>Offer</th>
                <th>Custom Link</th>
                <th>Note</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:"center",color:"#4d6a99",padding:24}}>
                  কোনো custom link নেই। উপরে form থেকে add করো।
                </td></tr>
              ) : filtered.map(l => (
                <tr key={l._id}>
                  <td>
                    <div style={{fontWeight:600,color:"#e8f0ff"}}>{workerName(l.workerId)}</div>
                    <div style={{fontSize:11,color:"#4d6a99",fontFamily:"monospace"}}>{l.workerId}</div>
                  </td>
                  <td>
                    <div style={{fontWeight:500,color:"#e8f0ff",fontSize:13}}>{l.offerName}</div>
                    <div style={{fontSize:11,color:"#4d6a99"}}>ID: {l.offerId}</div>
                  </td>
                  <td style={{maxWidth:220}}>
                    <div style={{fontSize:12,color:"#1a6bff",wordBreak:"break-all",lineHeight:1.5}}>{l.customLink}</div>
                  </td>
                  <td style={{fontSize:12,color:"#8ba3cc"}}>{l.note||"—"}</td>
                  <td style={{fontSize:11}}>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={async()=>{
                        if(!confirm("Delete this link?")) return;
                        try {
                          await fetch(`/api/workerlinks/${l._id}`,{method:"DELETE",headers:{Authorization:`Bearer ${localStorage.getItem("adaff_token")}`}});
                          showToast("Deleted!","error"); onRefresh();
                        } catch(e){ showToast(e.message,"error"); }
                      }}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
