import { ActiveContests } from '@/components/home/ActiveContests';
import { HeroCTA, BottomCTA } from '@/components/home/CTASections';

const stats = [
    { value: '10K+', label: 'Developers' },
    { value: '500+', label: 'Contests' },
    { value: '50K+', label: 'Problems' },
];

const features = [
    { title: 'Real-time Competition', desc: 'Compete head-to-head with developers worldwide. Live rankings update as you solve.' },
    { title: 'Track Your Growth', desc: 'Watch your skills compound over time. Every problem solved is progress earned.' },
    { title: 'DSA & Development', desc: 'From algorithms to full-stack challenges. Build the skills that matter most.' },
    { title: 'Learn by Doing', desc: 'Theory only takes you so far. Practice under pressure makes perfect.' },
];

export default function HomePage() {
    return (
        <div className="min-h-screen">

            {/* Hero*/}
            <section className="py-24 md:py-32">
                <div className="container">
                    <div className="max-w-2xl">
                        <p className="text-sm text-muted mb-4 uppercase tracking-wider">
                            Coding Competition Platform
                        </p>
                        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
                            Compete with developers<br />
                            <span className="text-muted">around the world</span>
                        </h1>
                        <p className="text-lg text-secondary mb-8 max-w-lg">
                            Join live contests, solve practice quizzes,
                            and prove your skills on the global leaderboard.
                        </p>
                        {/* Client component — needs auth state */}
                        <HeroCTA />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="border-y border-default">
                <div className="container">
                    <div className="grid grid-cols-3 divide-x divide-default">
                        {stats.map((stat, i) => (
                            <div key={i} className="py-12 text-center">
                                <p className="text-3xl font-medium text-primary">{stat.value}</p>
                                <p className="text-sm text-muted mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Active Contests — client component (fetches data) */}
            <ActiveContests />

            {/* Features */}
            <section className="section border-t border-default">
                <div className="container">
                    <div className="mb-12">
                        <h2 className="mb-2">Why SkillUp?</h2>
                        <p className="text-secondary">Get 1% better every day.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {features.map((feature, i) => (
                            <div key={i}>
                                <h3 className="font-medium mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA — client component (needs auth state) */}
            <BottomCTA />
        </div>
    );
}