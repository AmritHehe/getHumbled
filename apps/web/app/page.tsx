'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Code, Users, Trophy, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import type { Contest } from '@/lib/types';

export default function HomePage() {
  const [liveContests, setLiveContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContests() {
      const response = await api.getContests({ status: 'LIVE' });
      if (response.success && response.data) {
        setLiveContests(response.data.slice(0, 3));
      }
      setLoading(false);
    }
    fetchContests();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="max-w-2xl">
            <p className="text-sm text-[var(--text-muted)] mb-4 uppercase tracking-wider">
              Coding Competition Platform
            </p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
              Compete with developers<br />
              <span className="text-[var(--text-muted)]">around the world</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-lg">
              Join live coding contests, solve algorithmic challenges,
              and prove your skills on the global leaderboard.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/auth/signup">
                <button className="px-6 py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity">
                  Get Started
                </button>
              </Link>
              <Link href="/contests">
                <button className="px-6 py-3 text-sm font-medium text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:border-[var(--border-hover)] transition-colors">
                  Browse Contests
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--border)]">
        <div className="container">
          <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
            {[
              { value: '10K+', label: 'Developers' },
              { value: '500+', label: 'Contests' },
              { value: '50K+', label: 'Problems' },
            ].map((stat, i) => (
              <div key={i} className="py-12 text-center">
                <p className="text-3xl font-medium text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Contests */}
      <section className="section">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="live-dot" />
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Live</span>
              </div>
              <h2>Active Contests</h2>
            </div>
            <Link href="/contests" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5">
                  <div className="skeleton h-5 w-16 mb-3" />
                  <div className="skeleton h-6 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : liveContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveContests.map((contest) => (
                <Link key={contest.id} href={`/contests/${contest.id}`}>
                  <div className="card p-5 hover:border-[var(--border-hover)]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                        {contest.type}
                      </span>
                    </div>
                    <h3 className="font-medium mb-2">{contest.title}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {contest.discription?.substring(0, 60)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[var(--text-muted)] text-center py-8">No live contests at the moment</p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="section border-t border-[var(--border)]">
        <div className="container">
          <div className="mb-12">
            <h2 className="mb-2">Why SkillUp?</h2>
            <p className="text-[var(--text-secondary)]">Everything you need to improve.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <Zap className="w-5 h-5" />, title: 'Real-time', desc: 'Live competitions with instant results' },
              { icon: <Trophy className="w-5 h-5" />, title: 'Rankings', desc: 'Global leaderboard and rankings' },
              { icon: <Code className="w-5 h-5" />, title: 'DSA & Dev', desc: 'Algorithms and development challenges' },
              { icon: <Users className="w-5 h-5" />, title: 'Community', desc: 'Connect with other developers' },
            ].map((feature, i) => (
              <div key={i}>
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center mb-4 text-[var(--text-secondary)]">
                  {feature.icon}
                </div>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section border-t border-[var(--border)]">
        <div className="container">
          <div className="text-center max-w-md mx-auto">
            <h2 className="mb-4">Ready to compete?</h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Create a free account and start competing today.
            </p>
            <Link href="/auth/signup">
              <button className="px-8 py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}