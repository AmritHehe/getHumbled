'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/QuestionCard';
import { ContestCompletionScreen } from '@/components/ContestCompletionScreen';
import { api } from '@/lib/api';
import { parseQuestion } from '@/lib/parseQuestion';
import type { Contest, MCQOption, WSQuestion } from '@/lib/types';
import toast from 'react-hot-toast';

export default function PracticeContestPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
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

    // Auth guard — redirect unauthenticated users
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please sign in to practice');
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
    const joinPractice = useCallback(async () => {
        const response = await api.joinPracticeContest(contestId);
        if (response.success && response.data?.randomQuestion) {
            setCurrentQuestion(response.data.randomQuestion);
        } else if (response.success && !response.data?.randomQuestion) {
            setIsCompleted(true);
        } else {
            toast.error(response.error || 'Failed to join practice');
        }
    }, [contestId]);

    // Join on mount after contest loaded
    useEffect(() => {
        if (contest && !isLoading) {
            joinPractice();
        }
    }, [contest, isLoading, joinPractice]);

    // Submit answer
    const handleSubmit = async () => {
        if (!currentQuestion || !selectedAnswer) return;

        setIsSubmitting(true);
        const response = await api.submitPracticeAnswer(contestId, currentQuestion.id, selectedAnswer);
        setIsSubmitting(false);

        if (response.success) {
            const isCorrect = response.isCorrect === true;

            if (isCorrect) {
                toast.success('Correct answer! +10 pts');
                setCorrectCount(prev => prev + 1);
            } else {
                const correctAnswer = response.correctAnswer || '?';
                toast.error(`Incorrect, correct answer: ${correctAnswer}`);
            }

            setAnsweredCount(prev => prev + 1);
            setSelectedAnswer(null);

            if (response.data?.randomQuestion) {
                setCurrentQuestion(response.data.randomQuestion);
            } else {
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
            setAnsweredCount(0);
            setCorrectCount(0);
            setIsCompleted(false);
            setShowReAttemptConfirm(false);
            setCurrentQuestion(null);
            setSelectedAnswer(null);
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

    if (isCompleted) {
        return (
            <ContestCompletionScreen
                contestId={contestId}
                mode="practice"
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                correctCount={correctCount}
                onReAttempt={handleReAttempt}
                isReAttempting={isReAttempting}
                showReAttemptConfirm={showReAttemptConfirm}
                onShowReAttemptConfirm={setShowReAttemptConfirm}
            />
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
                                className="min-w-50"
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
