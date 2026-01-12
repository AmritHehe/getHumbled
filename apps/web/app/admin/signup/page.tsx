'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function AdminSignUpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        const result = await api.adminSignUp(formData);

        if (result.success) {
            toast.success('Admin account created!');
            // Sign in after signup
            const signInResult = await api.adminSignIn({
                email: formData.email,
                password: formData.password,
            });
            if (signInResult.success) {
                router.push('/admin');
            } else {
                router.push('/admin/signin');
            }
        } else {
            toast.error(result.error || 'Sign up failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg-secondary)]">
            <div className="w-full max-w-sm">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-elevated)] mb-4">
                            <span className="text-lg font-bold text-[var(--text-primary)]">A</span>
                        </div>
                        <h1 className="text-xl font-medium text-[var(--text-primary)] mb-1">
                            Admin Registration
                        </h1>
                        <p className="text-sm text-[var(--text-muted)]">
                            Create an admin account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Username"
                            type="text"
                            placeholder="admin"
                            value={formData.username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                            leftIcon={<User className="w-4 h-4" />}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="admin@example.com"
                            value={formData.email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            leftIcon={<Mail className="w-4 h-4" />}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                            leftIcon={<Lock className="w-4 h-4" />}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Create Admin Account
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-[var(--border)] text-center">
                        <p className="text-sm text-[var(--text-muted)]">
                            Already have an admin account?{' '}
                            <Link href="/admin/signin" className="text-[var(--text-primary)] hover:underline">
                                Sign in
                            </Link>
                        </p>
                        <p className="text-sm text-[var(--text-muted)] mt-2">
                            <Link href="/auth/signup" className="hover:underline">
                                ← Back to user registration
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
