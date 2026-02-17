'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MCQOption } from '@/lib/types';

interface QuestionCardProps {
    questionNumber: number;
    totalQuestions: number;
    question: string;
    options: { key: MCQOption; text: string }[];
    selectedAnswer?: MCQOption;
    onSelectAnswer: (answer: MCQOption) => void;
    points: number;
    avgTime: number;
    isSubmitted?: boolean;
}

export function QuestionCard({
    questionNumber,
    totalQuestions,
    question,
    options,
    selectedAnswer,
    onSelectAnswer,
    points,
    avgTime,
    isSubmitted = false,
}: QuestionCardProps) {
    return (
        <div className="card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted">
                    Question {questionNumber} of {totalQuestions}
                </span>
                <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary font-medium">
                        {points} pts
                    </span>
                    <span className="text-muted">
                        ~{avgTime} min
                    </span>
                </div>
            </div>

            {/* Question */}
            <h3 className="text-xl font-medium text-primary mb-6 whitespace-pre-wrap">
                {question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
                {options.map((option) => {
                    const isSelected = selectedAnswer === option.key;

                    return (
                        <button
                            key={option.key}
                            onClick={() => !isSubmitted && onSelectAnswer(option.key)}
                            disabled={isSubmitted}
                            className={cn(
                                'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                                isSelected
                                    ? 'border-accent-primary bg-accent-primary/10'
                                    : 'border-default hover:border-hover hover:bg-glass',
                                isSubmitted && 'cursor-not-allowed opacity-70'
                            )}
                        >
                            <div
                                className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm transition-colors',
                                    isSelected
                                        ? 'bg-accent-primary text-white'
                                        : 'bg-elevated text-secondary'
                                )}
                            >
                                {isSelected ? <Check className="w-4 h-4" /> : option.key}
                            </div>
                            <span className={cn(
                                'flex-1',
                                isSelected ? 'text-primary' : 'text-secondary'
                            )}>
                                {option.text}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Progress Bar */}
            {/* <div className="mt-6 pt-6 border-t border-default">
                <div className="flex items-center justify-between text-sm text-muted mb-2">
                    <span>Progress</span>
                    <span>{questionNumber}/{totalQuestions}</span>
                </div>
                <div className="h-2 bg-elevated rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                        style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                    />
                </div>
            </div> */}
        </div>
    );
}
