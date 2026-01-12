import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'live' | 'upcoming' | 'closed' | 'dsa' | 'dev';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    showDot?: boolean;
    className?: string;
}

export function Badge({ children, variant = 'default', showDot = false, className }: BadgeProps) {
    const variants: Record<BadgeVariant, string> = {
        default: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]',
        live: 'badge-live',
        upcoming: 'badge-upcoming',
        closed: 'badge-closed',
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
