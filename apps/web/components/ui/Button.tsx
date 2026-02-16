import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    leftIcon,
    rightIcon,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-accent text-surface hover:opacity-90',
        secondary: 'bg-transparent text-primary border border-default hover:border-hover',
        ghost: 'bg-transparent text-secondary hover:text-primary',
        danger: 'bg-danger text-white hover:opacity-90',
    };

    const sizes = {
        sm: 'text-xs px-3 py-2',
        md: 'text-sm px-4 py-2.5',
        lg: 'text-sm px-6 py-3',
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
}
