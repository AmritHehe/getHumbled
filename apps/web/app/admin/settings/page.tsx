'use client';

import React from 'react';
import { Settings, Wrench } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-accent-primary/10 blur-2xl rounded-full" />
                <div className="relative w-20 h-20 rounded-2xl bg-surface-alt border border-default flex items-center justify-center">
                    <Settings className="w-10 h-10 text-muted" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
                Settings
            </h1>
            <p className="text-muted text-center max-w-md mb-6">
                Platform settings, notifications, and preferences will be available here soon.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm">
                <Wrench className="w-4 h-4" />
                Coming Soon
            </div>
        </div>
    );
}
