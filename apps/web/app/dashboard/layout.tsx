import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'View your SkillUp dashboard — track contest participation, scores, and upcoming competitions.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
