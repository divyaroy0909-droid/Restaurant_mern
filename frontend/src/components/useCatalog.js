import { useEffect, useState } from "react";
import api, { call } from "../api";

// Loads categories + menu items (both public endpoints).
export default function useCatalog() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [c, m] = await Promise.all([
        call(api.get("/category/all")),
        call(api.get("/menu/all")),
      ]);
      setCategories(c.categories || []);
      setItems(m.menuItems || []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  return { categories, items, loading, error, reload: load };
}
