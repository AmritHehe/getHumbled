'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Target, Flame, TrendingUp, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatsCard } from '@/components/StatsCard';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import type { Contest } from '@/lib/types';

export default function DashboardPage() {
    const { user } = useAuth();
    const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
    const [recentContests, setRecentContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);

            // Fetch upcoming contests
            const upcomingRes = await api.getContests('UPCOMING');
            if (upcomingRes.success && upcomingRes.data) {
                setUpcomingContests(upcomingRes.data.slice(0, 3));
            }

            // Fetch closed contests for recent activity
            const closedRes = await api.getContests('CLOSED');
            if (closedRes.success && closedRes.data) {
                setRecentContests(closedRes.data.slice(0, 5));
            }

            setIsLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div className="container py-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2">
                    Welcome back{user?.name ? `, ${user.name}` : ''}
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Here's your competitive coding journey at a glance.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    title="Contests Joined"
                    value="0"
                    icon={<Trophy className="w-5 h-5" />}
                />
                <StatsCard
                    title="Total Points"
                    value="0"
                    icon={<Target className="w-5 h-5" />}
                />
                <StatsCard
                    title="Current Streak"
                    value="0 days"
                    icon={<Flame className="w-5 h-5" />}
                />
                <StatsCard
                    title="Global Rank"
                    value="-"
                    icon={<TrendingUp className="w-5 h-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Contests */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-medium text-[var(--text-primary)]">
                            Upcoming Contests
                        </h2>
                        <Link href="/contests" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                            View All →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            [1, 2].map((i) => (
                                <div key={i} className="card p-4">
                                    <div className="skeleton h-5 w-3/4 mb-2" />
                                    <div className="skeleton h-4 w-1/2" />
                                </div>
                            ))
                        ) : upcomingContests.length > 0 ? (
                            upcomingContests.map((contest) => (
                                <Link key={contest.id} href={`/contests/${contest.id}`}>
                                    <div className="card p-4 hover:border-[var(--border-hover)] transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
                                                    <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-[var(--text-primary)] text-sm">{contest.title}</h3>
                                                    <p className="text-xs text-[var(--text-muted)]">{contest.type}</p>
                                                </div>
                                            </div>
                                            <Badge variant={contest.type.toLowerCase() as 'dsa' | 'dev'}>
                                                {contest.type}
                                            </Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="card p-6 text-center">
                                <p className="text-sm text-[var(--text-muted)]">No upcoming contests</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-medium text-[var(--text-primary)]">
                            Recent Contests
                        </h2>
                    </div>

                    <div className="card overflow-hidden">
                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="skeleton h-12 w-full" />
                                ))}
                            </div>
                        ) : recentContests.length > 0 ? (
                            <div className="divide-y divide-[var(--border)]">
                                {recentContests.map((contest) => (
                                    <Link key={contest.id} href={`/contests/${contest.id}`}>
                                        <div className="flex items-center justify-between p-4 hover:bg-[var(--bg-secondary)] transition-colors">
                                            <div>
                                                <h3 className="font-medium text-sm text-[var(--text-primary)]">{contest.title}</h3>
                                                <p className="text-xs text-[var(--text-muted)]">{contest.type}</p>
                                            </div>
                                            <span className="text-xs text-[var(--text-muted)]">Completed</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center">
                                <p className="text-sm text-[var(--text-muted)]">No recent contests</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="mt-8 card p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-medium text-[var(--text-primary)] mb-1">
                            Ready for your next challenge?
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                            Browse available contests and start competing.
                        </p>
                    </div>
                    <Link href="/contests">
                        <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                            Browse Contests
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
