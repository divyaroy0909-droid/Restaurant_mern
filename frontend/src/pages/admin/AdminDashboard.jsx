import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminOrders from "./AdminOrders.jsx";
import AdminBookings from "./AdminBookings.jsx";
import AdminMenu from "./AdminMenu.jsx";
import AdminCategories from "./AdminCategories.jsx";

const TABS = [
  ["orders", "Orders", AdminOrders],
  ["bookings", "Bookings", AdminBookings],
  ["menu", "Menu items", AdminMenu],
  ["categories", "Categories", AdminCategories],
];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("orders");
  const Active = TABS.find((t) => t[0] === tab)[2];

  return (
    <div className="admin">
      <aside>
        <Link to="/" className="brand">Saffron Table</Link>
        <p className="muted">Staff dashboard</p>
        <nav>
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        <button className="btn ghost small" onClick={async () => { await logout(); nav("/admin/login"); }}>Log out</button>
      </aside>
      <section className="admin-main"><Active /></section>
    </div>
  );
}
