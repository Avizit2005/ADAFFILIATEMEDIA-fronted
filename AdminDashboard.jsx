import { useState, useEffect, useCallback } from "react";
import { api } from "./api.js";
import { GlobalStyles, Sidebar, useToast, StatCard } from "./Layout.jsx";
import Badge from "./Badge.jsx";

export default function AdminDashboard({ user, onLogout }) {
  const [page, setPage] = useState("overview");
  const [workers, setWorkers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [workerLinks, setWorkerLinks] = useState([]);
  const [offers, setOffers] = useState([]);
  const { showToast, ToastEl } = useToast();

  const load = useCallback(async () => {
    try {
      const [w, l, wd, wl, o] = await Promise.all([
        api.get("/api/workers"), api.get("/api/leads"),
        api.get("/api/withdrawals"), api.get("/api/workerlinks"),
        api.get("/api/offers/all"),
      ]);
      setWorkers(w); setLeads(l); setWithdrawals(wd); setWorkerLinks(wl); setOffers(o);
    } catch(e) { showToast(e.message, "error"); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending   = workers.filter(w => w.status === "pending");
  const pendingWd = withdrawals.filter(w => w.status === "pending");

  const approve   = async (id) => { await api.patch(`/api/workers/${id}/approve`);    showToast("Worker approved!"); load(); };
  const reject    = async (id) => { await api.patch(`/api/workers/${id}/reject`);     showToast("Worker rejected.", "error"); load(); };
  const approveWd = async (id) => { await api.patch(`/api/withdrawals/${id}/approve`);showToast("Payment approved!"); load(); };
  const rejectWd  = async (id) => { await api.patch(`/api/withdrawals/${id}/reject`); showToast("Withdrawal rejected.", "error"); load(); };

  const POSTBACK_BASE = "https://adaffiliatemedia-backend-1.onrender.com/postback";

  const navItems = [
    { key:"overview",    icon:"📊", label:"Overview" },
    { key:"approvals",   icon:"👥", label:"Worker Approvals", badge: pending.length || null },
    { key:"workers",     icon:"🧑‍💼", label:"All Workers" },
    { key:"offers",      icon:"💼", label:"Offer Management" },
    { key:"workerlinks", icon:"🔗", label:"Worker Links" },
    { key:"leads",       icon:"🎯", label:"Leads & Postback" },
    { key:"withdrawals", icon:"💳", label:"Withdrawals", badge: pendingWd.length || null },
  ];

  return (
    <>
      <GlobalStyles />
      <div className="grid-bg" /><div className="orb1" /><div className="orb2" />
      <div className="layout">
        <Sidebar navItems={navItems} active={page} onNav={setPage} user={user} onLogout={onLogout} />
        <div className="content">

          {page === "overview" && (
            <>
              <div className="page-header"><div className="page-title">Dashboard Overview</div><div className="page-sub">ADaffiliateMedia Admin Control Center</div></div>
              <div className="stats-grid">
                <StatCard label="Active Workers"    value={workers.filter(w=>w.status==="approved").length} icon="👥" delay={0} />
                <StatCard label="Total Leads"       value={leads.length}   icon="🎯" delay={.05} />
                <StatCard label="Active Offers"     value={offers.filter(o=>o.status==="active").length} icon="💼" delay={.1} />
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

          {page === "approvals" && (
            <>
              <div className="page-header"><div className="page-title">Worker Approvals</div><div className="page-sub">{pending.length} worker{pending.length!==1?"s":""} awaiting approval</div></div>
              {pending.length === 0 ? (
                <div className="card" style={{textAlign:"center",padding:48}}><div style={{fontSize:40,marginBottom:12}}>✅</div><div style={{color:"#8ba3cc"}}>All caught up!</div></div>
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

          {page === "workers" && (
            <>
              <div className="page-header"><div className="page-title">All Workers</div><div className="page-sub">{workers.length} total registered workers</div></div>
              <div className="card"><div className="table-wrap">
                <table>
                  <thead><tr><th>Worker</th><th>ID</th><th>Email</th><th>Country</th><th>Status</th><th>Balance</th><th>Leads</th><th>Joined</th></tr></thead>
                  <tbody>
                    {workers.length === 0 ? <tr><td colSpan={8} style={{textAlign:"center",color:"#4d6a99"}}>No workers yet</td></tr> :
                      workers.map(w => (
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

          {page === "offers" && (
            <OffersPage offers={offers} showToast={showToast} onRefresh={load} />
          )}

          {page === "workerlinks" && (
            <WorkerLinksPage workers={workers.filter(w=>w.status==="approved")} offers={offers.filter(o=>o.status==="active")} workerLinks={workerLinks} showToast={showToast} onRefresh={load} />
          )}

          {page === "leads" && (
            <>
              <div className="page-header"><div className="page-title">Leads & Postback</div><div className="page-sub">Real-time lead tracking</div></div>
              <div className="card" style={{marginBottom:20}}>
                <div className="section-title">🔗 Postback URL (ClickHunts / Everflow) <div className="section-line" /></div>
                <div className="postback-box">
                  {POSTBACK_BASE}?worker_id=<span style={{color:"#ffb930"}}>{"{"+"sub1"+"}"}</span>&offer_id=<span style={{color:"#ffb930"}}>{"{"+"offer_id"+"}"}</span>&payout=<span style={{color:"#ffb930"}}>{"{"+"payout"+"}"}</span>&status=lead&click_id=<span style={{color:"#ffb930"}}>{"{"+"transaction_id"+"}"}</span>
                </div>
                <div style={{marginTop:10,padding:"10px 14px",background:"rgba(0,214,143,0.06)",borderRadius:8,border:"1px solid rgba(0,214,143,0.15)"}}>
                  <div style={{fontSize:12,color:"#00d68f",fontWeight:600,marginBottom:6}}>✅ ClickHunts এ কীভাবে set করবে:</div>
                  <div style={{fontSize:12,color:"#8ba3cc",lineHeight:1.8}}>
                    ClickHunts → Offer → Tracking → Global Postback URL তে উপরের URL paste করো।<br/>
                    Worker এর tracking link এ <span style={{color:"#ffb930",fontFamily:"monospace"}}>sub1={"{"+"WORKER_ID"+"}"}</span> থাকলে lead automatically সেই worker এর account এ যাবে।
                  </div>
                </div>
              </div>
              <div className="card"><div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Worker ID</th><th>Offer</th><th>Payout</th><th>Status</th><th>Click ID</th></tr></thead>
                  <tbody>
                    {leads.length === 0 ? <tr><td colSpan={6} style={{textAlign:"center",color:"#4d6a99",padding:24}}>No leads yet. Postback fires will appear here.</td></tr> :
                      leads.map((l,i) => (
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

          {page === "withdrawals" && (
            <>
              <div className="page-header"><div className="page-title">Withdrawal Requests</div><div className="page-sub">Net-30 · Minimum $50</div></div>
              <div className="card"><div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Worker</th><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {withdrawals.length === 0 ? <tr><td colSpan={7} style={{textAlign:"center",color:"#4d6a99"}}>No withdrawal requests yet</td></tr> :
                      withdrawals.map(w => (
                        <tr key={w._id}>
                          <td style={{fontSize:11}}>{new Date(w.createdAt).toLocaleDateString()}</td>
                          <td style={{fontWeight:600,color:"#e8f0ff"}}>{w.workerName}</td>
                          <td style={{color:"#00d68f",fontFamily:"monospace",fontWeight:700}}>${w.amount.toFixed(2)}</td>
                          <td>{w.method}</td>
                          <td style={{fontFamily:"monospace",fontSize:12}}>{w.account}</td>
                          <td><Badge type={w.status==="paid"?"success":w.status==="rejected"?"danger":"warn"}>{w.status}</Badge></td>
                          <td>{w.status==="pending" && <div style={{display:"flex",gap:6}}><button className="btn btn-success btn-sm" onClick={()=>approveWd(w._id)}>Pay</button><button className="btn btn-danger btn-sm" onClick={()=>rejectWd(w._id)}>Reject</button></div>}</td>
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

// ── Offer Management Page ─────────────────────────────────────────────────────
function OffersPage({ offers, showToast, onRefresh }) {
  const empty = { name:"", payout:"", link:"", category:"CPA", description:"", status:"active" };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    if (!form.name || !form.payout || !form.link) { showToast("Name, Payout, Link দাও", "error"); return; }
    setSaving(true);
    try {
      if (editId) { await api.patch(`/api/offers/${editId}`, form); showToast("Offer updated!"); }
      else { await api.post("/api/offers", form); showToast("✅ New offer added!"); }
      setForm(empty); setEditId(null); setShowForm(false); onRefresh();
    } catch(e) { showToast(e.message, "error"); }
    setSaving(false);
  };

  const startEdit = (o) => {
    setForm({ name:o.name, payout:o.payout, link:o.link, category:o.category||"CPA", description:o.description||"", status:o.status });
    setEditId(o._id); setShowForm(true);
    window.scrollTo(0,0);
  };

  const deleteOffer = async (id, name) => {
    if (!confirm(`"${name}" delete করবে?`)) return;
    try { await api.patch(`/api/offers/${id}`, { status:"inactive" }); showToast("Offer deactivated!", "error"); onRefresh(); }
    catch(e) { showToast(e.message,"error"); }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Offer Management</div>
        <div className="page-sub">নতুন offer যোগ করো, edit করো, বা deactivate করো</div>
      </div>

      <div style={{marginBottom:16}}>
        <button className="btn btn-primary" onClick={()=>{setShowForm(!showForm);setEditId(null);setForm(empty);}}>
          {showForm ? "✕ Cancel" : "+ নতুন Offer যোগ করো"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:24,border:"1px solid rgba(26,107,255,0.3)"}}>
          <div className="section-title">{editId?"✏️ Offer Edit করো":"➕ নতুন Offer যোগ করো"} <div className="section-line" /></div>
          <div className="form-grid">
            <div className="form-group"><label>Offer Name *</label><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. SurveyJunkie Sign Up" /></div>
            <div className="form-group"><label>Worker Payout ($) *</label><input type="number" step="0.01" value={form.payout} onChange={e=>set("payout",e.target.value)} placeholder="e.g. 2.50" /></div>
          </div>
          <div className="form-group"><label>Tracking Link *</label><input value={form.link} onChange={e=>set("link",e.target.value)} placeholder="https://example.com/offer" /></div>
          <div className="form-grid">
            <div className="form-group"><label>Category</label>
              <select value={form.category} onChange={e=>set("category",e.target.value)}>
                <option value="CPA">CPA</option>
                <option value="CPL">CPL</option>
                <option value="CPS">CPS</option>
                <option value="Smartlink">Smartlink</option>
              </select>
            </div>
            <div className="form-group"><label>Status</label>
              <select value={form.status} onChange={e=>set("status",e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Description (optional)</label><input value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Brief description of the offer" /></div>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?"Saving...":editId?"💾 Update Offer":"➕ Add Offer"}</button>
        </div>
      )}

      <div className="card"><div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Offer Name</th><th>Payout</th><th>Category</th><th>Link</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {offers.length === 0 ? <tr><td colSpan={7} style={{textAlign:"center",color:"#4d6a99",padding:24}}>No offers yet. উপরে "নতুন Offer যোগ করো" click করো।</td></tr> :
              offers.map(o => (
                <tr key={o._id}>
                  <td style={{fontFamily:"monospace",fontSize:12,color:"#4d6a99"}}>{o.offerId}</td>
                  <td><div style={{fontWeight:600,color:"#e8f0ff"}}>{o.name}</div>{o.description&&<div style={{fontSize:11,color:"#4d6a99"}}>{o.description}</div>}</td>
                  <td style={{color:"#00d68f",fontFamily:"monospace",fontWeight:700}}>${parseFloat(o.payout).toFixed(2)}</td>
                  <td><Badge type="info">{o.category}</Badge></td>
                  <td style={{fontSize:11,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.link}</td>
                  <td><Badge type={o.status==="active"?"success":"danger"}>{o.status}</Badge></td>
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      <button className="btn btn-outline btn-sm" onClick={()=>startEdit(o)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>deleteOffer(o._id,o.name)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div></div>
    </>
  );
}

// ── Worker Links Page ─────────────────────────────────────────────────────────
function WorkerLinksPage({ workers, offers, workerLinks, showToast, onRefresh }) {
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedOffer,  setSelectedOffer]  = useState("");
  const [customLink,     setCustomLink]      = useState("");
  const [note,           setNote]            = useState("");
  const [saving,         setSaving]          = useState(false);
  const [filterWorker,   setFilterWorker]    = useState("");

  const selectedOfferObj = offers.find(o => o._id === selectedOffer);

  const handleOfferChange = (id) => {
    setSelectedOffer(id);
    const o = offers.find(x => x._id === id);
    if (o && !customLink) setCustomLink(o.link);
  };

  const save = async () => {
    if (!selectedWorker || !selectedOffer || !customLink) { showToast("Worker, Offer আর Custom Link দাও","error"); return; }
    setSaving(true);
    try {
      const workerObj = workers.find(w=>w._id===selectedWorker);
      await api.post("/api/workerlinks", { workerId: workerObj?.workerId, offerId: selectedOfferObj?.offerId, offerName: selectedOfferObj?.name, customLink: customLink.trim(), note });
      showToast("✅ Custom link saved!"); setCustomLink(""); setNote(""); setSelectedOffer(""); onRefresh();
    } catch(e) { showToast(e.message,"error"); }
    setSaving(false);
  };

  const filtered = filterWorker ? workerLinks.filter(l=>l.workerId===workers.find(w=>w._id===filterWorker)?.workerId) : workerLinks;
  const workerName = (wid) => workers.find(w=>w.workerId===wid)?.fullName || wid;

  return (
    <>
      <div className="page-header"><div className="page-title">🔗 Worker Custom Links</div><div className="page-sub">প্রতিটা Worker এর জন্য আলাদা offer link set করো</div></div>
      <div className="card" style={{marginBottom:24}}>
        <div className="section-title">নতুন Custom Link <div className="section-line" /></div>
        <div className="form-grid" style={{marginBottom:16}}>
          <div className="form-group"><label>Worker *</label>
            <select value={selectedWorker} onChange={e=>setSelectedWorker(e.target.value)}>
              <option value="">-- Worker select করো --</option>
              {workers.map(w=><option key={w._id} value={w._id}>{w.fullName} ({w.workerId})</option>)}
            </select>
          </div>
          <div className="form-group"><label>Offer *</label>
            <select value={selectedOffer} onChange={e=>handleOfferChange(e.target.value)}>
              <option value="">-- Offer select করো --</option>
              {offers.map(o=><option key={o._id} value={o._id}>#{o.offerId} — {o.name} (${o.payout})</option>)}
            </select>
          </div>
        </div>
        {selectedOfferObj && <div style={{marginBottom:12,padding:"10px 14px",background:"rgba(26,107,255,0.06)",borderRadius:8,border:"1px solid rgba(26,107,255,0.12)"}}><div style={{fontSize:11,color:"#4d6a99",marginBottom:4}}>Default link</div><div style={{fontSize:12,color:"#8ba3cc",fontFamily:"monospace",wordBreak:"break-all"}}>{selectedOfferObj.link}</div></div>}
        <div className="form-group"><label>Custom Link *</label><input value={customLink} onChange={e=>setCustomLink(e.target.value)} placeholder="https://example.com/offer?sub1=..." /></div>
        <div className="form-group"><label>Note (optional)</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="নিজের জন্য memo" /></div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?"Saving...":"💾 Save Custom Link"}</button>
      </div>
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:12}}>
          <div className="section-title" style={{marginBottom:0}}>Saved Links ({workerLinks.length}) <div className="section-line" /></div>
          <select value={filterWorker} onChange={e=>setFilterWorker(e.target.value)} style={{width:"auto",minWidth:180,padding:"6px 12px",fontSize:12}}>
            <option value="">সব Worker</option>
            {workers.map(w=><option key={w._id} value={w._id}>{w.fullName}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Worker</th><th>Offer</th><th>Custom Link</th><th>Note</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={5} style={{textAlign:"center",color:"#4d6a99",padding:24}}>কোনো custom link নেই।</td></tr> :
                filtered.map(l=>(
                  <tr key={l._id}>
                    <td><div style={{fontWeight:600,color:"#e8f0ff"}}>{workerName(l.workerId)}</div><div style={{fontSize:11,color:"#4d6a99",fontFamily:"monospace"}}>{l.workerId}</div></td>
                    <td><div style={{fontWeight:500,color:"#e8f0ff",fontSize:13}}>{l.offerName}</div></td>
                    <td style={{maxWidth:200}}><div style={{fontSize:12,color:"#1a6bff",wordBreak:"break-all"}}>{l.customLink}</div></td>
                    <td style={{fontSize:12,color:"#8ba3cc"}}>{l.note||"—"}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={async()=>{if(!confirm("Delete?"))return;await fetch(`/api/workerlinks/${l._id}`,{method:"DELETE",headers:{Authorization:`Bearer ${localStorage.getItem("adaff_token")}`}});showToast("Deleted!","error");onRefresh();}}>Delete</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
