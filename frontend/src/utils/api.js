import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // For multipart uploads, drop the default JSON Content-Type so axios sets
  // `multipart/form-data` with the correct boundary. Otherwise axios v1 would
  // convert the FormData (incl. File objects) to JSON and the upload would arrive
  // without the file — failing server file/image validation.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers) delete config.headers['Content-Type'];
  }
  // Attach the active UI language so the API can translate CMS content on the fly.
  try {
    const lang = localStorage.getItem('lang');
    if (lang) {
      config.headers = config.headers || {};
      config.headers['X-Locale'] = lang;
    }
  } catch { /* ignore */ }
  return config;
});

// --- Session management: silently refresh an expired JWT, then retry once ---
let refreshPromise = null;

function refreshToken() {
  if (!refreshPromise) {
    const token = localStorage.getItem('token');
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const newToken = res.data.access_token;
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes('/auth/');

    // Token expired -> try a one-time silent refresh, then replay the request.
    if (status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        const newToken = await refreshToken();
        original.headers = original.headers || {};
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
