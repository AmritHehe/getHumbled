'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Contest, ContestStatus, ContestMode } from '@/lib/types';

type FilterValue = 'ALL' | 'LIVE' | 'UPCOMING' | 'PRACTICE';

const filters: { label: string; value: FilterValue }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Live', value: 'LIVE' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Practice', value: 'PRACTICE' },
];

export default function ContestsPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchContests() {
            setIsLoading(true);

            // Build filters based on selection
            let apiFilters: { status?: ContestStatus; mode?: ContestMode } | undefined;

            if (activeFilter === 'LIVE') {
                apiFilters = { status: 'LIVE' };
            } else if (activeFilter === 'UPCOMING') {
                apiFilters = { status: 'UPCOMING' };
            } else if (activeFilter === 'PRACTICE') {
                apiFilters = { mode: 'practice' };
            }

            const response = await api.getContests(apiFilters);
            if (response.success && response.data) {
                setContests(response.data);
            } else {
                setContests([]);
            }
            setIsLoading(false);
        }
        fetchContests();
    }, [activeFilter]);

    const filteredContests = contests.filter((contest) => {
        return contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contest.discription.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Sort: LIVE first, then UPCOMING, then others
    const sortedContests = [...filteredContests].sort((a, b) => {
        const order: Record<string, number> = { LIVE: 0, UPCOMING: 1, CLOSED: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-2">
                    Contests
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Explore and join coding competitions
                </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
                    {filters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-md transition-all',
                                activeFilter === filter.value
                                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            )}
                        >
                            {filter.label}
                            {filter.value === 'LIVE' && (
                                <span className="ml-2 live-dot inline-block" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex-1 max-w-sm">
                    <Input
                        placeholder="Search contests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                    />
                </div>
            </div>

            {/* Contest Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="card p-5">
                            <div className="skeleton h-5 w-16 mb-3" />
                            <div className="skeleton h-6 w-3/4 mb-2" />
                            <div className="skeleton h-4 w-full mb-2" />
                            <div className="skeleton h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : sortedContests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedContests.map((contest) => (
                        <Link key={contest.id} href={`/contests/${contest.id}`}>
                            <div className="card p-5 hover:border-[var(--border-hover)] transition-colors">
                                <div className="flex items-center gap-2 mb-3">
                                    {contest.status === 'LIVE' && (
                                        <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-600 flex items-center gap-1">
                                            <span className="live-dot" /> Live
                                        </span>
                                    )}
                                    {contest.status === 'UPCOMING' && (
                                        <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-600">
                                            Upcoming
                                        </span>
                                    )}
                                    {(contest as any).mode === 'practice' && (
                                        <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600">
                                            Practice
                                        </span>
                                    )}
                                    <span className="text-xs px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                                        {contest.type}
                                    </span>
                                </div>
                                <h3 className="font-medium mb-2 text-[var(--text-primary)]">{contest.title}</h3>
                                <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                                    {contest.discription}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-[var(--text-muted)]">
                        {searchQuery ? `No contests matching "${searchQuery}"` : 'No contests found'}
                    </p>
                </div>
            )}
        </div>
    );
}
