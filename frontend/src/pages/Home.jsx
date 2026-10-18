import { Link } from "react-router-dom";
import useCatalog from "../components/useCatalog";
import MenuCard from "../components/MenuCard";

export default function Home() {
  const { categories, items, loading } = useCatalog();
  const featured = items.filter((i) => i.isAvailable).slice(0, 6);

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <h1>Dinner is on its way, or your table is waiting.</h1>
          <p>Order for delivery in a few taps, or reserve a table for tonight. Pay cash when it arrives.</p>
          <div className="row">
            <Link to="/menu" className="btn big">Order now</Link>
            <Link to="/book" className="btn big ghost">Book a table</Link>
          </div>
        </div>
        <ul className="hero-menu" aria-label="Menu categories">
          {loading ? <li className="muted">Loading…</li> :
            categories.slice(0, 6).map((c) => (
              <li key={c._id}>
                <Link to={`/menu?cat=${c._id}`}>
                  <img src={c.image} alt="" />
                  <span>{c.name}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section className="wrap">
        <div className="section-head">
          <h2>Fresh on the menu</h2>
          <Link to="/menu">See the full menu</Link>
        </div>
        {!loading && featured.length === 0 && (
          <p className="empty">No dishes yet. An admin can add some from the dashboard.</p>
        )}
        <div className="grid">{featured.map((i) => <MenuCard key={i._id} item={i} />)}</div>
      </section>
    </main>
  );
}
