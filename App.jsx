import { useState, useEffect } from "react";
import Auth from "./Auth.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import WorkerDashboard from "./WorkerDashboard.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adaff_token");
    const saved = localStorage.getItem("adaff_user");
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setChecking(false);
  }, []);

  const handleLogin = (u) => {
    localStorage.setItem("adaff_user", JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem("adaff_token");
    localStorage.removeItem("adaff_user");
    setUser(null);
  };

  if (checking) return null;
  if (!user) return <Auth onLogin={handleLogin} />;
  if (user.role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  return <WorkerDashboard user={user} onLogout={handleLogout} />;
}
