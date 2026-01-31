'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

export default function CreatePracticeQuizPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        discription: '',
    });

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please sign in to create practice quizzes');
            router.push('/auth/signin');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.title.length < 10) {
            toast.error('Title must be at least 10 characters');
            return;
        }

        if (formData.discription.length < 10) {
            toast.error('Description must be at least 10 characters');
            return;
        }

        setIsLoading(true);

        // Step 1: Create the contest
        const response = await api.createContest({
            title: formData.title,
            discription: formData.discription,
            type: 'DEV',
            status: 'LIVE',
            StartTime: new Date(),
            mode: 'practice',
        });

        if (response.success && response.data?.contestId) {
            toast.success('Generating questions with AI...');

            // Step 2: Auto-generate questions using description as prompt
            const aiResponse = await api.createQuestionsWithAI({
                prompt: formData.discription,
                contestId: response.data.contestId,
                mode: 'practice',
            });

            if (aiResponse.success) {
                toast.success('Quiz ready!');
                router.push(`/contests/${response.data.contestId}/practice`);
            } else {
                toast.error('Failed to generate questions. Redirecting to manual generation...');
                router.push(`/practice/${response.data.contestId}/generate`);
            }
        } else {
            toast.error(response.error || 'Failed to create practice quiz');
            setIsLoading(false);
        }
    };

    const isFormValid = formData.title.length >= 10 && formData.discription.length >= 10;

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
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/3 blur-[150px] rounded-full pointer-events-none" />

            {/* Back button - top left */}
            <Link
                href="/contests"
                className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group z-10"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
            </Link>

            {/* Main content - vertically centered */}
            <div className="relative h-full flex items-center justify-center px-8">
                <div className="w-full max-w-xl">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">Create Practice Quiz</h1>
                        <p className="text-lg text-[var(--text-secondary)]">
                            Name your quiz, then AI will generate questions
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Input */}
                        <div>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Quiz name..."
                                className="w-full px-5 py-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all text-lg"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Description textarea with inline button */}
                        <div className="relative">
                            <textarea
                                value={formData.discription}
                                onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
                                placeholder="What will your quiz be about? e.g., JavaScript closures for beginners..."
                                className="w-full h-32 px-5 py-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--accent)] transition-all text-base leading-relaxed"
                                disabled={isLoading}
                            />

                            {/* Inline button - bottom right */}
                            <div className="absolute bottom-4 right-4">
                                <button
                                    type="submit"
                                    disabled={!isFormValid || isLoading}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    className={cn(
                                        "relative overflow-hidden rounded-lg font-medium transition-all",
                                        "bg-[var(--accent)] text-[var(--bg-primary)]",
                                        "disabled:opacity-30 disabled:cursor-not-allowed",
                                        "hover:opacity-90",
                                        "px-5 py-2.5 min-w-[120px]"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-2",
                                            "transition-all duration-200",
                                            isHovered && isFormValid && !isLoading && "opacity-0 -translate-x-2"
                                        )}
                                    >
                                        {isLoading ? 'Creating...' : 'Continue'}
                                    </span>
                                    {!isLoading && (
                                        <ArrowRight
                                            className={cn(
                                                "w-5 h-5 absolute left-1/2 top-1/2 -translate-y-1/2",
                                                "transition-all duration-200",
                                                isHovered && isFormValid ? "opacity-100 -translate-x-1/2" : "opacity-0 translate-x-0"
                                            )}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Examples */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-[var(--text-muted)] mb-4">Quick start</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {[
                                { title: 'JavaScript Basics', desc: 'Fundamentals of JavaScript for beginners' },
                                { title: 'React Hooks', desc: 'Understanding useState, useEffect, and custom hooks' },
                                { title: 'CSS Flexbox', desc: 'Layout techniques with flexbox' },
                            ].map((example) => (
                                <button
                                    key={example.title}
                                    type="button"
                                    onClick={() => setFormData({ title: example.title, discription: example.desc })}
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50"
                                >
                                    {example.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
