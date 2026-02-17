'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { api } from './api';
import type { User } from './types';

interface JwtPayload {
    userId: string;
    name?: string;
    email?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    adminSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    adminSignUp: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeToken(token: string): User | null {
    try {
        const payload = jwtDecode<JwtPayload>(token);
        return {
            id: payload.userId,
            name: payload.name || '',
            email: payload.email || '',
            role: payload.role === 'ADMIN' ? 'ADMIN' : 'USER',
        };
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from existing token on mount
    useEffect(() => {
        const token = api.getToken();
        if (token) {
            const decoded = decodeToken(token);
            decoded ? setUser(decoded) : api.signOut();
        }
        setIsLoading(false);
    }, []);

    async function signIn(email: string, password: string) {
        const res = await api.signIn({ email, password });

        if (res.success && res.data?.token) {
            const decoded = decodeToken(res.data.token);
            if (decoded) {
                setUser(decoded);
                return { success: true };
            }
            return { success: false, error: 'Failed to decode token' };
        }

        return { success: false, error: res.error || 'Sign in failed' };
    }

    async function signUp(username: string, email: string, password: string) {
        const res = await api.signUp({ username, email, password });
        return res.success
            ? { success: true }
            : { success: false, error: res.error || 'Sign up failed' };
    }

    async function adminSignIn(email: string, password: string) {
        const res = await api.adminSignIn({ email, password });

        if (res.success && res.data?.token) {
            const decoded = decodeToken(res.data.token);
            if (decoded) {
                setUser(decoded);
                return { success: true };
            }
            return { success: false, error: 'Failed to decode token' };
        }

        return { success: false, error: res.error || 'Sign in failed' };
    }

    async function adminSignUp(username: string, email: string, password: string) {
        const res = await api.adminSignUp({ username, email, password });
        return res.success
            ? { success: true }
            : { success: false, error: res.error || 'Sign up failed' };
    }

    function signOut() {
        api.signOut();
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'ADMIN',
            signIn,
            signUp,
            adminSignIn,
            adminSignUp,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
