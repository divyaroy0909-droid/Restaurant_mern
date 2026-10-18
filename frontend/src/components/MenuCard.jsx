import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { money } from "../util";

export default function MenuCard({ item }) {
  const { isUser } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  const onAdd = async () => {
    if (!isUser) return nav("/login", { state: { from: "/menu" } });
    setBusy(true);
    try {
      await add(item._id, 1);
      toast.success(`${item.name} added to cart`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`dish ${item.isAvailable ? "" : "off"}`}>
      <img src={item.image} alt={item.name} loading="lazy" />
      <div className="dish-body">
        <div className="dish-top">
          <h3>{item.name}</h3>
          <span className="price">{money(item.price)}</span>
        </div>
        <p className="muted">{item.description}</p>
        <button className="btn small" onClick={onAdd} disabled={!item.isAvailable || busy}>
          {item.isAvailable ? (busy ? "Adding…" : "Add to cart") : "Sold out"}
        </button>
      </div>
    </article>
  );
}
