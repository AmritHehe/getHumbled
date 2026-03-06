'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Send, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/QuestionCard';
import { Timer } from '@/components/Timer';
import { LiveLeaderboardSidebar } from '@/components/LiveLeaderboardSidebar';
import { ContestCompletionScreen } from '@/components/ContestCompletionScreen';
import { api } from '@/lib/api';
import { useContestWebSocket } from '@/hooks/useContestWebSocket';
import { parseQuestion } from '@/lib/parseQuestion';
import type { Contest, MCQOption } from '@/lib/types';
import toast from 'react-hot-toast';

export default function LiveContestPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const contestId = params.id as string;

    const [contest, setContest] = useState<Contest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<MCQOption | null>(null);

    // All WS state managed by the custom hook
    const {
        wsConnected,
        currentQuestion,
        leaderboard,
        userScore,
        userRank,
        answeredCount,
        isCompleted,
        isSubmitting,
        timeTaken,
        submitAnswer,
    } = useContestWebSocket(contestId, totalQuestions);

    // Auth guard — redirect unauthenticated users
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please sign in to join a live contest');
            router.push(`/auth/signin?redirect=/contests/${contestId}`);
        }
    }, [authLoading, isAuthenticated, router, contestId]);

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking authentication...
                </div>
            </div>
        );
    }

    // Fetch contest metadata (questions come via WS)
    useEffect(() => {
        async function fetchContest() {
            if (!contestId) return;
            const response = await api.getContest(contestId);
            if (response.success && response.data) {
                setContest(response.data);
                setTotalQuestions(response.data.MCQ?.length || 0);
            } else {
                toast.error('Failed to load contest');
            }
            setIsLoading(false);
        }
        fetchContest();
    }, [contestId]);

    const handleSubmitAnswer = () => {
        if (!selectedAnswer) return;
        submitAnswer(selectedAnswer);
        setSelectedAnswer(null);
    };

    // Parse current question for display
    const parsedQuestion = currentQuestion
        ? parseQuestion(currentQuestion.question, currentQuestion.srNo)
        : null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading contest...
                </div>
            </div>
        );
    }

    if (!contest) {
        return <div className="min-h-screen flex items-center justify-center">Contest not found</div>;
    }

    if (isCompleted) {
        return (
            <ContestCompletionScreen
                contestId={contestId}
                mode="live"
                timeTaken={timeTaken}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                userScore={userScore}
                userRank={userRank}
            />
        );
    }

    return (
        <div className="min-h-screen bg-surface-alt flex flex-col">
            {/* Top Bar */}
            <header className="bg-surface border-b border-default sticky top-0 z-50">
                <div className="container max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Back + Title */}
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/contests/${contestId}`}
                                className="text-muted hover:text-primary transition-colors p-2 -ml-2 rounded-lg hover:bg-surface-alt"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-lg font-semibold text-primary">{contest.title}</h1>
                                    <span className="text-xs bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                                        <span className="live-dot" /> Live
                                    </span>
                                    {wsConnected ? (
                                        <Wifi className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <WifiOff className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                                <p className="text-sm text-muted">
                                    {answeredCount} of {totalQuestions} answered
                                </p>
                            </div>
                        </div>

                        {/* Right: Timer */}
                        <Timer
                            startTime={contest.StartDate}
                            totalMinutes={contest.ContestTotalTime || 60}
                        />
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1 bg-elevated">
                <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 container max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* Question Section */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {currentQuestion && parsedQuestion ? (
                            <>
                                <QuestionCard
                                    questionNumber={answeredCount + 1}
                                    totalQuestions={totalQuestions}
                                    question={parsedQuestion.question}
                                    options={parsedQuestion.options}
                                    selectedAnswer={selectedAnswer || undefined}
                                    onSelectAnswer={(answer) => setSelectedAnswer(answer)}
                                    points={currentQuestion.points}
                                    avgTime={currentQuestion.avgTTinMins}
                                    isSubmitted={false}
                                />

                                <div className="flex items-center justify-end">
                                    <Button
                                        variant="primary"
                                        onClick={handleSubmitAnswer}
                                        disabled={!selectedAnswer || isSubmitting}
                                        leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                                    </Button>
                                </div>

                                <div className="text-center text-sm text-muted py-4 border-t border-default">
                                    Questions are delivered randomly. You cannot go back after submitting.
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-muted bg-card rounded-2xl border border-default">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                <p>Waiting for question...</p>
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Sidebar */}
                    <div className="lg:col-span-4">
                        <LiveLeaderboardSidebar
                            contestId={contestId}
                            leaderboard={leaderboard}
                            userScore={userScore}
                            userRank={userRank}
                            wsConnected={wsConnected}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
