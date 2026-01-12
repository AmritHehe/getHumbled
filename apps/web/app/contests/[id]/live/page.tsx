'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Send, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/QuestionCard';
import { Timer } from '@/components/Timer';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { api } from '@/lib/api';
import type { Contest, MCQ, MCQOption, Score } from '@/lib/types';
import toast from 'react-hot-toast';
import { formatTime } from '@/lib/utils';

function parseQuestion(rawQuestion: string, srNo: number) {
    const parts = rawQuestion.split('\n\nOptions:\n');
    const questionText = parts[0];

    let options = [
        { key: 'A' as MCQOption, text: '' },
        { key: 'B' as MCQOption, text: '' },
        { key: 'C' as MCQOption, text: '' },
        { key: 'D' as MCQOption, text: '' },
    ];

    if (parts.length > 1) {
        const optionsLines = parts[1].split('\n');
        options = options.map(opt => {
            const line = optionsLines.find(l => l.startsWith(opt.key + ')'));
            return {
                ...opt,
                text: line ? line.substring(3).trim() : ''
            };
        });
    }

    return {
        id: `q${srNo}`,
        question: questionText,
        options,
    };
}

export default function LiveContestPage() {
    const params = useParams();
    const router = useRouter();
    const [contest, setContest] = useState<Contest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, MCQOption>>({});
    const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());
    const [isCompleted, setIsCompleted] = useState(false);
    const startTimeRef = useRef<number>(Date.now());
    const [timeTaken, setTimeTaken] = useState(0);

    useEffect(() => {
        async function fetchContest() {
            if (!params.id) return;
            const response = await api.getContest(params.id as string);
            if (response.success && response.data) {
                setContest(response.data);
            } else {
                toast.error('Failed to load contest');
            }
            setIsLoading(false);
            startTimeRef.current = Date.now();
        }
        fetchContest();
    }, [params.id]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading contest...</div>;
    }

    if (!contest) {
        return <div className="min-h-screen flex items-center justify-center">Contest not found</div>;
    }

    const mcqQuestions = (contest.MCQ || []).sort((a, b) => a.srNo - b.srNo);
    const totalQuestions = mcqQuestions.length;
    const currentQuestionData = mcqQuestions[currentQuestionIndex];

    // Calculate total duration based on sum of average times
    const totalDurationSeconds = mcqQuestions.reduce((acc, q) => acc + ((q.avgTTinMins || 2) * 60), 0);

    // Parse current question
    const parsedQuestion = currentQuestionData
        ? parseQuestion(currentQuestionData.question, currentQuestionData.srNo)
        : null;

    const handleSelectAnswer = (answer: MCQOption) => {
        if (!currentQuestionData || submittedQuestions.has(currentQuestionData.id)) return;
        setAnswers({ ...answers, [currentQuestionData.id]: answer });
    };

    const handleFinishContest = () => {
        const endTime = Date.now();
        const taken = Math.floor((endTime - startTimeRef.current) / 1000);
        setTimeTaken(taken);
        setIsCompleted(true);
    };

    const handleSubmitAnswer = () => {
        if (!currentQuestionData || !answers[currentQuestionData.id]) return;

        const newSet = new Set(submittedQuestions);
        newSet.add(currentQuestionData.id);
        setSubmittedQuestions(newSet);

        toast.success("Answer stored. Submitting...");

        // Auto Advance logic
        setTimeout(() => {
            if (currentQuestionIndex < totalQuestions - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                // Last question submitted
                handleFinishContest();
            }
        }, 800);
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const leaderboardEntries = (contest.leaderboard?.score || []).map((s: Score, idx: number) => ({
        rank: parseInt(s.Rank) || idx + 1,
        userId: s.id,
        userName: s.user,
        totalPoints: 0,
        previousRank: parseInt(s.Rank) || idx + 1
    }));

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-8">
                <div className="max-w-md w-full bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-8 text-center space-y-6 shadow-xl">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Contest Completed!</h1>
                        <p className="text-[var(--text-secondary)]">Thanks for giving the test.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-[var(--border)]">
                        <div>
                            <p className="text-sm text-[var(--text-muted)] mb-1">Time Taken</p>
                            <p className="text-xl font-mono font-semibold text-[var(--text-primary)]">{formatTime(timeTaken)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-muted)] mb-1">Total Time</p>
                            <p className="text-xl font-mono font-semibold text-[var(--text-primary)]">{formatTime(totalDurationSeconds)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href={`/contests/${params.id}`}>
                            <Button variant="primary" className="w-full">
                                Back to Contest Home
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="ghost" className="w-full">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col">
            {/* Top Bar - Adjusted Layout/Padding */}
            <header className="bg-[var(--bg-primary)] border-b border-[var(--border)] sticky top-0 z-50 shadow-sm">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/contests/${params.id}`}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 -ml-2 rounded-lg hover:bg-[var(--bg-secondary)]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-semibold text-[var(--text-primary)] leading-tight">{contest.title}</h1>
                            <p className="text-xs text-[var(--text-muted)]">
                                Question {currentQuestionIndex + 1} of {totalQuestions}
                            </p>
                        </div>
                    </div>
                    <Timer initialSeconds={totalDurationSeconds} />
                </div>
            </header>

            {/* Main Content - Adjusted Spacing */}
            <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    {/* Question Section */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {parsedQuestion ? (
                            <>
                                <QuestionCard
                                    questionNumber={currentQuestionIndex + 1}
                                    totalQuestions={totalQuestions}
                                    question={parsedQuestion.question}
                                    options={parsedQuestion.options}
                                    selectedAnswer={answers[currentQuestionData.id]}
                                    onSelectAnswer={handleSelectAnswer}
                                    points={currentQuestionData.points}
                                    avgTime={currentQuestionData.avgTTinMins}
                                    isSubmitted={submittedQuestions.has(currentQuestionData.id)}
                                />

                                {/* Navigation */}
                                <div className="flex items-center justify-between mt-auto">
                                    <Button
                                        variant="secondary"
                                        onClick={handlePrevious}
                                        disabled={currentQuestionIndex === 0}
                                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                                    >
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        {!submittedQuestions.has(currentQuestionData.id) && answers[currentQuestionData.id] && (
                                            <Button
                                                variant="primary"
                                                onClick={handleSubmitAnswer}
                                                leftIcon={<Send className="w-4 h-4" />}
                                            >
                                                {currentQuestionIndex === totalQuestions - 1 ? 'Submit & Finish' : 'Submit Answer'}
                                            </Button>
                                        )}

                                        <Button
                                            variant="secondary"
                                            onClick={handleNext}
                                            disabled={currentQuestionIndex === totalQuestions - 1}
                                            rightIcon={<ChevronRight className="w-4 h-4" />}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>

                                {/* Question Navigator */}
                                <div className="border-t border-[var(--border)] pt-6 mt-2">
                                    <div className="flex flex-wrap gap-2">
                                        {mcqQuestions.map((q, idx) => (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrentQuestionIndex(idx)}
                                                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all shadow-sm ${idx === currentQuestionIndex
                                                    ? 'bg-[var(--accent-primary)] text-white ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-secondary)]'
                                                    : submittedQuestions.has(q.id)
                                                        ? 'bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20'
                                                        : answers[q.id]
                                                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20'
                                                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20 text-[var(--text-muted)] bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
                                No questions available in this contest.
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm h-fit">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Live Leaderboard</h2>
                                <Link
                                    href={`/contests/${params.id}/leaderboard`}
                                    className="text-sm text-[var(--accent-primary)] hover:underline font-medium"
                                >
                                    Full View
                                </Link>
                            </div>

                            {leaderboardEntries.length > 0 ? (
                                <LeaderboardTable
                                    entries={leaderboardEntries}
                                    currentUserId="currentUser"
                                    showTrend={true}
                                />
                            ) : (
                                <div className="py-8 text-center text-[var(--text-muted)] text-sm bg-[var(--bg-elevated)] rounded-xl border border-dashed border-[var(--border)]">
                                    Waiting for participants...
                                </div>
                            )}
                        </div>

                        {/* Your Stats */}
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-4">Your Performance</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                                    <p className="text-2xl font-bold text-[var(--text-primary)]">{Object.keys(answers).length * 10}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Score</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--bg-elevated)]">
                                    <p className="text-2xl font-bold text-[var(--accent-primary)]">-</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">Rank</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
