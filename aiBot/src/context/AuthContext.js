import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore token on app start
    useEffect(() => {
        loadToken();
    }, []);

    const loadToken = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync('auth_token');
            if (storedToken) {
                const decoded = jwtDecode(storedToken);
                // Check token expiry
                if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                    await SecureStore.deleteItemAsync('auth_token');
                } else {
                    setToken(storedToken);
                    setUser(decoded);
                    setRole(decoded.role || 'user');
                }
            }
        } catch (error) {
            console.warn('Failed to load token:', error);
            await SecureStore.deleteItemAsync('auth_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken } = response.data.data;

        await SecureStore.setItemAsync('auth_token', newToken);
        const decoded = jwtDecode(newToken);
        setToken(newToken);
        setUser(decoded);
        setRole(decoded.role || 'user');

        return decoded;
    }, []);

    const signup = useCallback(async (email, password, selectedRole) => {
        const response = await api.post('/auth/signup', {
            email,
            password,
            role: selectedRole,
        });
        return response.data;
    }, []);

    const logout = useCallback(async () => {
        await SecureStore.deleteItemAsync('auth_token');
        setToken(null);
        setUser(null);
        setRole(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                role,
                isLoading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
