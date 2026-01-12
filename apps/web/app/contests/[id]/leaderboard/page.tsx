'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LeaderboardTable } from '@/components/LeaderboardTable';

// Mock data
const mockLeaderboard = [
    { rank: 1, userId: '1', userName: 'CodeMaster42', totalPoints: 520, previousRank: 2 },
    { rank: 2, userId: '2', userName: 'DevNinja', totalPoints: 485, previousRank: 1 },
    { rank: 3, userId: '3', userName: 'AlgoKing', totalPoints: 470, previousRank: 3 },
    { rank: 4, userId: '4', userName: 'ByteWizard', totalPoints: 445, previousRank: 6 },
    { rank: 5, userId: 'currentUser', userName: 'You', totalPoints: 420, previousRank: 7, isCurrentUser: true },
    { rank: 6, userId: '6', userName: 'SwiftCoder', totalPoints: 410, previousRank: 4 },
    { rank: 7, userId: '7', userName: 'BinaryBoss', totalPoints: 395, previousRank: 5 },
    { rank: 8, userId: '8', userName: 'CacheQueen', totalPoints: 380, previousRank: 8 },
    { rank: 9, userId: '9', userName: 'LoopLord', totalPoints: 365, previousRank: 10 },
    { rank: 10, userId: '10', userName: 'FuncMaster', totalPoints: 350, previousRank: 9 },
    { rank: 11, userId: '11', userName: 'RecursiveRex', totalPoints: 340 },
    { rank: 12, userId: '12', userName: 'AsyncAce', totalPoints: 325 },
    { rank: 13, userId: '13', userName: 'PointerPro', totalPoints: 310 },
    { rank: 14, userId: '14', userName: 'HeapHelper', totalPoints: 295 },
    { rank: 15, userId: '15', userName: 'TreeTraverser', totalPoints: 280 },
];

export default function LeaderboardPage() {
    const params = useParams();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLeaderboard = mockLeaderboard.filter((entry) =>
        entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container py-8">
            {/* Back Link */}
            <Link
                href={`/contests/${params.id}`}
                className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Contest
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                        Leaderboard
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        DSA Sprint Championship • {mockLeaderboard.length} participants
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-64">
                        <Input
                            placeholder="Search player..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Your Position Highlight */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">
                            #5
                        </div>
                        <div>
                            <p className="font-semibold text-[var(--text-primary)]">Your Position</p>
                            <p className="text-sm text-[var(--text-secondary)]">420 points • Top 3.2%</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">↑ 2</p>
                        <p className="text-sm text-[var(--text-muted)]">positions</p>
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <LeaderboardTable
                entries={filteredLeaderboard}
                currentUserId="currentUser"
                showTrend={true}
            />

            {/* Pagination placeholder */}
            <div className="mt-6 flex items-center justify-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                    Previous
                </Button>
                <span className="text-sm text-[var(--text-muted)]">Page 1 of 1</span>
                <Button variant="ghost" size="sm" disabled>
                    Next
                </Button>
            </div>
        </div>
    );
}
