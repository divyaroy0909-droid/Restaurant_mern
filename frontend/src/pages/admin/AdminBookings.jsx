import { useEffect, useState } from "react";
import api, { call } from "../../api";
import { useToast } from "../../context/ToastContext";

const STATUSES = ["Pending", "Approved", "Cancelled"];

export default function AdminBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    call(api.get("/booking/bookings"))
      .then((d) => setBookings([...d.bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))))
      .catch((e) => setError(e.message));
  }, []);

  const setStatus = async (id, status) => {
    try {
      await call(api.put(`/booking/update-status/${id}`, { status }));
      setBookings((bs) => bs.map((b) => (b._id === id ? { ...b, status } : b)));
      toast.success(`Booking ${status.toLowerCase()}`);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <h1>Bookings</h1>
      {error && <p className="error">{error}</p>}
      {!bookings && !error && <p className="muted">Loading…</p>}
      {bookings?.length === 0 && <p className="empty">No bookings yet.</p>}
      <div className="table-wrap">
        {bookings?.length > 0 && (
          <table>
            <thead>
              <tr><th>Date</th><th>Time</th><th>Guest</th><th>Phone</th><th>Party</th><th>Note</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.date}</td>
                  <td>{b.time}</td>
                  <td>{b.name}<div className="muted small-text">{b.user?.email}</div></td>
                  <td>{b.phone}</td>
                  <td>{b.numberOfPeople}</td>
                  <td>{b.note || "—"}</td>
                  <td>
                    <select value={b.status} onChange={(e) => setStatus(b._id, e.target.value)} className={`status-select ${b.status}`}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
