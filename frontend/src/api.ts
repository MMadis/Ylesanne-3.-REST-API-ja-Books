import axios, { AxiosInstance } from "axios";

// Loo axios instants, mis kasutab .env failist VITE_API_URL muutujat (või vaikimisi http://localhost:3001/api/v1)
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",
});

// Request interceptor: lisab igale päringule (k.a. GET päringutele, mis küsivad kaitstud ressursse)
// Authorization päise, kui localStorage-s leidub aktiivne token.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Lisa Bearer token
  }
  return config;
});

// Response interceptor: püüab kinni 401 Unauthorized vastused.
// Kui server vastab 401, siis puhastab localStorage-i vigasest tokenist
// ja suunab kasutaja sisselogimise vaatesse.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Suuna sisselogimisele
    }
    return Promise.reject(error);
  }
);
