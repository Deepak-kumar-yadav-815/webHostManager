import axios from 'axios';

const api = axios.create({
  baseURL: 'https://webhostmanager-tvh1.onrender.com',
});

// We no longer use an interceptor for localStorage 'token'.
// AuthContext dynamically injects the Clerk session token or the local adminToken
// into api.defaults.headers.common['Authorization'] upon authentication.

export default api;
