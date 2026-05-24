import { useState } from "react";
import { api } from "../utils/api.js";

const authCss = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
@keyframes authEnter { from{transform:scale(.92) translateY(20px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
@keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-40px)} }
@keyframes gridPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
`;

export default function Auth({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ fullName:"", email:"", password:"", confirmPassword:"", address:"", phone:"", country:"", city:"", state:"", zipcode:"" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text:"", type:"" });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const doRegister = async () => {
    if (!form.fullName || !form.email || !form.password) return setMsg({ text:"Please fill all required fields.", type:"error" });
    if (form.password !== form.confirmPassword) return setMsg({ text:"Passwords do not match.", type:"error" });
    setLoading(true); setMsg({ text:"", type:"" });
    try {
      await api.post("/api/auth/register", form);
      setMsg({ text:"Registration successful! Awaiting admin approval.", type:"success" });
      setTimeout(() => { setTab("login"); setMsg({ text:"", type:"" }); }, 2500);
    } catch(e) { setMsg({ text: e.message, type:"error" }); }
    setLoading(false);
  };

  const doLogin = async () => {
    setLoading(true); setMsg({ text:"", type:"" });
    try {
      const data = await api.post("/api/auth/login", { email: form.email, password: form.password });
      localStorage.setItem("adaff_token", data.token);
      onLogin(data.user);
    } catch(e) { setMsg({ text: e.message, type:"error" }); }
    setLoading(false);
  };

  const s = { wrap:{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#050d1a",fontFamily:"'Sora',sans-serif",position:"relative" },
    gridBg:{ position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(26,107,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,107,255,.04) 1px,transparent 1px)",backgroundSize:"40px 40px",animation:"gridPulse 8s ease-in-out infinite" },
    orb1:{ position:"fixed",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(26,107,255,.1) 0%,transparent 70%)",top:-200,left:-100,animation:"orbFloat 12s ease-in-out infinite" },
    card:{ background:"#0a1628",border:"1px solid rgba(26,107,255,.25)",borderRadius:20,padding:40,width:"100%",maxWidth:480,boxShadow:"0 24px 80px rgba(0,0,50,.6)",animation:"authEnter .5s cubic-bezier(.34,1.56,.64,1)",position:"relative",zIndex:1 },
    tabWrap:{ display:"flex",gap:8,marginBottom:24,background:"#0f1f3d",borderRadius:10,padding:4 },
    tab:(a)=>({ flex:1,textAlign:"center",padding:8,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,color: a?"#fff":"#8ba3cc",background: a?"#1a6bff":"transparent",transition:"all .2s" }),
    inp:{ width:"100%",background:"#0f1f3d",border:"1px solid rgba(26,107,255,.15)",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#e8f0ff",fontFamily:"'Sora',sans-serif",outline:"none",marginBottom:0 },
    label:{ fontSize:12,color:"#8ba3cc",fontWeight:500,display:"block",marginBottom:6 },
    btn:{ width:"100%",background:"#1a6bff",color:"#fff",border:"none",borderRadius:8,padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif",marginTop:8 },
  };

  return (
    <div style={s.wrap}>
      <style>{authCss}</style>
      <div style={s.gridBg} />
      <div style={s.orb1} />
      <div style={s.card}>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ fontSize:12,fontWeight:700,color:"#1a6bff",letterSpacing:2,textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            <span style={{ width:7,height:7,background:"#1a6bff",borderRadius:"50%",display:"inline-block",animation:"blink 2s ease infinite" }} />
            ADaffiliateMedia
          </div>
          <div style={{ fontSize:22,fontWeight:700,color:"#e8f0ff",margin:"12px 0 6px",letterSpacing:"-.5px" }}>{tab==="login"?"Welcome Back":"Create Account"}</div>
          <div style={{ fontSize:13,color:"#8ba3cc" }}>{tab==="login"?"Sign in to your affiliate dashboard":"Join our affiliate network"}</div>
        </div>

        <div style={s.tabWrap}>
          <div style={s.tab(tab==="login")} onClick={()=>{setTab("login");setMsg({text:"",type:""});}}>Sign In</div>
          <div style={s.tab(tab==="register")} onClick={()=>{setTab("register");setMsg({text:"",type:""});}}>Register</div>
        </div>

        {tab==="login" ? (
          <>
            <div style={{ marginBottom:16 }}><label style={s.label}>Email Address</label><input style={s.inp} type="email" placeholder="worker@email.com" value={form.email} onChange={e=>set("email",e.target.value)} /></div>
            <div style={{ marginBottom:16 }}><label style={s.label}>Password</label><input style={s.inp} type="password" placeholder="••••••••" value={form.password} onChange={e=>set("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} /></div>
            <div style={{ fontSize:11,color:"#4d6a99",marginBottom:12 }}>Demo Admin: admin@adaff.com / admin123</div>
          </>
        ) : (
          <>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:0 }}>
              <div style={{ marginBottom:12 }}><label style={s.label}>Full Name *</label><input style={s.inp} value={form.fullName} onChange={e=>set("fullName",e.target.value)} placeholder="John Doe" /></div>
              <div style={{ marginBottom:12 }}><label style={s.label}>Email *</label><input style={s.inp} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="you@email.com" /></div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:0 }}>
              <div style={{ marginBottom:12 }}><label style={s.label}>Password *</label><input style={s.inp} type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" /></div>
              <div style={{ marginBottom:12 }}><label style={s.label}>Confirm Password *</label><input style={s.inp} type="password" value={form.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)} placeholder="••••••••" /></div>
            </div>
            <div style={{ marginBottom:12 }}><label style={s.label}>Address</label><input style={s.inp} value={form.address} onChange={e=>set("address",e.target.value)} placeholder="123 Street Name" /></div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:0 }}>
              <div style={{ marginBottom:12 }}><label style={s.label}>Phone Number</label><input style={s.inp} value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+880 1XXXXXXXXX" /></div>
              <div style={{ marginBottom:12 }}><label style={s.label}>Country</label><input style={s.inp} value={form.country} onChange={e=>set("country",e.target.value)} placeholder="Bangladesh" /></div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:0 }}>
              <div style={{ marginBottom:12 }}><label style={s.label}>City</label><input style={s.inp} value={form.city} onChange={e=>set("city",e.target.value)} placeholder="Dhaka" /></div>
              <div style={{ marginBottom:12 }}><label style={s.label}>State</label><input style={s.inp} value={form.state} onChange={e=>set("state",e.target.value)} placeholder="Dhaka Division" /></div>
              <div style={{ marginBottom:12 }}><label style={s.label}>Zipcode</label><input style={s.inp} value={form.zipcode} onChange={e=>set("zipcode",e.target.value)} placeholder="1200" /></div>
            </div>
          </>
        )}

        {msg.text && <div style={{ fontSize:12,color:msg.type==="success"?"#00d68f":"#ff4757",marginBottom:12 }}>{msg.text}</div>}
        <button style={s.btn} onClick={tab==="login"?doLogin:doRegister} disabled={loading}>
          {loading ? "Please wait..." : tab==="login" ? "Sign In →" : "Create Account →"}
        </button>
      </div>
    </div>
  );
}
