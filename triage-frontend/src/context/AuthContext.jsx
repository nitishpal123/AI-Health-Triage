import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
const ROLE_ROUTES = {
    HospitalAdmin: '/tenant',
    SuperAdmin:    '/tenant',
    Doctor:        '/doctor',
    Pathologist:   '/pathology',
    Patient:       '/patient',
};

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionAlert, setSessionAlert] = useState(null); // 'expiring' | 'expired'

    const inactivityTimer  = useRef(null);
    const warningTimer     = useRef(null);
    const isRefreshing     = useRef(false);
    const refreshQueue     = useRef([]);

    // ── helpers ──────────────────────────────────────────────────────────────
    const clearSession = useCallback((reason = null) => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        if (reason) setSessionAlert(reason);
        clearTimeout(inactivityTimer.current);
        clearTimeout(warningTimer.current);
    }, []);

    const resetInactivityTimer = useCallback(() => {
        clearTimeout(inactivityTimer.current);
        clearTimeout(warningTimer.current);
        setSessionAlert(null);

        // Warn 2 min before logout
        warningTimer.current = setTimeout(() => {
            setSessionAlert('expiring');
        }, INACTIVITY_LIMIT - 2 * 60 * 1000);

        inactivityTimer.current = setTimeout(() => {
            doLogout('inactivity');
        }, INACTIVITY_LIMIT);
    }, []);

    // ── silent token refresh ──────────────────────────────────────────────────
    const silentRefresh = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;

        try {
            const { data } = await axios.post('/api/auth/refresh', { token: refreshToken });
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data.accessToken;
        } catch {
            clearSession('expired');
            return null;
        }
    }, [clearSession]);

    // ── axios interceptors ────────────────────────────────────────────────────
    useEffect(() => {
        // Attach token to every request
        const reqInterceptor = axios.interceptors.request.use(config => {
            const token = localStorage.getItem('token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        // On 401 TOKEN_EXPIRED → silent refresh → retry original request
        const resInterceptor = axios.interceptors.response.use(
            res => res,
            async error => {
                const original = error.config;
                const code = error.response?.data?.code;

                if (error.response?.status === 401 && code === 'TOKEN_EXPIRED' && !original._retry) {
                    original._retry = true;

                    if (isRefreshing.current) {
                        // Queue requests while refresh is in flight
                        return new Promise((resolve, reject) => {
                            refreshQueue.current.push({ resolve, reject });
                        }).then(token => {
                            original.headers.Authorization = `Bearer ${token}`;
                            return axios(original);
                        });
                    }

                    isRefreshing.current = true;
                    const newToken = await silentRefresh();
                    isRefreshing.current = false;

                    if (newToken) {
                        refreshQueue.current.forEach(p => p.resolve(newToken));
                        refreshQueue.current = [];
                        original.headers.Authorization = `Bearer ${newToken}`;
                        return axios(original);
                    } else {
                        refreshQueue.current.forEach(p => p.reject(error));
                        refreshQueue.current = [];
                    }
                }

                // Any other 401/403 that isn't retryable
                if (error.response?.status === 401 && code !== 'TOKEN_EXPIRED') {
                    clearSession('expired');
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(reqInterceptor);
            axios.interceptors.response.eject(resInterceptor);
        };
    }, [silentRefresh, clearSession]);

    // ── inactivity listeners ──────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
        const handler = () => resetInactivityTimer();
        events.forEach(e => window.addEventListener(e, handler, { passive: true }));
        resetInactivityTimer();
        return () => {
            events.forEach(e => window.removeEventListener(e, handler));
            clearTimeout(inactivityTimer.current);
            clearTimeout(warningTimer.current);
        };
    }, [user, resetInactivityTimer]);

    // ── restore session on reload ─────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        const stored = localStorage.getItem('user');
        if (token && stored) {
            try {
                const decoded = jwtDecode(token);
                // If access token already expired, try silent refresh immediately
                if (decoded.exp * 1000 < Date.now()) {
                    silentRefresh().then(newToken => {
                        if (newToken) {
                            setUser(JSON.parse(stored));
                        }
                        setLoading(false);
                    });
                    return;
                }
                setUser(JSON.parse(stored));
            } catch {
                clearSession();
            }
        }
        setLoading(false);
    }, []);

    // ── public API ────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        const { data } = await axios.post('/api/auth/login', { email, password });
        const { accessToken, refreshToken, ...userData } = data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        resetInactivityTimer();
        return userData;
    };

    const doLogout = useCallback(async (reason = null) => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await axios.post('/api/auth/logout', { token: refreshToken });
        } catch { /* best-effort */ }
        clearSession(reason);
    }, [clearSession]);

    const logout = () => doLogout();

    const homeRoute = user ? (ROLE_ROUTES[user.role] || '/') : '/';

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, homeRoute, sessionAlert, setSessionAlert }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
