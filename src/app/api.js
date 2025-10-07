import axios from 'axios';
export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // або sessionStorage, залежно від того, де зберігаєш
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.error('[API ERROR]', err?.response?.status, err?.response?.data || err.message);
        throw err;
    }
);