import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your SkillUp account to join live coding contests and track your progress.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return children;
}
