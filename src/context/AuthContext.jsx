import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUserRequest, loginRequest, logoutRequest } from '../api/auth';
import { AuthContext } from './auth-context';

const TOKEN_STORAGE_KEY = 'diploma_auth_token';
const USER_STORAGE_KEY = 'diploma_auth_user';

const readSavedUser = () => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            if (!token) {
                const parsedUser = readSavedUser();
                if (parsedUser) {
                    setUser(parsedUser);
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

    const login = useCallback(async (loginValue, password) => {
        const authData = await loginRequest(loginValue, password);
        setToken(authData.token);
        setUser(authData.user);
        localStorage.setItem(TOKEN_STORAGE_KEY, authData.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
        return authData;
    }, []);

    const logout = useCallback(async () => {
        const currentToken = token;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);

        if (currentToken) {
            try {
                await logoutRequest(currentToken);
            } catch {
                // ignore network/logout errors in client cleanup flow
            }
        }
    }, [token]);

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: Boolean(user && token),
            loading,
            login,
            logout
        }),
        [user, token, loading, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
