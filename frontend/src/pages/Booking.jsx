import { useEffect, useState } from "react";
import api, { call } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const today = () => new Date().toISOString().slice(0, 10);

export default function Booking() {
  const { session } = useAuth();
  const toast = useToast();
  const empty = { name: session?.name || "", phone: "", numberOfPeople: 2, date: today(), time: "19:00", note: "" };
  const [form, setForm] = useState(empty);
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = () =>
    call(api.get("/booking/my-bookings")).then((d) => setMine(d.bookings)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await call(api.post("/booking/create", { ...form, numberOfPeople: Number(form.numberOfPeople) }));
      toast.success("Request sent. We’ll confirm your table soon.");
      setForm(empty);
      load();
    } catch (err) {
      toast.error(err.message); // e.g. "This time slot is already booked"
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="wrap two-col">
      <form className="card form" onSubmit={submit}>
        <h1>Book a table</h1>
        <label>Name<input required value={form.name} onChange={set("name")} /></label>
        <label>Phone<input required type="tel" value={form.phone} onChange={set("phone")} /></label>
        <div className="row">
          <label className="grow">Date<input required type="date" min={today()} value={form.date} onChange={set("date")} /></label>
          <label className="grow">Time<input required type="time" value={form.time} onChange={set("time")} /></label>
        </div>
        <label>Guests<input required type="number" min={1} max={20} value={form.numberOfPeople} onChange={set("numberOfPeople")} /></label>
        <label>Note (optional)<textarea rows={2} value={form.note} onChange={set("note")} placeholder="Birthday, high chair, window seat…" /></label>
        <button className="btn" disabled={busy}>{busy ? "Sending…" : "Request table"}</button>
      </form>

      <section>
        <h2>Your bookings</h2>
        {mine.length === 0 && <p className="empty">No bookings yet.</p>}
        <div className="stack">
          {mine.map((b) => (
            <article key={b._id} className="card">
              <div className="row between">
                <strong>{b.date} at {b.time}</strong>
                <span className={`status ${b.status}`}>{b.status}</span>
              </div>
              <p className="muted">{b.numberOfPeople} guests{b.note ? ` · ${b.note}` : ""}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
