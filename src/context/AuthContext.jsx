import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentUserRequest, loginRequest } from '../api/auth';
import { AuthContext } from './auth-context';

const TOKEN_STORAGE_KEY = 'diploma_auth_token';
const USER_STORAGE_KEY = 'diploma_auth_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            if (!token) {
                const savedUser = localStorage.getItem(USER_STORAGE_KEY);
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
                setLoading(false);
                return;
            }

            try {
                const currentUser = await getCurrentUserRequest(token);
                setUser(currentUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
            } catch {
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        bootstrap();
    }, [token]);

    const login = async (loginValue, password) => {
        const authData = await loginRequest(loginValue, password);
        setToken(authData.token);
        setUser(authData.user);
        localStorage.setItem(TOKEN_STORAGE_KEY, authData.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
        return authData;
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
    };

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(user && token),
            loading,
            login,
            logout
        }),
        [user, token, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
