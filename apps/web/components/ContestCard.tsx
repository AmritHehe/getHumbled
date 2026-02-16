'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Users, ArrowRight, Code, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Contest } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface ContestCardProps {
    contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
    const statusVariant = contest.status.toLowerCase() as 'live' | 'upcoming' | 'closed';
    const typeVariant = contest.type.toLowerCase() as 'dsa' | 'dev';

    return (
        <Card className="group overflow-hidden">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Badge variant={statusVariant} showDot={contest.status === 'LIVE'}>
                            {contest.status}
                        </Badge>
                        <Badge variant={typeVariant}>
                            {contest.type === 'DSA' ? (
                                <><Brain className="w-3 h-3" /> DSA</>
                            ) : (
                                <><Code className="w-3 h-3" /> DEV</>
                            )}
                        </Badge>
                    </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-accent-primary transition-colors">
                    {contest.title}
                </h3>
                <p className="text-sm text-secondary line-clamp-2 mb-4">
                    {contest.discription}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted mb-4">
                    {contest.StartDate && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateTime(contest.StartDate)}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>--</span>
                    </div>
                </div>

                {/* Action Button */}
                <Link href={`/contests/${contest.id}`}>
                    {contest.status === 'LIVE' ? (
                        <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                            Join Now
                        </Button>
                    ) : contest.status === 'UPCOMING' ? (
                        <Button variant="secondary" className="w-full">
                            View Details
                        </Button>
                    ) : (
                        <Button variant="ghost" className="w-full">
                            View Results
                        </Button>
                    )}
                </Link>
            </CardContent>
        </Card>
    );
}
