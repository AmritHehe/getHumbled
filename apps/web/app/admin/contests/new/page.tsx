'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import type { ContestType, ContestStatus } from '@/lib/types';

export default function CreateContestPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        discription: '',
        type: 'DSA' as ContestType,
        status: 'UPCOMING' as ContestStatus,
        startDate: '',
        startTime: '',
        duration: 60, // minutes
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Build StartTime from date and time
        let startDateTime: Date;
        if (formData.status === 'UPCOMING' && formData.startDate && formData.startTime) {
            startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
        } else {
            startDateTime = new Date();
        }

        const response = await api.createContest({
            title: formData.title,
            discription: formData.discription,
            type: formData.type,
            status: formData.status,
            StartTime: startDateTime,
            ContestTotalTime: formData.duration,
        });

        if (response.success && response.data) {
            toast.success('Contest created! Now add questions.');
            router.push(`/admin/contests/${response.data.contestId}`);
        } else {
            toast.error(response.error || 'Failed to create contest');
        }

        setIsLoading(false);
    };

    return (
        <div className="p-8 max-w-2xl">
            {/* Back Link */}
            <Link
                href="/admin/contests"
                className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </Link>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-medium text-[var(--text-primary)] mb-1">
                    New Contest
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                    Create a new coding competition
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="card p-6 space-y-4">
                    <Input
                        label="Title"
                        placeholder="e.g., DSA Sprint Championship"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <div>
                        <label className="label">Description</label>
                        <textarea
                            className="input-field min-h-[100px] resize-y"
                            placeholder="Describe the contest..."
                            value={formData.discription}
                            onChange={(e) => setFormData({ ...formData, discription: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Type</label>
                        <div className="flex gap-3">
                            {(['DSA', 'DEV'] as ContestType[]).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={cn(
                                        'flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all',
                                        formData.type === type
                                            ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                            : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="label">Status</label>
                        <div className="flex gap-3">
                            {(['UPCOMING', 'LIVE'] as ContestStatus[]).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status })}
                                    className={cn(
                                        'flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all',
                                        formData.status === status
                                            ? status === 'LIVE'
                                                ? 'border-green-500 bg-green-500/10 text-green-600'
                                                : 'border-amber-500 bg-amber-500/10 text-amber-600'
                                            : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scheduling Section */}
                <div className="card p-6 space-y-4">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                        {formData.status === 'UPCOMING' ? (
                            <>
                                <Calendar className="w-4 h-4" />
                                Schedule
                            </>
                        ) : (
                            <>
                                <Clock className="w-4 h-4" />
                                Duration
                            </>
                        )}
                    </h3>

                    {formData.status === 'UPCOMING' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Start Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Start Time</label>
                                <input
                                    type="time"
                                    className="input-field"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="label">Quiz Duration (minutes)</label>
                            <p className="text-xs text-[var(--text-muted)] mb-2">
                                How long participants have to complete the contest
                            </p>
                            <div className="flex gap-3">
                                {[15, 30, 45, 60, 90, 120].map((mins) => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, duration: mins })}
                                        className={cn(
                                            'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                                            formData.duration === mins
                                                ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                                                : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                                        )}
                                    >
                                        {mins}m
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3">
                                <Input
                                    type="number"
                                    placeholder="Or enter custom duration"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                                    min={5}
                                    max={300}
                                />
                            </div>
                        </div>
                    )}

                    {/* Always show duration for UPCOMING too */}
                    {formData.status === 'UPCOMING' && (
                        <div>
                            <label className="label">Quiz Duration (minutes)</label>
                            <p className="text-xs text-[var(--text-muted)] mb-2">
                                How long participants have to complete the contest once it goes live
                            </p>
                            <div className="flex gap-3 flex-wrap">
                                {[15, 30, 45, 60, 90, 120].map((mins) => (
                                    <button
                                        key={mins}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, duration: mins })}
                                        className={cn(
                                            'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                                            formData.duration === mins
                                                ? 'border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]'
                                                : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                                        )}
                                    >
                                        {mins}m
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link href="/admin/contests">
                        <Button variant="ghost" type="button">
                            Cancel
                        </Button>
                    </Link>
                    <Button variant="primary" type="submit" isLoading={isLoading}>
                        Create Contest
                    </Button>
                </div>
            </form>
        </div>
    );
}
