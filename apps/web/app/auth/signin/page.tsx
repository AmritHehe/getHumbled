'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';

export default function SignInPage() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await signIn(formData.email, formData.password);

        if (result.success) {
            toast.success('Welcome back!');
            router.push('/dashboard');
        } else {
            toast.error(result.error || 'Sign in failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2">
                        Welcome back
                    </h1>
                    <p className="text-sm text-[var(--text-muted)]">
                        Sign in to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        Sign In
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="text-[var(--text-primary)] hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
