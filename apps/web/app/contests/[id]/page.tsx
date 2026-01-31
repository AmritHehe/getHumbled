'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Brain, Code, Play, Bell, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { Contest, ContestState } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export default function ContestDetailPage() {
    const params = useParams();
    const [contest, setContest] = useState<Contest | null>(null);
    const [contestState, setContestState] = useState<ContestState | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchContest() {
            setIsLoading(true);
            const response = await api.getContest(params.id as string);
            if (response.success && response.data) {
                setContest(response.data);
                // Backend returns 'mode' as the computed contest state
                setContestState((response as any).mode || null);
            }
            setIsLoading(false);
        }
        fetchContest();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="container py-8">
                <div className="skeleton h-6 w-32 mb-8" />
                <div className="skeleton h-10 w-3/4 mb-4" />
                <div className="skeleton h-5 w-1/2 mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="skeleton h-48 w-full rounded-xl" />
                    </div>
                    <div className="skeleton h-48 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="container py-8 text-center">
                <h1 className="text-xl font-medium text-[var(--text-primary)]">Contest not found</h1>
                <Link href="/contests" className="text-[var(--text-muted)] mt-4 inline-block hover:underline">
                    Back to contests
                </Link>
            </div>
        );
    }

    // Determine badge and action based on contest state
    const getStateBadge = () => {
        switch (contestState) {
            case 'LIVE':
                return (
                    <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-600 flex items-center gap-1">
                        <span className="live-dot" /> Live Now
                    </span>
                );
            case 'UPCOMING':
                return (
                    <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-600">
                        Upcoming
                    </span>
                );
            case 'PRACTICE':
                return (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-600 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> Practice Mode
                    </span>
                );
            default:
                return null;
        }
    };

    const getActionButton = () => {
        switch (contestState) {
            case 'LIVE':
                return (
                    <Link href={`/contests/${contest.id}/live`}>
                        <Button variant="primary" className="w-full" leftIcon={<Play className="w-4 h-4" />}>
                            Join Contest
                        </Button>
                    </Link>
                );
            case 'PRACTICE':
                return (
                    <Link href={`/contests/${contest.id}/practice`}>
                        <Button variant="primary" className="w-full" leftIcon={<BookOpen className="w-4 h-4" />}>
                            Start Practice
                        </Button>
                    </Link>
                );
            case 'UPCOMING':
                return (
                    <Button variant="secondary" className="w-full" leftIcon={<Bell className="w-4 h-4" />}>
                        Notify Me
                    </Button>
                );
            default:
                return (
                    <Link href={`/contests/${contest.id}/leaderboard`}>
                        <Button variant="secondary" className="w-full">
                            View Results
                        </Button>
                    </Link>
                );
        }
    };

    return (
        <div className="container py-8">
            {/* Back Link */}
            <Link
                href="/contests"
                className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Contests
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {getStateBadge()}
                    <span className="text-xs px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] flex items-center gap-1">
                        {contest.type === 'DSA' ? <Brain className="w-3 h-3" /> : <Code className="w-3 h-3" />}
                        {contest.type}
                    </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-medium text-[var(--text-primary)] mb-3">
                    {contest.title}
                </h1>
                <p className="text-[var(--text-secondary)] max-w-2xl">
                    {contest.discription}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contest Info */}
                    <div className="card p-6">
                        <h2 className="font-medium text-[var(--text-primary)] mb-4">
                            Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                                <div>
                                    <p className="text-xs text-[var(--text-muted)]">Start Time</p>
                                    <p className="text-sm text-[var(--text-primary)]">
                                        {contest.StartDate ? formatDateTime(contest.StartDate) : 'TBA'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                                <div>
                                    <p className="text-xs text-[var(--text-muted)]">Duration</p>
                                    <p className="text-sm text-[var(--text-primary)]">90 minutes</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="card p-6">
                        <h2 className="font-medium text-[var(--text-primary)] mb-4">
                            Rules
                        </h2>
                        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                            <li>• Points are awarded based on correctness and speed.</li>
                            <li>• You can submit multiple attempts for each question.</li>
                            {contestState === 'LIVE' && <li>• The leaderboard updates in real-time.</li>}
                            {contestState === 'PRACTICE' && <li>• Practice at your own pace with no time pressure.</li>}
                            <li>• Any form of cheating will result in disqualification.</li>
                        </ul>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="card p-6 h-fit">
                    <div className="text-center mb-6">
                        <p className="text-3xl font-medium text-[var(--text-primary)] mb-1">
                            {contest.MCQ?.length || 0}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Questions</p>
                    </div>

                    {getActionButton()}
                </div>
            </div>
        </div>
    );
}

