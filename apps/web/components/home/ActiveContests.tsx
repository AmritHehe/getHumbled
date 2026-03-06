'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ContestCard } from '@/components/ContestCard';
import type { Contest } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function ActiveContests() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContests() {
            const response = await api.getContests({ status: 'LIVE' });
            if (response.success && response.data) {
                setContests(response.data.slice(0, 3));
            }
            setLoading(false);
        }
        fetchContests();
    }, []);

    return (
        <section className="section">
            <div className="container">
                <div className="flex items-center justify-between mb-8">
                    <h2>Active Contests</h2>
                    <Link href="/contests" className="text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card p-5">
                                <div className="skeleton h-5 w-16 mb-3" />
                                <div className="skeleton h-6 w-3/4 mb-2" />
                                <div className="skeleton h-4 w-1/2 mb-4" />
                                <div className="skeleton h-10 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : contests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {contests.map((contest) => (
                            <ContestCard key={contest.id} contest={contest} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted text-center py-8">No live contests at the moment</p>
                )}
            </div>
        </section>
    );
}
