import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contests',
    description: 'Browse live coding contests, upcoming competitions, and AI-generated practice quizzes on SkillUp.',
};

export default function ContestsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
