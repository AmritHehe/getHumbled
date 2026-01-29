'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const response = await api.createContest({
            ...formData,
            StartTime: new Date(),
        });

        if (response.success) {
            toast.success('Contest created successfully!');
            router.push('/admin/contests');
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
