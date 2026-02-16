'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Contest, ContestStatus } from '@/lib/types';

const statusFilters: { label: string; value: ContestStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Live', value: 'LIVE' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Closed', value: 'CLOSED' },
];

export default function AdminContestsPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<ContestStatus | 'ALL'>('ALL');

    useEffect(() => {
        async function fetchContests() {
            setIsLoading(true);
            const response = await api.getContests(activeFilter === 'ALL' ? undefined : { status: activeFilter });
            if (response.success && response.data) {
                setContests(response.data);
            } else {
                setContests([]);
            }
            setIsLoading(false);
        }
        fetchContests();
    }, [activeFilter]);

    const filteredContests = contests.filter((contest) =>
        contest.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-medium text-primary mb-1">
                        Contests
                    </h1>
                    <p className="text-sm text-muted">
                        Manage all contests
                    </p>
                </div>
                <Link href="/admin/contests/new">
                    <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                        Create
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center gap-1 p-1 bg-surface-alt rounded-lg">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                                activeFilter === filter.value
                                    ? 'bg-card text-primary'
                                    : 'text-muted hover:text-primary'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 max-w-xs">
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {isLoading ? (
                    <div className="p-8">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton h-12 w-full" />
                            ))}
                        </div>
                    </div>
                ) : filteredContests.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-default">
                                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-4">
                                    Title
                                </th>
                                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-4">
                                    Type
                                </th>
                                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-6 py-4">
                                    Status
                                </th>
                                <th className="text-right text-xs font-medium text-muted uppercase tracking-wider px-6 py-4">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContests.map((contest) => (
                                <tr key={contest.id} className="border-b border-default hover:bg-surface-alt transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-primary">{contest.title}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted">{contest.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                'text-xs px-2 py-1 rounded',
                                                contest.status === 'LIVE' && 'bg-green-500/10 text-green-600',
                                                contest.status === 'UPCOMING' && 'bg-amber-500/10 text-amber-600',
                                                contest.status === 'CLOSED' && 'bg-elevated text-muted'
                                            )}>
                                                {contest.status}
                                            </span>
                                            {contest.mode === 'practice' && (
                                                <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">
                                                    Practice
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/contests/${contest.id}`}>
                                                <Button variant="ghost" size="sm" className="p-2">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" className="p-2 text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-muted">No contests found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
