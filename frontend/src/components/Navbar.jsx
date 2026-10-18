import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { session, isUser, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  const out = async () => { await logout(); nav("/"); };

  return (
    <header className="nav">
      <Link to="/" className="brand">Saffron Table</Link>
      <nav>
        <NavLink to="/menu">Menu</NavLink>
        {isUser && <NavLink to="/book">Book a table</NavLink>}
        {isUser && <NavLink to="/orders">My orders</NavLink>}
        {isUser && <NavLink to="/cart">Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>}
        {isAdmin && <NavLink to="/admin">Dashboard</NavLink>}
      </nav>
      <div className="nav-end">
        {session ? (
          <>
            <span className="muted hide-sm">{session.name}</span>
            <button className="btn ghost small" onClick={out}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn ghost small">Log in</Link>
            <Link to="/register" className="btn small">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
