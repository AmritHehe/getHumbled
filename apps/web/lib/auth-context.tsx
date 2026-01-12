'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
import type { User, Role } from './types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = api.getToken();
        if (token) {
            // Try to decode the JWT to get user info
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload.userId,
                    name: '',
                    email: null,
                    role: payload.role === 'Admin' ? 'ADMIN' : 'USER',
                });
            } catch {
                api.signOut();
            }
        }
        setIsLoading(false);
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const response = await api.signIn({ email, password });

        if (response.success && response.data?.token) {
            try {
                const payload = JSON.parse(atob(response.data.token.split('.')[1]));
                setUser({
                    id: payload.userId,
                    name: '',
                    email,
                    role: payload.role === 'Admin' ? 'ADMIN' : 'USER',
                });
                return { success: true };
            } catch {
                return { success: false, error: 'Failed to decode token' };
            }
        }

        return { success: false, error: response.error || 'Sign in failed' };
    }, []);

    const signUp = useCallback(async (username: string, email: string, password: string) => {
        const response = await api.signUp({ username, email, password });

        if (response.success) {
            return { success: true };
        }

        return { success: false, error: response.error || 'Sign up failed' };
    }, []);

    const signOut = useCallback(() => {
        api.signOut();
        setUser(null);
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
