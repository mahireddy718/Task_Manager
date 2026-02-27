const API = import.meta.env.VITE_API_URL;
fetch(`${API}/api/auth/login`, {
  method: "POST",
});
export default API;
