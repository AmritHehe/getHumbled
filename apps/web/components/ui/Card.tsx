import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={cn('card', className)}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return (
        <div className={cn('p-5 border-b border-default', className)}>
            {children}
        </div>
    );
}

export function CardContent({ children, className }: CardProps) {
    return (
        <div className={cn('p-5', className)}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className }: CardProps) {
    return (
        <div className={cn('p-5 border-t border-default', className)}>
            {children}
        </div>
    );
}
