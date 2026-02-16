'use client';

import React from 'react';
import { BookOpen, Users, Globe, Shield, Lightbulb, Sparkles, Trophy, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export default function AdminGuidePage() {
    return (
        <div className="p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">
                        Admin Guide
                    </h1>
                </div>
                <p className="text-muted">
                    Everything you need to know about managing the SkillUp platform.
                </p>
            </div>

            {/* Guide Content */}
            <div className="space-y-6">
                {/* Platform Overview */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                                <Globe className="w-5 h-5 text-muted" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-primary mb-2">
                                    Platform Overview
                                </h2>
                                <p className="text-secondary text-sm leading-relaxed">
                                    SkillUp is a competitive quiz platform where users can participate in live MCQ contests,
                                    practice with AI-generated quizzes, and track their progress. As an admin, you can create
                                    and manage contests, add questions manually or with AI assistance, and monitor the leaderboard.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Multi-Admin Dashboard */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5 text-muted" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-primary mb-2">
                                    Shared Admin Dashboard
                                </h2>
                                <p className="text-secondary text-sm leading-relaxed">
                                    This admin panel is shared across all administrators. Any contest you create or modify
                                    will be visible to other admins. Coordinate with your team to avoid conflicts when
                                    editing the same contest simultaneously.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Public Contests */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-muted" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-primary mb-2">
                                    Privacy & Visibility
                                </h2>
                                <ul className="text-secondary text-sm space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-muted mt-1">•</span>
                                        <span>All contests are <strong>public</strong> and visible to registered users</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-muted mt-1">•</span>
                                        <span>Questions and answers are protected during live contests</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-muted mt-1">•</span>
                                        <span>Leaderboards are visible to all participants in real-time</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Creating Contests */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                                <Trophy className="w-5 h-5 text-muted" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-primary mb-2">
                                    Creating Contests
                                </h2>
                                <ol className="text-secondary text-sm space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-elevated flex items-center justify-center text-xs font-medium shrink-0">1</span>
                                        <span>Go to <strong>Contests → Create</strong> and fill in the contest details (title, description, type)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-elevated flex items-center justify-center text-xs font-medium shrink-0">2</span>
                                        <span>Set the status to <strong>UPCOMING</strong> (scheduled) or <strong>LIVE</strong> (starts immediately)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-elevated flex items-center justify-center text-xs font-medium shrink-0">3</span>
                                        <span>Add questions manually or use <strong>Create with AI</strong> to generate them automatically</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-elevated flex items-center justify-center text-xs font-medium shrink-0">4</span>
                                        <span>Once ready, the contest will be visible to all users on the contests page</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Question Generation */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                                <Sparkles className="w-5 h-5 text-muted" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-primary mb-2">
                                    AI Question Generation
                                </h2>
                                <p className="text-secondary text-sm leading-relaxed mb-3">
                                    Describe your topic and difficulty level, and AI will generate ~10 high-quality MCQ questions
                                    with answers. This is perfect for quickly creating practice quizzes or populating contests.
                                </p>
                                <div className="p-3 rounded-lg bg-surface-alt text-sm text-muted">
                                    <strong>Tip:</strong> Be specific in your prompts! Instead of "JavaScript questions",
                                    try "JavaScript async/await and Promises for intermediate developers".
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contest Modes */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-muted" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-primary mb-2">
                                    Contest Modes
                                </h2>
                                <div className="grid gap-3">
                                    <div className="p-3 rounded-lg bg-surface-alt">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded bg-elevated text-primary">LIVE</span>
                                            <span className="text-sm font-medium text-primary">Real-time Competition</span>
                                        </div>
                                        <p className="text-xs text-muted">
                                            Timed contests with live leaderboard. Users compete simultaneously.
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-surface-alt">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded bg-elevated text-primary">Practice</span>
                                            <span className="text-sm font-medium text-primary">Self-paced Learning</span>
                                        </div>
                                        <p className="text-xs text-muted">
                                            No time limit. Users can practice at their own pace. Correct answers shown after submission.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                                <Lightbulb className="w-5 h-5 text-muted" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-primary mb-2">
                                    Quick Tips
                                </h2>
                                <ul className="text-secondary text-sm space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-muted mt-1">→</span>
                                        <span>Test your contest in a private browser before going live</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-muted mt-1">→</span>
                                        <span>AI-generated questions should be reviewed for accuracy</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-muted mt-1">→</span>
                                        <span>Set appropriate time limits - too short frustrates, too long bores</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-muted mt-1">→</span>
                                        <span>Use descriptive titles so users know what to expect</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
