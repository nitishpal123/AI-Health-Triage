import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // In a real app, you'd fetch user details from backend or store role in the JWT itself
                // Assuming the backend sends back role during login and it's saved to localStorage or inside the token
                const userObj = JSON.parse(localStorage.getItem('user'));
                if (userObj) {
                    setUser({ ...decoded, ...userObj });
                }
            } catch (err) {
                console.error("Invalid token");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
        const { accessToken, ...userData } = res.data;
        
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser({ ...jwtDecode(accessToken), ...userData });
        
        return userData; // for routing based on role
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
