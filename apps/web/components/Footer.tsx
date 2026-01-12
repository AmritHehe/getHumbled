import React from 'react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-[var(--border)] py-12">
            <div className="container">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[var(--text-muted)]">
                        © {new Date().getFullYear()} SkillUp
                    </p>
                    <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                        <Link href="/contests" className="hover:text-[var(--text-primary)] transition-colors">
                            Contests
                        </Link>
                        <Link href="/leaderboard" className="hover:text-[var(--text-primary)] transition-colors">
                            Leaderboard
                        </Link>
                        <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
                            About
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
