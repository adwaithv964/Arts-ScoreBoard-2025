import React from 'react';
import { useLiveUsers } from '../hooks/useLiveUsers';

const LiveUserBadge = () => {
    // Pass false so we don't register a new "user" just by mounting this badge
    // (Presence is handled in App.jsx or main layout)
    const count = useLiveUsers(false);

    if (count === 0) return null;

    return (
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg animate-fade-in">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-white font-bold text-sm tracking-wide">
                {count} <span className="text-slate-400 font-normal text-xs uppercase ml-1">Live</span>
            </span>
        </div>
    );
};

export default LiveUserBadge;
