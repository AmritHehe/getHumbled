'use client';

import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';

export default function GlobalLeaderboardPage() {
    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl mt-5 md:text-3xl font-medium text-primary mb-3">
                    Leaderboard
                </h1>
                <p className="text-secondary max-w-2xl">
                    Global rankings across all SkillUp competitions.
                </p>
            </div>

            {/* Coming Soon Card */}
            <div className="card p-12 text-center max-w-2xl mx-auto">
                
                <h2 className="text-xl font-semibold text-primary mb-3">
                    Coming Soon
                </h2>
                <p className="text-secondary mb-6 max-w-md mx-auto">
                    We're building a global leaderboard that tracks your performance across all contests. 
                    Compete, climb the ranks, and earn your spot at the top.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-accent-primary">
 
                    <span>In the meantime, check out contest-specific leaderboards!</span>
                </div>
            </div>
        </div>
    );
}
