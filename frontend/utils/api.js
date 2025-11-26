import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth
export const register = (email, password) =>
    api.post('/api/auth/register', { email, password });

export const login = (email, password) =>
    api.post('/api/auth/login', { email, password });

export const verifyToken = () =>
    api.get('/api/auth/verify-token');

// Bots
export const createBot = (botData) =>
    api.post('/api/bots/create', botData);

export const redeemBot = (code, userId) =>
    api.post('/api/bots/redeem', { code, userId });

export const getBot = (botId) =>
    api.get(`/api/bots/${botId}`);

export const getUserBots = (userId) =>
    api.get(`/api/bots/user/${userId}`);

// Chat
export const sendMessage = (botId, message, userId) =>
    api.post(`/api/chat/${botId}`, { message, userId });

export const getChatHistory = (botId, userId) =>
    api.get(`/api/chat/${botId}/history`, { params: { userId } });

// Payment
export const createCheckoutSession = (botConfig, price) =>
    api.post('/api/payment/create-checkout', { botConfig, price });

export const simulatePayment = () =>
    api.post('/api/payment/simulate');

export default api;
