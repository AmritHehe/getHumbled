'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { ContestCard } from '@/components/ContestCard';
import { api } from '@/lib/api';
import type { Contest, ContestStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

type FilterType = 'ALL' | 'PRACTICE' | ContestStatus;

const filters: { label: string; value: FilterType }[] = [
    { label: 'All Contests', value: 'ALL' },
    { label: 'Live', value: 'LIVE' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Practice', value: 'CLOSED' },
];

export default function ContestsPage() {
    const ContestsRef  = useRef<Contest[]>([])
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

    useEffect(() => {
        async function fetchContests() {
            setIsLoading(true);
            const response = await api.getContests();
            if (response.success && response.data) {
                ContestsRef.current = (response.data);
                setContests(ContestsRef.current)
            } else {
                setContests([]);
            }
            setIsLoading(false);
        }
        fetchContests();
    }, []);

    useEffect(()=> {
        let x = [...ContestsRef.current]
        if (activeFilter === 'LIVE') {
            console.log("active Filter valie " + activeFilter)
            x = x.filter((contests : Contest) => contests.status == activeFilter && contests.mode!='practice')
            console.log(x)
        } else if (activeFilter === 'UPCOMING') {
            x= x.filter((contests : Contest) => contests.status == activeFilter)
            console.log(x)
        } else if (activeFilter === 'PRACTICE') {
            x= x.filter((contests : Contest) => contests.mode == 'practice' )
            console.log(x)
        } else { 
            
        }
        
        
        
        setContests(x)
    },[,activeFilter])

    const filteredContests = contests.filter((contest) => {
        const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contest.discription.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });


    const sortedContests = [...filteredContests].sort((a, b) => {
        if(a.mode == b.mode){
            return (b.status.localeCompare(a.status))
        }
        return (b.mode.localeCompare(a.mode));
    });

    return (
        <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl mt-10 md:text-3xl font-medium text-primary mb-3">
                    Contests
                </h1>
                <p className="text-secondary max-w-2xl">
                    Join live competitions, practice past contests, or prepare with AI-generated practice quizzes.
                </p>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <div className="w-full sm:w-72">
                    <Input
                        placeholder="Search contests..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        leftIcon={<Search className="w-4 h-4" />}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <SlidersHorizontal className="w-4 h-4 text-muted shrink-0" />
                    {filters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={cn(
                                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                                activeFilter === filter.value
                                    ? 'bg-accent text-surface'
                                    : 'bg-elevated text-secondary hover:text-primary'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Contest Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6">
                            <div className="skeleton h-5 w-20 mb-4" />
                            <div className="skeleton h-6 w-3/4 mb-3" />
                            <div className="skeleton h-4 w-full mb-2" />
                            <div className="skeleton h-4 w-2/3 mb-6" />
                            <div className="skeleton h-10 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : sortedContests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedContests.map((contest) => (
                        <ContestCard key={contest.id} contest={contest} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 card">
                    <Filter className="w-10 h-10 text-muted mx-auto mb-4" />
                    <p className="text-secondary mb-1">No contests found</p>
                    <p className="text-sm text-muted">
                        {searchQuery ? 'Try a different search term' : 'Check back later for new contests'}
                    </p>
                </div>
            )}
        </div>
    );
}
