import axios from "axios";

// Calls the backend directly (CORS). Override with VITE_API_URL in .env.
// Use "localhost" (not 127.0.0.1) on both sides so the cookie is same-site.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // send the httpOnly auth cookie
  timeout: 10000,        // adminOnly can hang on a bad token; fail instead of spinning forever
});

// If the server says our session is invalid, clear it and go to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.includes("login")) {
      localStorage.removeItem("restaurant_session");
      location.href = location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
    }
    return Promise.reject(err);
  }
);

// The backend often answers HTTP 200 with { success:false, message }.
// This helper turns every failure into a thrown Error with a readable message.
export async function call(promise) {
  try {
    const { data } = await promise;
    if (data && data.success === false) throw new Error(data.message || "Something went wrong");
    return data;
  } catch (err) {
    if (err.response?.data?.message) throw new Error(err.response.data.message);
    if (err.code === "ECONNABORTED")
      throw new Error("The server didn’t respond. For admin pages, log in again and check ADMIN_EMAIL in the backend .env.");
    if (err.message === "Network Error")
      throw new Error("Can’t reach the backend. Is it running on port 5000, and is CORS set up?");
    throw err;
  }
}

export default api;
