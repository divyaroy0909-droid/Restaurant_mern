import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { call } from "../api";
import useCatalog from "../components/useCatalog";
import { fmtDate, money } from "../util";

export default function Orders() {
  const { items: menu } = useCatalog();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    call(api.get("/order/my-orders"))
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message));
  }, []);

  // /my-orders returns unpopulated item ids, so resolve names from the menu list.
  const nameOf = (id) => menu.find((m) => m._id === id)?.name || "Removed dish";

  return (
    <main className="wrap narrow">
      <h1 className="page-title">My orders</h1>
      {error && <p className="error">{error}</p>}
      {orders && orders.length === 0 && <p className="empty">No orders yet. <Link to="/menu">Order something tasty</Link></p>}
      <div className="stack">
        {orders?.map((o) => (
          <article key={o._id} className="card">
            <div className="row between">
              <span className="muted">{fmtDate(o.createdAt)}</span>
              <span className={`status ${o.status}`}>{o.status}</span>
            </div>
            <ul className="plain">
              {o.items.map((i, idx) => (
                <li key={idx}>{i.quantity} × {nameOf(i.menuItem)}</li>
              ))}
            </ul>
            <div className="row between">
              <span className="muted">{o.address}</span>
              <strong>{money(o.totalAmount)}</strong>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
