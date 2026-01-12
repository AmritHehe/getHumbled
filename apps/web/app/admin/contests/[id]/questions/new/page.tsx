'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { MCQOption } from '@/lib/types';

type QuestionType = 'MCQ' | 'CODE';

export default function AddQuestionPage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [questionType, setQuestionType] = useState<QuestionType>('MCQ');
    const [formData, setFormData] = useState({
        question: '',
        points: '10',
        avgTime: '2',
        solution: 'A' as MCQOption,
        codeSolution: '',
        options: [
            { key: 'A' as MCQOption, text: '' },
            { key: 'B' as MCQOption, text: '' },
            { key: 'C' as MCQOption, text: '' },
            { key: 'D' as MCQOption, text: '' },
        ],
    });

    const handleOptionChange = (key: MCQOption, text: string) => {
        setFormData({
            ...formData,
            options: formData.options.map((opt) =>
                opt.key === key ? { ...opt, text } : opt
            ),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const contestId = params.id as string;

        if (questionType === 'MCQ') {
            // Construct the question string with options appeneded (since backend simple stores string)
            // Or if backend expects just the question text, we send that. 
            // Looking at schema, it just takes "question" string. 
            // Usually we'd store options separately, but for now let's format it nicely.

            const questionText = `${formData.question}\n\nOptions:\nA) ${formData.options[0].text}\nB) ${formData.options[1].text}\nC) ${formData.options[2].text}\nD) ${formData.options[3].text}`;

            const response = await api.createMCQ({
                contestId,
                question: questionText,
                Soltion: formData.solution, // Note: Typo in backend schema "Soltion"
                createdAt: new Date(),
                points: parseInt(formData.points),
                avgTTinMins: parseInt(formData.avgTime),
            });

            if (response.success) {
                toast.success('Question added successfully!');
                router.push(`/admin/contests/${contestId}`);
            } else {
                toast.error(response.error || 'Failed to add question');
            }
        } else {
            // Code question handling (Not yet implemented in API client)
            toast.error('Code questions API not yet implemented');
        }

        setIsLoading(false);
    };

    return (
        <div className="p-8 max-w-3xl">
            {/* Back Link */}
            <Link
                href={`/admin/contests/${params.id}`}
                className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Contest
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                    Add Question
                </h1>
                <p className="text-[var(--text-secondary)]">
                    Create a new question for this contest
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Type */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                            Question Type
                        </h2>
                        <div className="flex gap-3">
                            {(['MCQ', 'CODE'] as QuestionType[]).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setQuestionType(type)}
                                    className={cn(
                                        'flex-1 py-4 px-6 rounded-xl border font-medium transition-all',
                                        questionType === type
                                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                                    )}
                                >
                                    {type === 'MCQ' ? '📝 Multiple Choice' : '💻 Coding'}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Question Content */}
                <Card>
                    <CardContent className="p-6 space-y-5">
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                            Question Content
                        </h2>

                        <div>
                            <label className="label">Question</label>
                            <textarea
                                className="input-field min-h-[100px] resize-y"
                                placeholder="Enter your question here..."
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Points"
                                type="number"
                                value={formData.points}
                                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                required
                            />
                            <Input
                                label="Avg. Time (minutes)"
                                type="number"
                                value={formData.avgTime}
                                onChange={(e) => setFormData({ ...formData, avgTime: e.target.value })}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* MCQ Options or Code Solution */}
                {questionType === 'MCQ' ? (
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                Answer Options
                            </h2>

                            <div className="space-y-3">
                                {formData.options.map((option) => (
                                    <div key={option.key} className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, solution: option.key })}
                                            className={cn(
                                                'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all flex-shrink-0',
                                                formData.solution === option.key
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                                            )}
                                            title={formData.solution === option.key ? 'Correct answer' : 'Mark as correct'}
                                        >
                                            {option.key}
                                        </button>
                                        <Input
                                            placeholder={`Option ${option.key}`}
                                            value={option.text}
                                            onChange={(e) => handleOptionChange(option.key, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            <p className="text-sm text-[var(--text-muted)]">
                                Click on the letter to mark the correct answer. Currently selected: <strong className="text-green-400">{formData.solution}</strong>
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6 space-y-5">
                            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                Solution Code
                            </h2>

                            <div>
                                <label className="label">Expected Solution</label>
                                <textarea
                                    className="input-field min-h-[200px] resize-y font-mono text-sm"
                                    placeholder="// Enter the expected solution code here..."
                                    value={formData.codeSolution}
                                    onChange={(e) => setFormData({ ...formData, codeSolution: e.target.value })}
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/contests/${params.id}`}>
                        <Button variant="ghost" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button variant="primary" type="submit" isLoading={isLoading} leftIcon={<Plus className="w-4 h-4" />}>
                        Add Question
                    </Button>
                </div>
            </form>
        </div>
    );
}
