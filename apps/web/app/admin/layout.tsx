'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Trophy, HelpCircle, Users, Settings, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/contests', label: 'Contests', icon: Trophy },
    { href: '/admin/questions', label: 'Questions', icon: HelpCircle },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/guide', label: 'Guide', icon: BookOpen },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = React.useState(false);

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside
                className={cn(
                    'sticky top-16 h-[calc(100vh-4rem)] bg-surface-alt border-r border-default transition-all duration-300 flex flex-col',
                    collapsed ? 'w-16' : 'w-64'
                )}
            >
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href ||
                            (link.href !== '/admin' && pathname.startsWith(link.href));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-accent-primary/10 text-accent-primary'
                                        : 'text-secondary hover:text-primary hover:bg-glass'
                                )}
                                title={collapsed ? link.label : undefined}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {!collapsed && <span className="font-medium">{link.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Button */}
                <div className="p-4 border-t border-default">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-secondary hover:text-primary hover:bg-glass transition-colors"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-surface">
                {children}
            </main>
        </div>
    );
}
