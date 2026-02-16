'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function AdminSignInPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await api.adminSignIn(formData);

        if (result.success) {
            toast.success('Welcome back, Admin!');
            router.push('/admin');
        } else {
            toast.error(result.error || 'Sign in failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-surface-alt">
            <div className="w-full max-w-sm">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-elevated mb-4">
                            <span className="text-lg font-bold text-primary">A</span>
                        </div>
                        <h1 className="text-xl font-medium text-primary mb-1">
                            Admin Login
                        </h1>
                        <p className="text-sm text-muted">
                            Sign in to access admin panel
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            Sign In as Admin
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-default text-center">
                        <p className="text-sm text-muted">
                            Need an admin account?{' '}
                            <Link href="/admin/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                        <p className="text-sm text-muted mt-2">
                            <Link href="/auth/signin" className="hover:underline">
                                ← Back to user login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
