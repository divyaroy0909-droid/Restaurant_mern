import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useCatalog from "../components/useCatalog";
import MenuCard from "../components/MenuCard";

export default function Menu() {
  const { categories, items, loading, error } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const cat = params.get("cat") || "all";

  const shown = useMemo(
    () =>
      items.filter(
        (i) =>
          (cat === "all" || i.category?._id === cat) &&
          i.name.toLowerCase().includes(q.toLowerCase())
      ),
    [items, cat, q]
  );

  const pick = (id) => (id === "all" ? setParams({}) : setParams({ cat: id }));

  return (
    <main className="wrap">
      <h1 className="page-title">Menu</h1>
      <div className="filters">
        <div className="chips">
          <button className={`chip ${cat === "all" ? "on" : ""}`} onClick={() => pick("all")}>All</button>
          {categories.map((c) => (
            <button key={c._id} className={`chip ${cat === c._id ? "on" : ""}`} onClick={() => pick(c._id)}>
              {c.name}
            </button>
          ))}
        </div>
        <input className="search" placeholder="Search dishes" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading && <p className="muted">Loading menu…</p>}
      {error && <p className="error">Couldn’t load the menu: {error}. Check that the backend is running.</p>}
      {!loading && !error && shown.length === 0 && <p className="empty">No dishes match. Try another category or search.</p>}
      <div className="grid">{shown.map((i) => <MenuCard key={i._id} item={i} />)}</div>
    </main>
  );
}
