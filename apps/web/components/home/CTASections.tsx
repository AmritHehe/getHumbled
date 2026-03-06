'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';

export function HeroCTA() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="flex items-center gap-4">
            <Link href="/contests">
                <Button variant="primary">Browse Contests</Button>
            </Link>
            <Link href={isAuthenticated ? '/practice/new' : '/auth/signin'}>
                <Button variant="secondary">Practice with AI</Button>
            </Link>
        </div>
    );
}

export function BottomCTA() {
    const { isAuthenticated } = useAuth();

    return (
        <section className="section border-t border-default">
            <div className="container">
                <div className="text-center max-w-md mx-auto">
                    <h2 className="mb-4">Ready to compete?</h2>
                    <p className="text-secondary mb-8">
                        {isAuthenticated
                            ? 'Jump into a contest and test your skills.'
                            : 'Create a free account and start competing today.'
                        }
                    </p>
                    <Link href={isAuthenticated ? '/contests' : '/auth/signup'}>
                        <Button variant="primary" size="lg">
                            {isAuthenticated ? 'Browse Contests' : 'Create Account'}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
