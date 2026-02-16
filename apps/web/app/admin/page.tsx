'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trophy, Users, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/StatsCard';
import { api } from '@/lib/api';
import type { Contest } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const response = await api.getContests();
            if (response.success && response.data) {
                setContests(response.data);
            }
            setIsLoading(false);
        }
        fetchData();
    }, []);

    const liveCount = contests.filter(c => c.status === 'LIVE').length;
    const upcomingCount = contests.filter(c => c.status === 'UPCOMING').length;
    const closedCount = contests.filter(c => c.status === 'CLOSED').length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-medium text-primary mb-1">
                        Dashboard
                    </h1>
                    <p className="text-sm text-muted">
                        Overview of your platform
                    </p>
                </div>
                <Link href="/admin/contests/new">
                    <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                        New Contest
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    title="Total Contests"
                    value={isLoading ? '-' : String(contests.length)}
                    icon={<Trophy className="w-5 h-5" />}
                />
                <StatsCard
                    title="Live Now"
                    value={isLoading ? '-' : String(liveCount)}
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatsCard
                    title="Upcoming"
                    value={isLoading ? '-' : String(upcomingCount)}
                    icon={<FileText className="w-5 h-5" />}
                />
                <StatsCard
                    title="Completed"
                    value={isLoading ? '-' : String(closedCount)}
                    icon={<Users className="w-5 h-5" />}
                />
            </div>

            {/* Recent Contests */}
            <div className="card overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-default">
                    <h2 className="font-medium text-primary">Recent Contests</h2>
                    <Link href="/admin/contests" className="text-sm text-muted hover:text-primary">
                        View All →
                    </Link>
                </div>

                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-12 w-full" />
                        ))}
                    </div>
                ) : contests.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-default">
                                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                                    Title
                                </th>
                                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                                    Type
                                </th>
                                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                                    Status
                                </th>
                                <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {contests.slice(0, 5).map((contest) => (
                                <tr key={contest.id} className="border-b border-default hover:bg-surface-alt">
                                    <td className="px-4 py-3 text-sm text-primary">{contest.title}</td>
                                    <td className="px-4 py-3 text-sm text-muted">{contest.type}</td>
                                    <td className="px-4 py-3">
                                        <span className={cn(
                                            'text-xs px-2 py-1 rounded',
                                            contest.status === 'LIVE' && 'bg-green-500/10 text-green-600',
                                            contest.status === 'UPCOMING' && 'bg-amber-500/10 text-amber-600',
                                            contest.status === 'CLOSED' && 'bg-elevated text-muted'
                                        )}>
                                            {contest.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/admin/contests/${contest.id}`} className="text-sm text-muted hover:text-primary">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-sm text-muted">No contests yet</p>
                        <Link href="/admin/contests/new">
                            <Button variant="secondary" size="sm" className="mt-4">
                                Create First Contest
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Link href="/admin/contests/new">
                    <div className="card p-4 hover:border-hover transition-colors">
                        <Plus className="w-5 h-5 text-muted mb-2" />
                        <h3 className="font-medium text-sm text-primary">Create Contest</h3>
                        <p className="text-xs text-muted">Add a new competition</p>
                    </div>
                </Link>
                <Link href="/admin/contests">
                    <div className="card p-4 hover:border-hover transition-colors">
                        <Trophy className="w-5 h-5 text-muted mb-2" />
                        <h3 className="font-medium text-sm text-primary">Manage Contests</h3>
                        <p className="text-xs text-muted">View and edit contests</p>
                    </div>
                </Link>
                <Link href="/admin/questions">
                    <div className="card p-4 hover:border-hover transition-colors">
                        <FileText className="w-5 h-5 text-muted mb-2" />
                        <h3 className="font-medium text-sm text-primary">Questions</h3>
                        <p className="text-xs text-muted">Manage question bank</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
