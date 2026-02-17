'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/QuestionCard';
import { api } from '@/lib/api';
import type { Contest, MCQOption, WSQuestion } from '@/lib/types';
import toast from 'react-hot-toast';

// Parse raw question string from backend
function parseQuestion(rawQuestion: string, srNo: number) {
    const parts = rawQuestion.split('\n\nOptions:\n');
    const questionText = parts[0];

    let options: { key: MCQOption; text: string }[] = [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
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

export default function PracticeContestPage() {
    const params = useParams();
    const router = useRouter();
    const contestId = params.id as string;

    // Contest data
    const [contest, setContest] = useState<Contest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState(0);

    // Question state
    const [currentQuestion, setCurrentQuestion] = useState<WSQuestion | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<MCQOption | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Progress tracking
    const [answeredCount, setAnsweredCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Re-attempt state
    const [showReAttemptConfirm, setShowReAttemptConfirm] = useState(false);
    const [isReAttempting, setIsReAttempting] = useState(false);

    // Fetch contest data
    useEffect(() => {
        async function fetchContest() {
            const response = await api.getContest(contestId);
            if (response.success && response.data) {
                setContest(response.data);
                setTotalQuestions(response.data.MCQ?.length || 0);
            } else {
                toast.error('Failed to load contest');
                router.push('/contests');
            }
            setIsLoading(false);
        }
        fetchContest();
    }, [contestId, router]);

    // Join practice contest
    async function joinPractice() {
        const response = await api.joinPracticeContest(contestId);
        if (response.success && response.data?.randomQuestion) {
            setCurrentQuestion(response.data.randomQuestion);
        } else if (response.success && !response.data?.randomQuestion) {
            setIsCompleted(true);
        } else {
            toast.error(response.error || 'Failed to join practice');
        }
    }

    // Join on mount after contest loaded
    useEffect(() => {
        if (contest && !isLoading) {
            joinPractice();
        }
    }, [contest, isLoading]);

    // Submit answer
    const handleSubmit = async () => {
        if (!currentQuestion || !selectedAnswer) return;

        setIsSubmitting(true);
        const response = await api.submitPracticeAnswer(contestId, currentQuestion.id, selectedAnswer);
        setIsSubmitting(false);

        if (response.success) {
            const isCorrect = (response as any).error === 'correct';

            if (isCorrect) {
                toast.success('Correct answer! +10 pts');
                setCorrectCount(prev => prev + 1);
            } else {
                // Backend sends correct answer in message field: "correct answer" + answer
                const correctAnswer = (response as any).message?.replace('correct answer', '').trim() || '?';
                toast.error(`Incorrect, correct answer: ${correctAnswer}`);
            }

            setAnsweredCount(prev => prev + 1);
            setSelectedAnswer(null);

            // Check for next question
            if (response.data?.randomQuestion) {
                setCurrentQuestion(response.data.randomQuestion);
            } else {
                // No more questions
                setIsCompleted(true);
            }
        } else {
            toast.error(response.error || 'Failed to submit');
        }
    };

    // Re-attempt contest
    const handleReAttempt = async () => {
        setIsReAttempting(true);
        const response = await api.reAttemptPracticeContest(contestId);

        if (response.success) {
            toast.success('Progress reset! Starting fresh...');
            // Reset all state
            setAnsweredCount(0);
            setCorrectCount(0);
            setIsCompleted(false);
            setShowReAttemptConfirm(false);
            setCurrentQuestion(null);
            setSelectedAnswer(null);
            // Re-join to get first question
            await joinPractice();
        } else {
            toast.error(response.error || 'Failed to reset progress');
        }
        setIsReAttempting(false);
    };

    // Parse question for display
    const parsedQuestion = currentQuestion
        ? parseQuestion(currentQuestion.question, currentQuestion.srNo)
        : null;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading practice...
                </div>
            </div>
        );
    }

    // Completion state
    if (isCompleted) {
        const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

        return (
            <div className="min-h-screen bg-surface-alt flex flex-col items-center justify-center p-8">
                {/* Re-attempt Confirmation Modal */}
                {showReAttemptConfirm && (
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
                                    onClick={() => setShowReAttemptConfirm(false)}
                                    disabled={isReAttempting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 bg-amber-500 hover:bg-amber-600"
                                    onClick={handleReAttempt}
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
                        <h1 className="text-2xl font-bold text-primary mb-2">Practice Complete!</h1>
                        <p className="text-secondary">Great work on this practice session.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-default">
                        <div>
                            <p className="text-sm text-muted mb-1">Answered</p>
                            <p className="text-xl font-mono font-semibold text-primary">{answeredCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-1">Correct</p>
                            <p className="text-xl font-mono font-semibold text-green-500">{correctCount}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted mb-1">Accuracy</p>
                            <p className="text-xl font-mono font-semibold text-accent-primary">{accuracy}%</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => setShowReAttemptConfirm(true)}
                            leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                            Re-attempt Contest
                        </Button>
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
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-alt flex flex-col">
            {/* Top Bar */}
            <header className="bg-surface border-b border-default sticky top-0 z-50">
                <div className="container max-w-5xl mx-auto px-6 py-4">
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
                                    <h1 className="text-lg font-semibold text-primary">{contest?.title}</h1>
                                    <span className="text-xs bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full font-medium">
                                        Practice
                                    </span>
                                </div>
                                <p className="text-sm text-muted">
                                    {answeredCount} of {totalQuestions} answered
                                </p>
                            </div>
                        </div>

                        {/* Right: Points */}
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-500 tabular-nums">{correctCount * 10}</p>
                            <p className="text-xs text-muted">Points</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-elevated">
                    <div
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container max-w-4xl mx-auto px-6 py-8">
                {parsedQuestion ? (
                    <div className="space-y-8 mt-4">
                        <QuestionCard
                            questionNumber={answeredCount + 1}
                            totalQuestions={totalQuestions}
                            question={parsedQuestion.question}
                            options={parsedQuestion.options}
                            selectedAnswer={selectedAnswer || undefined}
                            onSelectAnswer={(answer) => setSelectedAnswer(answer)}
                            points={currentQuestion?.points || 10}
                            avgTime={currentQuestion?.avgTTinMins || 0}
                            isSubmitted={false}
                        />

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!selectedAnswer || isSubmitting}
                                className="min-w-[200px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Answer'
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted bg-card rounded-2xl border border-default">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading question...</p>
                    </div>
                )}
            </main>
        </div>
    );
}
