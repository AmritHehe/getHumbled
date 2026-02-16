'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Github, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/lib/auth-context';

const userNavLinks = [
    { href: '/contests', label: 'Contests' },
    { href: '/leaderboard', label: 'Leaderboard' },
];

export function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, isAdmin, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Check if we're on an admin route
    const isAdminRoute = pathname.startsWith('/admin');

    // Add admin link to user nav if they're an admin but not on admin pages
    const allLinks = isAdmin && !isAdminRoute
        ? [...userNavLinks, { href: '/admin', label: 'Admin' }]
        : userNavLinks;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-default">
            <div className="container">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href={isAdminRoute ? '/admin' : '/'} className="text-base font-medium text-primary">
                        SkillUp {isAdminRoute && <span className="text-xs text-muted ml-1">Admin</span>}
                    </Link>

                    {/* Desktop Navigation - Only show for non-admin routes */}
                    {!isAdminRoute && (
                        <div className="hidden md:flex items-center gap-8">
                            {allLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm transition-colors ${pathname === link.href || pathname.startsWith(link.href + '/')
                                        ? 'text-primary'
                                        : 'text-muted hover:text-primary'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/AmritHehe/getHumbled"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-2 p-2 text-muted hover:text-primary transition-colors"
                            title="Star on GitHub"
                        >
                            <span className="text-xs font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 whitespace-nowrap">
                                Give a star
                            </span>
                            <div className="relative w-5 h-5">
                                <Github className="w-5 h-5 absolute inset-0 group-hover:scale-0 transition-transform duration-200" />
                                <Star className="w-5 h-5 absolute inset-0 scale-0 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 ease-out fill-yellow-400 text-yellow-400" />
                            </div>
                        </a>
                        <ThemeToggle />

                        {isAuthenticated ? (
                            <div className="hidden md:flex items-center gap-4">
                                {isAdminRoute ? (
                                    // Admin route: just sign out
                                    <button
                                        onClick={signOut}
                                        className="text-sm text-muted hover:text-primary transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                ) : (
                                    // User route: show practice, dashboard, sign out
                                    <>
                                        <Link
                                            href="/practice/new"
                                            className="text-sm text-muted hover:text-primary transition-colors"
                                        >
                                            Practice with AI
                                        </Link>
                                        <Link href="/dashboard" className="text-sm text-muted hover:text-primary transition-colors">
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={signOut}
                                            className="text-sm text-muted hover:text-primary transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-4">
                                <Link href="/auth/signin" className="text-sm text-muted hover:text-primary transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/auth/signup">
                                    <button className="px-4 py-2 text-sm font-medium bg-accent text-surface rounded-lg hover:opacity-90 transition-opacity">
                                        Sign Up
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-secondary"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-default animate-slideDown">
                        <div className="flex flex-col gap-2">
                            {/* Only show nav links on non-admin routes */}
                            {!isAdminRoute && allLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-2 py-2 text-sm ${pathname === link.href
                                        ? 'text-primary'
                                        : 'text-muted'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isAuthenticated && (
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-default">
                                    {!isAdminRoute && (
                                        <>
                                            <Link
                                                href="/practice/new"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="px-2 py-2 text-sm text-muted"
                                            >
                                                Practice with AI
                                            </Link>
                                            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted py-2 px-2">
                                                Dashboard
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={() => { signOut(); setMobileMenuOpen(false); }}
                                        className="text-sm text-muted py-2 px-2 text-left"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                            {!isAuthenticated && (
                                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-default">
                                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted py-2">
                                        Sign In
                                    </Link>
                                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                                        <button className="w-full px-4 py-2 text-sm font-medium bg-accent text-surface rounded-lg">
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
