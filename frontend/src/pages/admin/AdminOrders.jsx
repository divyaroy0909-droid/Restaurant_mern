import { useEffect, useState } from "react";
import api, { call } from "../../api";
import { useToast } from "../../context/ToastContext";
import { fmtDate, money } from "../../util";

const STATUSES = ["Pending", "Preparing", "Delivered"];

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const load = () =>
    call(api.get("/order/orders")).then((d) => setOrders(d.orders)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await call(api.put(`/order/update-status/${id}`, { status }));
      setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success(`Order marked ${status}`);
    } catch (e) { toast.error(e.message); }
  };

  const shown = orders?.filter((o) => filter === "All" || o.status === filter);

  return (
    <>
      <div className="row between">
        <h1>Orders</h1>
        <div className="chips">
          {["All", ...STATUSES].map((s) => (
            <button key={s} className={`chip ${filter === s ? "on" : ""}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {!orders && !error && <p className="muted">Loading…</p>}
      {shown?.length === 0 && <p className="empty">No orders here.</p>}
      <div className="stack">
        {shown?.map((o) => (
          <article key={o._id} className="card">
            <div className="row between">
              <div>
                <strong>{o.user?.name || "Deleted user"}</strong>
                <span className="muted"> · {o.user?.email} · {fmtDate(o.createdAt)}</span>
              </div>
              <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)} className={`status-select ${o.status}`}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <ul className="plain">
              {o.items.map((i, idx) => (
                <li key={idx}>{i.quantity} × {i.menuItem?.name || "Removed dish"}</li>
              ))}
            </ul>
            <div className="row between">
              <span className="muted">{o.address} · {o.paymentMethod}</span>
              <strong>{money(o.totalAmount)}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
