import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'live' | 'upcoming' | 'closed' | 'practice' | 'dsa' | 'dev';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    showDot?: boolean;
    className?: string;
}

export function Badge({ children, variant = 'default', showDot = false, className }: BadgeProps) {
    const variants: Record<BadgeVariant, string> = {
        default: 'bg-elevated text-secondary',
        live: 'badge-live',
        upcoming: 'badge-upcoming',
        closed: 'badge-closed',
        practice: 'bg-blue-500/10 text-blue-500',
        dsa: 'badge-dsa',
        dev: 'badge-dev',
    };

    return (
        <span className={cn('badge', variants[variant], className)}>
            {showDot && <span className="live-dot" />}
            {children}
        </span>
    );
}
