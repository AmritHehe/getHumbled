import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
    return (
        <div className={cn('card p-6', className)}>
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                    {icon}
                </div>
                {trend && (
                    <div
                        className={cn(
                            'flex items-center gap-1 text-sm font-medium',
                            trend.isPositive ? 'text-green-400' : 'text-red-400'
                        )}
                    >
                        {trend.isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-3xl font-bold text-primary mb-1">
                {value}
            </h3>
            <p className="text-sm text-muted">{title}</p>
        </div>
    );
}
