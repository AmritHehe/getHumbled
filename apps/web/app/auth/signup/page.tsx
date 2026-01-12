'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';

export default function SignUpPage() {
    const router = useRouter();
    const { signUp, signIn } = useAuth();
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

        const result = await signUp(formData.username, formData.email, formData.password);

        if (result.success) {
            toast.success('Account created successfully!');
            const signInResult = await signIn(formData.email, formData.password);
            if (signInResult.success) {
                router.push('/dashboard');
            } else {
                router.push('/auth/signin');
            }
        } else {
            toast.error(result.error || 'Sign up failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2">
                        Create account
                    </h1>
                    <p className="text-sm text-[var(--text-muted)]">
                        Start your coding journey
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Username"
                        type="text"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                        leftIcon={<User className="w-4 h-4" />}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="john@example.com"
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
                        Sign Up
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-[var(--text-primary)] hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
