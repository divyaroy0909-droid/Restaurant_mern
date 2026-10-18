import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { call } from "../api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { money } from "../util";

export default function Cart() {
  const { items, total, add, remove, refresh } = useCart();
  const toast = useToast();
  const nav = useNavigate();
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  const act = async (fn) => {
    try { await fn(); } catch (e) { toast.error(e.message); }
  };

  // The API has no "set quantity" route, so decrease = add with quantity -1.
  const dec = (i) => (i.quantity > 1 ? act(() => add(i.menuItem._id, -1)) : act(() => remove(i.menuItem._id)));

  const place = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await call(api.post("/order/place", { address, paymentMethod: "Cash on Delivery" }));
      await refresh();
      toast.success("Order placed. We’re on it!");
      nav("/orders");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (items.length === 0)
    return (
      <main className="wrap narrow">
        <h1 className="page-title">Your cart</h1>
        <p className="empty">Your cart is empty. <Link to="/menu">Browse the menu</Link></p>
      </main>
    );

  return (
    <main className="wrap two-col">
      <section>
        <h1 className="page-title">Your cart</h1>
        <ul className="lines">
          {items.map((i) => (
            <li key={i.menuItem._id}>
              <img src={i.menuItem.image} alt="" />
              <div className="grow">
                <strong>{i.menuItem.name}</strong>
                <span className="muted">{money(i.menuItem.price)} each</span>
              </div>
              <div className="qty">
                <button aria-label="Decrease" onClick={() => dec(i)}>−</button>
                <span>{i.quantity}</span>
                <button aria-label="Increase" onClick={() => act(() => add(i.menuItem._id, 1))}>+</button>
              </div>
              <strong className="line-total">{money(i.menuItem.price * i.quantity)}</strong>
              <button className="link danger" onClick={() => act(() => remove(i.menuItem._id))}>Remove</button>
            </li>
          ))}
        </ul>
      </section>

      <form className="card form sticky" onSubmit={place}>
        <h2>Checkout</h2>
        <label>Delivery address
          <textarea required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat, street, area, landmark" />
        </label>
        <p className="muted">Payment: Cash on delivery</p>
        <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
        <button className="btn" disabled={busy}>{busy ? "Placing order…" : `Place order · ${money(total)}`}</button>
      </form>
    </main>
  );
}
