import axios from "axios";
import { API_ORIGIN } from "../utils/format";

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  withCredentials: true, // send the httpOnly auth cookie
  timeout: 20000,
});

// If a protected request comes back 401, tell the auth context the session is gone.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.startsWith("/auth/")) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
