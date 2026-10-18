import { useRef, useState } from "react";
import api, { call } from "../../api";
import useCatalog from "../../components/useCatalog";
import { useToast } from "../../context/ToastContext";
import { money } from "../../util";

const blank = { name: "", description: "", price: "", category: "", isAvailable: true };

export default function AdminMenu() {
  const { categories, items, loading, reload } = useCatalog();
  const toast = useToast();
  const fileRef = useRef();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const reset = () => { setEditing(null); setForm(blank); if (fileRef.current) fileRef.current.value = ""; };

  const startEdit = (m) => {
    setEditing(m);
    setForm({
      name: m.name, description: m.description, price: m.price,
      category: m.category?._id || "", isAvailable: m.isAvailable,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!editing && !file) return toast.error("Choose a photo for the dish");
    if (!form.category) return toast.error("Choose a category");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("image", file);
    setBusy(true);
    try {
      editing
        ? await call(api.put(`/menu/update/${editing._id}`, fd))
        : await call(api.post("/menu/add", fd));
      toast.success(editing ? "Dish updated" : "Dish added");
      reset();
      reload();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const toggle = async (m) => {
    try {
      await call(api.put(`/menu/update/${m._id}`, { isAvailable: !m.isAvailable }));
      reload();
    } catch (err) { toast.error(err.message); }
  };

  const del = async (m) => {
    if (!confirm(`Delete “${m.name}”?`)) return;
    try {
      await call(api.delete(`/menu/delete/${m._id}`));
      toast.success("Dish deleted");
      reload();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <h1>Menu items</h1>
      <form className="card form inline-form" onSubmit={submit}>
        <h2>{editing ? `Edit “${editing.name}”` : "Add dish"}</h2>
        <div className="row">
          <label className="grow">Name<input required value={form.name} onChange={set("name")} /></label>
          <label>Price (₹)<input required type="number" min="0" value={form.price} onChange={set("price")} /></label>
        </div>
        <label>Description<textarea required rows={2} value={form.description} onChange={set("description")} /></label>
        <div className="row">
          <label className="grow">Category
            <select required value={form.category} onChange={set("category")}>
              <option value="">Select…</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
          <label className="grow">Photo {editing && <span className="muted">(optional)</span>}
            <input ref={fileRef} type="file" accept="image/*" />
          </label>
        </div>
        {editing && (
          <label className="check">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
            Available to order
          </label>
        )}
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add dish"}</button>
          {editing && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}
        </div>
        {categories.length === 0 && <p className="error">Add a category first, then you can add dishes.</p>}
      </form>

      {loading && <p className="muted">Loading…</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th></th><th>Dish</th><th>Category</th><th>Price</th><th>Available</th><th></th></tr></thead>
          <tbody>
            {items.map((m) => (
              <tr key={m._id}>
                <td><img className="thumb" src={m.image} alt="" /></td>
                <td>{m.name}</td>
                <td>{m.category?.name || "—"}</td>
                <td>{money(m.price)}</td>
                <td><input type="checkbox" checked={m.isAvailable} onChange={() => toggle(m)} aria-label={`${m.name} available`} /></td>
                <td className="actions">
                  <button className="link" onClick={() => startEdit(m)}>Edit</button>
                  <button className="link danger" onClick={() => del(m)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
