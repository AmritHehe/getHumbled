'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Play, Pause, Brain, Code, FileQuestion, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import type { Contest } from '@/lib/types';

export default function AdminContestDetailPage() {
    const params = useParams();
    const [contest, setContest] = useState<Contest | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchContest() {
            if (!params.id) return;
            setIsLoading(true);
            const response = await api.getContest(params.id as string);
            console.log('GetContest Response:', response);
            if (response.success && response.data) {
                setContest(response.data);
            }
            setIsLoading(false);
        }
        fetchContest();
    }, [params.id]);

    if (isLoading) {
        return <div className="p-8 text-center">Loading contest details...</div>;
    }

    if (!contest) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Contest not found</p>
                <Link href="/admin/contests">
                    <Button variant="secondary">Back to Contests</Button>
                </Link>
            </div>
        );
    }

    // Combine MCQs and Code questions for display
    const questions = [
        ...(contest.MCQ || []).map(q => ({ ...q, type: 'MCQ' })),
        ...(contest.codeQ || []).map(q => ({ ...q, type: 'CODE' }))
    ].sort((a, b) => a.srNo - b.srNo);

    return (
        <div className="p-8">
            {/* Back Link */}
            <Link
                href="/admin/contests"
                className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Contests
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                            {contest.title}
                        </h1>
                        <Badge variant={contest.status.toLowerCase() as 'live' | 'upcoming' | 'closed'} showDot={contest.status === 'LIVE'}>
                            {contest.status}
                        </Badge>
                    </div>
                    <p className="text-[var(--text-secondary)]">{contest.discription}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/admin/contests/${params.id}/ai`}>
                        <Button variant="secondary" leftIcon={<Sparkles className="w-4 h-4" />}>
                            Create with AI
                        </Button>
                    </Link>
                    <Link href={`/admin/contests/${params.id}/questions/new`}>
                        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                            Add Question
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{questions.length}</p>
                        <p className="text-sm text-[var(--text-muted)]">Total Questions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Badge variant={contest.type.toLowerCase() as 'dsa' | 'dev'} className="text-lg">
                            {contest.type === 'DSA' ? <><Brain className="w-4 h-4" /> DSA</> : <><Code className="w-4 h-4" /> DEV</>}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Questions */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                            Questions
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {questions.map((question: any) => (
                            <div
                                key={question.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                                    <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] font-bold">
                                        {question.srNo || '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-[var(--text-primary)] truncate">{question.question?.split('\n')[0] || 'No question text'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="default" className="text-xs shrink-0">
                                                <FileQuestion className="w-3 h-3 mr-1" />
                                                {question.type}
                                            </Badge>
                                            {question.points && <span className="text-sm text-[var(--text-muted)] shrink-0">{question.points} pts</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {questions.length === 0 && (
                            <div className="py-12 text-center">
                                <FileQuestion className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                                <p className="text-[var(--text-secondary)] mb-4">No questions added yet</p>
                                <Link href={`/admin/contests/${params.id}/questions/new`}>
                                    <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                                        Add First Question
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
