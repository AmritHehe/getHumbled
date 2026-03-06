'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatTime } from '@/lib/utils';

interface ContestCompletionScreenProps {
    contestId: string;
    mode: 'live' | 'practice';
    // Stats
    timeTaken?: number;
    answeredCount: number;
    totalQuestions: number;
    correctCount?: number;
    userScore?: number;
    userRank?: number | null;
    // Re-attempt (practice only)
    onReAttempt?: () => void;
    isReAttempting?: boolean;
    showReAttemptConfirm?: boolean;
    onShowReAttemptConfirm?: (show: boolean) => void;
}

export function ContestCompletionScreen({
    contestId,
    mode,
    timeTaken,
    answeredCount,
    totalQuestions,
    correctCount,
    userScore,
    userRank,
    onReAttempt,
    isReAttempting,
    showReAttemptConfirm,
    onShowReAttemptConfirm,
}: ContestCompletionScreenProps) {
    const accuracy = mode === 'practice' && answeredCount > 0 && correctCount !== undefined
        ? Math.round((correctCount / answeredCount) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-surface-alt flex flex-col items-center justify-center p-8">
            {/* Re-attempt Confirmation Modal (practice only) */}
            {showReAttemptConfirm && onReAttempt && onShowReAttemptConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl border border-default p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-primary">Re-attempt Contest?</h3>
                        </div>
                        <p className="text-secondary mb-6">
                            This will <span className="text-red-500 font-medium">permanently delete</span> all your previous submission data for this practice contest. You'll start from scratch.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1"
                                onClick={() => onShowReAttemptConfirm(false)}
                                disabled={isReAttempting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-amber-500 hover:bg-amber-600"
                                onClick={onReAttempt}
                                disabled={isReAttempting}
                            >
                                {isReAttempting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Resetting...
                                    </>
                                ) : (
                                    'Yes, Re-attempt'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-md w-full bg-card rounded-2xl border border-default p-8 text-center space-y-6 shadow-xl">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-primary mb-2">
                        {mode === 'live' ? 'Contest Completed!' : 'Practice Complete!'}
                    </h1>
                    <p className="text-secondary">
                        {mode === 'live' ? 'Thanks for giving the test.' : 'Great work on this practice session.'}
                    </p>
                </div>

                {/* Stats */}
                {mode === 'live' ? (
                    <>
                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-default">
                            <div>
                                <p className="text-sm text-muted mb-1">Time Taken</p>
                                <p className="text-xl font-mono font-semibold text-primary">{formatTime(timeTaken || 0)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted mb-1">Questions</p>
                                <p className="text-xl font-mono font-semibold text-primary">{answeredCount} / {totalQuestions}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 py-4 border-b border-default">
                            <div>
                                <p className="text-sm text-muted mb-1">Your Score</p>
                                <p className="text-2xl font-bold text-accent-primary">{userScore || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted mb-1">Your Rank</p>
                                <p className="text-2xl font-bold text-primary">#{userRank || '-'}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-default">
                        <div>
                            <p className="text-sm text-muted mb-1">Answered</p>
                            <p className="text-xl font-mono font-semibold text-primary">{answeredCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-1">Correct</p>
                            <p className="text-xl font-mono font-semibold text-green-500">{correctCount || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-1">Accuracy</p>
                            <p className="text-xl font-mono font-semibold text-accent-primary">{accuracy}%</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {mode === 'live' ? (
                        <>
                            <Link href={`/contests/${contestId}/leaderboard`}>
                                <Button variant="primary" className="w-full">
                                    View Full Leaderboard
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="ghost" className="w-full">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            {onShowReAttemptConfirm && (
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => onShowReAttemptConfirm(true)}
                                    leftIcon={<RefreshCw className="w-4 h-4" />}
                                >
                                    Re-attempt Contest
                                </Button>
                            )}
                            <Link href={`/contests/${contestId}`}>
                                <Button variant="primary" className="w-full">
                                    Back to Contest
                                </Button>
                            </Link>
                            <Link href="/contests">
                                <Button variant="ghost" className="w-full">
                                    Browse Contests
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
