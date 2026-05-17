import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://ai-interviewer-backend-hdox.onrender.com/api",
});

export default api;
