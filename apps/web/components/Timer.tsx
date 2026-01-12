'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

interface TimerProps {
    initialSeconds: number;
    onTimeUp?: () => void;
    className?: string;
}

export function Timer({ initialSeconds, onTimeUp, className }: TimerProps) {
    const [seconds, setSeconds] = useState(initialSeconds);

    useEffect(() => {
        if (seconds <= 0) {
            onTimeUp?.();
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds, onTimeUp]);

    const isLow = seconds <= 60;
    const isCritical = seconds <= 30;

    return (
        <div
            className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-semibold transition-colors',
                isCritical
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : isLow
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-primary)]',
                className
            )}
        >
            <Clock className="w-4 h-4" />
            <span className="text-lg">{formatTime(seconds)}</span>
        </div>
    );
}
