import { useRef, useState } from "react";
import api, { call } from "../../api";
import useCatalog from "../../components/useCatalog";
import { useToast } from "../../context/ToastContext";

export default function AdminCategories() {
  const { categories, loading, reload } = useCatalog();
  const toast = useToast();
  const fileRef = useRef();
  const [editing, setEditing] = useState(null); // category or null
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => { setEditing(null); setName(""); if (fileRef.current) fileRef.current.value = ""; };

  const startEdit = (c) => { setEditing(c); setName(c.name); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!editing && !file) return toast.error("Choose an image for the category");
    const fd = new FormData();
    fd.append("name", name);
    if (file) fd.append("image", file);
    setBusy(true);
    try {
      editing
        ? await call(api.put(`/category/update/${editing._id}`, fd))
        : await call(api.post("/category/add", fd));
      toast.success(editing ? "Category updated" : "Category added");
      reset();
      reload();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const del = async (c) => {
    if (!confirm(`Delete “${c.name}”? Dishes in this category will lose their category.`)) return;
    try {
      await call(api.delete(`/category/delete/${c._id}`));
      toast.success("Category deleted");
      reload();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <h1>Categories</h1>
      <form className="card form inline-form" onSubmit={submit}>
        <h2>{editing ? `Edit “${editing.name}”` : "Add category"}</h2>
        <label>Name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>Image {editing && <span className="muted">(leave empty to keep current)</span>}
          <input ref={fileRef} type="file" accept="image/*" />
        </label>
        <div className="row">
          <button className="btn" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add category"}</button>
          {editing && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      {loading && <p className="muted">Loading…</p>}
      <div className="grid small-grid">
        {categories.map((c) => (
          <article key={c._id} className="card cat">
            <img src={c.image} alt="" />
            <strong>{c.name}</strong>
            <div className="row">
              <button className="link" onClick={() => startEdit(c)}>Edit</button>
              <button className="link danger" onClick={() => del(c)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
