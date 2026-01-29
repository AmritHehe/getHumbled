'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/lib/auth-context';

const navLinks = [
    { href: '/contests', label: 'Contests' },
    { href: '/leaderboard', label: 'Leaderboard' },
];

export function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, isAdmin, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const allLinks = isAdmin
        ? [...navLinks, { href: '/admin', label: 'Admin' }]
        : navLinks;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border)]">
            <div className="container">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="text-base font-medium text-[var(--text-primary)]">
                        SkillUp
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {allLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm transition-colors ${pathname === link.href || pathname.startsWith(link.href + '/')
                                    ? 'text-[var(--text-primary)]'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <div className="hidden md:flex items-center gap-4">
                                <Link
                                    href="/practice/new"
                                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    Practice with AI
                                </Link>
                                <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={signOut}
                                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link href="/auth/signin" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup">
                                    <button className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity">
                                        Sign Up
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-[var(--text-secondary)]"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-[var(--border)] animate-slideDown">
                        <div className="flex flex-col gap-2">
                            {allLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-2 py-2 text-sm ${pathname === link.href
                                        ? 'text-[var(--text-primary)]'
                                        : 'text-[var(--text-muted)]'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isAuthenticated && (
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                                    <Link
                                        href="/practice/new"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-2 py-2 text-sm text-[var(--text-muted)]"
                                    >
                                        Practice with AI
                                    </Link>
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm text-[var(--text-muted)] py-2 px-2">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                        className="text-sm text-[var(--text-muted)] py-2 px-2 text-left"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                            {!isAuthenticated && (
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="text-sm text-[var(--text-muted)] py-2">
                                        Sign In
                                    </Link>
                                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                                        <button className="w-full px-4 py-2 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg">
                                            Sign Up
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
