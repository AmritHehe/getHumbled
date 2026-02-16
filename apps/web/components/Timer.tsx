'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

interface TimerProps {
    /** ISO date string of when the contest started */
    startTime?: string;
    /** Total contest duration in minutes */
    totalMinutes?: number;
    /** Fallback: initial seconds if startTime not provided */
    initialSeconds?: number;
    onTimeUp?: () => void;
    className?: string;
}

export function Timer({ startTime, totalMinutes, initialSeconds, onTimeUp, className }: TimerProps) {
    const [seconds, setSeconds] = useState(() => {
        // If we have startTime and totalMinutes, calculate remaining time
        if (startTime && totalMinutes) {
            const start = new Date(startTime).getTime();
            const end = start + totalMinutes * 60 * 1000;
            const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
            return remaining;
        }
        // Otherwise use initialSeconds
        return initialSeconds || 0;
    });

    useEffect(() => {
        if (seconds <= 0) {
            onTimeUp?.();
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    onTimeUp?.();
                }
                return next;
            });
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
                        : 'bg-elevated text-primary',
                className
            )}
        >
            <Clock className="w-4 h-4" />
            <span className="text-lg">{formatTime(seconds)}</span>
        </div>
    );
}
