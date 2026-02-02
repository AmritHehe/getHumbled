'use client';

import React from 'react';
import { Users, Wrench } from 'lucide-react';

export default function AdminUsersPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-[var(--accent-primary)]/10 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center">
                    <Users className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                User Management
            </h1>
            <p className="text-[var(--text-muted)] text-center max-w-md mb-6">
                Manage users, view profiles, and control permissions. This feature is under development.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm">
                <Wrench className="w-4 h-4" />
                Coming Soon
            </div>
        </div>
    );
}
