'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const examples = [
    { topic: 'JavaScript Closures', level: 'Intermediate' },
    { topic: 'Data Structures', level: 'Advanced' },
    { topic: 'React Hooks', level: 'Beginner' },
    { topic: 'System Design', level: 'Expert' },
];

export default function AIQuizGeneratorPage() {
    const params = useParams();
    const router = useRouter();
    const contestId = params.id as string;

    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loadingPhase, setLoadingPhase] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const maxLength = 500;

    const loadingMessages = ['Analyzing your prompt', 'Generating questions', 'Crafting answer options', 'Finalizing quiz'];

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => setLoadingPhase(prev => (prev + 1) % loadingMessages.length), 2000);
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setLoadingPhase(0);
        try {
            const response = await api.createQuestionsWithAI({ prompt, contestId });
            if (response.success) {
                setIsSuccess(true);
                toast.success('Questions generated successfully!');
                setTimeout(() => router.push(`/admin/contests/${contestId}`), 2000);
                // Don't set isLoading to false here - we're showing success state
            } else {
                toast.error(response.error || (response as { message?: string }).message || 'Failed to generate questions');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('AI generation error:', err);
            toast.error('Something went wrong');
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-3.5rem)] overflow-hidden relative">
            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-primary)]/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Back button - top left */}
            <Link
                href={`/admin/contests/${contestId}`}
                className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group z-10"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Contest
            </Link>

            {/* Main content - vertically centered */}
            <div className="relative h-full flex items-center justify-center px-8">
                <div className="w-full max-w-2xl">
                    {isSuccess ? (
                        <div className="flex flex-col items-center">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
                                <div className="relative w-28 h-28 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-14 h-14 text-green-400" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Questions Generated</h1>
                            <p className="text-[var(--text-muted)] mb-8">Your quiz is ready</p>
                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Redirecting to contest
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center">
                            {/* Simple pulsing dots loader */}
                            <div className="flex items-center gap-3 mb-8">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-4 h-4 rounded-full bg-[var(--accent-primary)] animate-pulse"
                                        style={{ animationDelay: `${i * 200}ms` }}
                                    />
                                ))}
                            </div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{loadingMessages[loadingPhase]}</h1>
                            <div className="flex items-center gap-2">
                                {loadingMessages.map((_, idx) => (
                                    <div key={idx} className={cn("w-2 h-2 rounded-full transition-all duration-300", idx === loadingPhase ? "bg-[var(--accent-primary)] scale-125" : idx < loadingPhase ? "bg-[var(--accent-primary)]/50" : "bg-[var(--border)]")} />
                                ))}
                            </div>
                            <p className="text-sm text-[var(--text-muted)] mt-8">This usually takes 10-20 seconds</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="text-center mb-10">
                                <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4">Create with AI</h1>
                                <p className="text-xl text-[var(--text-secondary)]">
                                    Describe your topic and AI will generate ~10 high-quality questions
                                </p>
                            </div>

                            {/* Input with inline controls */}
                            <div className="relative mb-6">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value.slice(0, maxLength))}
                                    placeholder="e.g., JavaScript async/await and Promises for intermediate developers..."
                                    className="w-full h-40 p-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] transition-all text-lg leading-relaxed"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.metaKey && prompt.trim()) {
                                            handleGenerate();
                                        }
                                    }}
                                />
                                {/* Inline controls - bottom right */}
                                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                                    <span className={cn(
                                        "text-xs text-[var(--text-muted)] transition-opacity duration-300",
                                        isLoading && "opacity-0"
                                    )}>{prompt.length}/{maxLength}</span>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={!prompt.trim() || isLoading}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                        className={cn(
                                            "relative overflow-hidden rounded-xl font-medium transition-all",
                                            "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary,var(--accent-primary))]",
                                            "text-white shadow-lg shadow-[var(--accent-primary)]/25",
                                            "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
                                            "hover:shadow-xl hover:shadow-[var(--accent-primary)]/30 hover:scale-[1.02]",
                                            "active:scale-[0.98]",
                                            // Morphing size
                                            isLoading
                                                ? "w-10 h-10 p-0"
                                                : "px-5 py-2.5 min-w-[140px]",
                                            // Smooth transition
                                            "[transition:all_400ms_cubic-bezier(0.4,0,0.2,1)]"
                                        )}
                                    >
                                        {/* Text content - slides out */}
                                        <span
                                            className={cn(
                                                "inline-flex items-center justify-center gap-2 whitespace-nowrap",
                                                "[transition:all_300ms_cubic-bezier(0.4,0,0.2,1)]",
                                                isLoading && "opacity-0 scale-75"
                                            )}
                                        >
                                            <span className={cn(
                                                "[transition:all_300ms_cubic-bezier(0.4,0,0.2,1)]",
                                                isHovered && prompt.trim() && !isLoading && "opacity-0 -translate-x-4"
                                            )}>
                                                Generate Quiz
                                            </span>
                                            <ArrowRight className={cn(
                                                "w-5 h-5 absolute left-1/2 -translate-x-1/2",
                                                "[transition:all_300ms_cubic-bezier(0.4,0,0.2,1)]",
                                                isHovered && prompt.trim() && !isLoading
                                                    ? "opacity-100 scale-100"
                                                    : "opacity-0 scale-50"
                                            )} />
                                        </span>

                                        {/* Loading spinner - fades in */}
                                        <span className={cn(
                                            "absolute inset-0 flex items-center justify-center",
                                            "[transition:all_300ms_cubic-bezier(0.4,0,0.2,1)]",
                                            isLoading ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                        )}>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </span>

                                        {/* Shine effect */}
                                        <span className={cn(
                                            "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
                                            "-translate-x-full",
                                            "[transition:transform_600ms_ease-out]",
                                            isHovered && prompt.trim() && !isLoading && "translate-x-full"
                                        )} />
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
                                            onClick={() => setPrompt(`${topic} concepts for ${level.toLowerCase()} level students`)}
                                            className="px-5 py-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/50 hover:text-[var(--text-primary)] transition-all"
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
