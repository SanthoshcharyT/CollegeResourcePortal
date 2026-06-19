import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired (exp is in seconds)
                if (decoded.exp * 1000 < Date.now()) {
                    console.log("Token expired");
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    setUser({ ...decoded, token });
                }
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);

        // Listen for 401 events from Axios
        const handleLogout = () => {
            localStorage.removeItem('token');
            setUser(null);
            queryClient.clear();
            toast.error('Session expired. Please login again.');
        };

        window.addEventListener('auth:logout', handleLogout);

        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const login = async (email, password) => {
        const toastId = toast.loading('Logging in...');
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token } = res.data;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            setUser({ ...decoded, token });
            toast.success('Welcome back!', { id: toastId });
            return { success: true };
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed', { id: toastId });
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData) => {
        const toastId = toast.loading('Registering...');
        try {
            await api.post('/auth/register', userData);
            toast.success('Registration successful! Please login.', { id: toastId });
            return { success: true };
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed', { id: toastId });
            return { success: false, message: err.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        queryClient.cancelQueries(); // Cancel active fetches first
        queryClient.clear();
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
