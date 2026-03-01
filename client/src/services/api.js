import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true
});

// Add a request interceptor to attach Firebase Auth token
api.interceptors.request.use(async (config) => {
    if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
