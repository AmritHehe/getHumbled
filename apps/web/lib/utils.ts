import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(date));
}

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getContestStatusColor(status: 'UPCOMING' | 'LIVE' | 'CLOSED'): string {
    switch (status) {
        case 'LIVE':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'UPCOMING':
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'CLOSED':
            return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
}

export function getContestTypeIcon(type: 'DSA' | 'DEV'): string {
    return type === 'DSA' ? '🧮' : '💻';
}
