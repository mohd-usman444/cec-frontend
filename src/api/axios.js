import axios from 'axios';

const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || 'http://localhost:5000')
    .replace(/\/+$/, '')}/api`,
  withCredentials: true, // Important for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
