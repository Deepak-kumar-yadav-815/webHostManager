import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const baseURL = isLocalhost ? 'http://localhost:5000/api' : 'https://webhostmanager-tvh1.onrender.com/api';

const api = axios.create({
  baseURL,
});

// We no longer use an interceptor for localStorage 'token'.
// AuthContext dynamically injects the Clerk session token or the local adminToken
// into api.defaults.headers.common['Authorization'] upon authentication.

export default api;
