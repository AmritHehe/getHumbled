import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leaderboard',
    description: 'See the global SkillUp leaderboard — find out who tops the coding competitions.',
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
