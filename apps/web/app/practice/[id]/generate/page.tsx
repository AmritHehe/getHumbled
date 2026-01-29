'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import type { Contest } from '@/lib/types';

const examples = [
    { topic: 'JavaScript Closures', level: 'Intermediate' },
    { topic: 'React State Management', level: 'Advanced' },
    { topic: 'CSS Grid Layout', level: 'Beginner' },
    { topic: 'TypeScript Generics', level: 'Intermediate' },
];

export default function GeneratePracticeQuizPage() {
    const params = useParams();
    const router = useRouter();
    const contestId = params.id as string;
    const { isAuthenticated } = useAuth();

    const [contest, setContest] = useState<Contest | null>(null);
    const [isLoadingContest, setIsLoadingContest] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const maxLength = 500;
    const loadingMessages = ['Analyzing your topic', 'Generating questions', 'Crafting answer options', 'Finalizing quiz'];

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please sign in to create practice quizzes');
            router.push('/auth/signin');
        }
    }, [isAuthenticated, router]);

    // Fetch contest details
    useEffect(() => {
        async function fetchContest() {
            if (!contestId) return;
            const response = await api.getContest(contestId);
            if (response.success && response.data) {
                setContest(response.data);
            } else {
                toast.error('Failed to load quiz details');
                router.push('/practice/new');
            }
            setIsLoadingContest(false);
        }
        fetchContest();
    }, [contestId, router]);

    // Loading phase animation
    useEffect(() => {
        if (isGenerating && !isSuccess) {
            const interval = setInterval(() => setLoadingPhase(prev => (prev + 1) % loadingMessages.length), 2000);
            return () => clearInterval(interval);
        }
    }, [isGenerating, isSuccess]);

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setLoadingPhase(0);

        const response = await api.createQuestionsWithAI({
            prompt: prompt,
            contestId: contestId,
            mode: 'practice',
        });

        if (response.success) {
            setIsSuccess(true);
            toast.success('Questions generated!');
            setTimeout(() => router.push(`/contests/${contestId}/live`), 1500);
        } else {
            toast.error(response.error || 'Failed to generate questions. Please try again.');
            setIsGenerating(false);
        }
    };

    if (isLoadingContest) {
        return (
            <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
                <div className="flex items-center gap-3 text-[var(--text-muted)]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-3.5rem)] overflow-hidden relative">
            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Back button - top left */}
            <Link
                href="/practice/new"
                className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group z-10"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
            </Link>

            {/* Main content - vertically centered */}
            <div className="relative h-full flex items-center justify-center px-8">
                <div className="w-full max-w-2xl">
                    {isSuccess ? (
                        /* Success State */
                        <div className="flex flex-col items-center animate-fadeIn">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
                                <div className="relative w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Quiz Ready</h1>
                            <p className="text-[var(--text-muted)] mb-6">Questions generated successfully</p>
                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Starting quiz...
                            </div>
                        </div>
                    ) : isGenerating ? (
                        /* Loading State */
                        <div className="flex flex-col items-center animate-fadeIn">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-[var(--accent)]/10 blur-3xl rounded-full" />
                                <div className="relative w-24 h-24 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-[var(--text-muted)] animate-spin" />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{loadingMessages[loadingPhase]}</h1>
                            <div className="flex items-center gap-2 mb-6">
                                {loadingMessages.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all duration-300",
                                            idx === loadingPhase
                                                ? "bg-[var(--accent)] scale-125"
                                                : idx < loadingPhase
                                                    ? "bg-[var(--accent)]/50"
                                                    : "bg-[var(--border)]"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">This usually takes 10-20 seconds</p>
                        </div>
                    ) : (
                        /* Input State */
                        <>
                            {/* Header */}
                            <div className="text-center mb-10">
                                <p className="text-sm text-[var(--text-muted)] mb-2">{contest?.title}</p>
                                <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">What do you want to practice?</h1>
                                <p className="text-lg text-[var(--text-secondary)]">
                                    Describe the topic and AI will generate ~10 questions
                                </p>
                            </div>

                            {/* Input with inline controls */}
                            <div className="relative mb-6">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
                                    placeholder="e.g., JavaScript async/await and Promises for intermediate developers..."
                                    className="w-full h-36 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--accent)] transition-all text-lg leading-relaxed"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.metaKey && prompt.trim()) {
                                            handleGenerate();
                                        }
                                    }}
                                />

                                {/* Inline controls - bottom right */}
                                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                                    <span className="text-xs text-[var(--text-muted)]">{prompt.length}/{maxLength}</span>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!prompt.trim()}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                        className={cn(
                                            "relative overflow-hidden rounded-xl font-medium transition-all",
                                            "bg-[var(--accent)] text-[var(--bg-primary)]",
                                            "disabled:opacity-30 disabled:cursor-not-allowed",
                                            "hover:opacity-90",
                                            "px-5 py-2.5 min-w-[150px]"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-2",
                                                "transition-all duration-200",
                                                isHovered && prompt.trim() && "opacity-0 -translate-x-2"
                                            )}
                                        >
                                            Generate & Start
                                        </span>
                                        <ArrowRight
                                            className={cn(
                                                "w-5 h-5 absolute left-1/2 top-1/2 -translate-y-1/2",
                                                "transition-all duration-200",
                                                isHovered && prompt.trim() ? "opacity-100 -translate-x-1/2" : "opacity-0 translate-x-0"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Examples */}
                            <div className="text-center">
                                <p className="text-sm text-[var(--text-muted)] mb-4">Try an example</p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {examples.map(({ topic, level }) => (
                                        <button
                                            key={topic}
                                            onClick={() => setPrompt(`${topic} concepts for ${level.toLowerCase()} level`)}
                                            className="px-4 py-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] transition-all"
                                        >
                                            {topic} · {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
