'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Contest } from '@/lib/types';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
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
              <Link href="/contests">
                <button className="px-6 py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity">
                  Browse Contests
                </button>
              </Link>
              <Link href={isAuthenticated ? "/practice/new" : "/auth/signin"}>
                <button className="px-6 py-3 text-sm font-medium text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:border-[var(--border-hover)] transition-colors">
                  Practice with AI
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
            <p className="text-[var(--text-secondary)]">Get 1% better every day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: 'Real-time Competition', desc: 'Compete head-to-head with developers worldwide. Live rankings update as you solve.' },
              { title: 'Track Your Growth', desc: 'Watch your skills compound over time. Every problem solved is progress earned.' },
              { title: 'DSA & Development', desc: 'From algorithms to full-stack challenges. Build the skills that matter most.' },
              { title: 'Learn by Doing', desc: 'Theory only takes you so far. Practice under pressure makes perfect.' },
            ].map((feature, i) => (
              <div key={i}>
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
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
              {isAuthenticated
                ? 'Jump into a contest and test your skills.'
                : 'Create a free account and start competing today.'
              }
            </p>
            {isAuthenticated ? (
              <Link href="/contests">
                <button className="px-8 py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity">
                  Browse Contests
                </button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <button className="px-8 py-3 text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:opacity-90 transition-opacity">
                  Create Account
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}