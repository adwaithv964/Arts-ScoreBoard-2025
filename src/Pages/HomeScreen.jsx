import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';

const HomeScreen = () => {
    const [data, setData] = useState([]);
    const [groupsConfig, setGroupsConfig] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);

    useEffect(() => {
        // 1. Fetch Group Configs
        const unsubGroups = onSnapshot(collection(db, "groups"), (snap) => {
            const config = {};
            snap.docs.forEach(doc => {
                config[doc.id] = doc.data();
            });
            setGroupsConfig(config);
        });

        // 2. Fetch Arts Scores Only
        const q = query(
            collection(db, "scores"),
            where("category", "==", "Arts"),
            orderBy("timestamp", "desc")
        );

        const unsubScores = onSnapshot(q, (snapshot) => {
            const scoresData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setData(scoresData);
            setLoading(false);
            // Cache for offline
            localStorage.setItem("arts_data", JSON.stringify(scoresData));
        }, (err) => {
            console.error("Error fetching live data:", err);
            setError(err.message);
            // Fallback to local cache if offline
            const cached = localStorage.getItem("arts_data");
            if (cached) setData(JSON.parse(cached));
            setLoading(false);
        });

        return () => { unsubGroups(); unsubScores(); };
    }, []);

    // Calculate Group Scores based on live data
    // Default Group IDs (Fallback)
    const groupIds = ["Nishan", "Nagara", "Dhankul", "Bansuri"];

    const groupScores = groupIds.map(id => {
        // Use dynamic name if available, else ID
        const name = groupsConfig[id]?.name || id;
        const color = groupsConfig[id]?.color || '#ffffff';

        const total = data
            .filter(e => e.group === id)
            .reduce((sum, e) => sum + e.score, 0);

        return { id, name, score: total, color };
    }).sort((a, b) => b.score - a.score);

    // Pagination
    const itemsPerPage = 10;
    const paginatedData = data.slice(page, page + itemsPerPage);

    if (loading && data.length === 0) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <span className="loading loading-ring loading-lg text-blue-500 scale-150"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center pt-20">
                <div role="alert" className="alert alert-error max-w-lg shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <h3 className="font-bold">Connection Error</h3>
                        <div className="text-sm">Please check your internet or create the database index.</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in-up">
            {/* Header Section */}
            <div className="relative w-full h-48 md:h-64 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523174802553-10fd69b213ec?q=80&w=2069&auto=format&fit=crop')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 md:p-8">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">Arts <span className="text-blue-400">2025</span></h1>
                    <p className="text-gray-300 text-sm md:text-lg mt-1 md:mt-2 font-medium">Fine Arts Festival Scoreboard</p>
                </div>
            </div>

            {/* Leaderboard Section */}
            <div>
                <h2 className="text-3xl font-bold text-white mb-6 pl-2 border-l-4 border-blue-500">Group Standings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {groupScores.map((group, index) => (
                        <div key={group.id} className="relative glass-card rounded-2xl p-6 overflow-hidden transition-all hover:-translate-y-2 hover:shadow-blue-500/20">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-9xl font-black">{index + 1}</span>
                            </div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-lg"
                                    style={{
                                        backgroundColor: index < 3 ? group.color : '#334155',
                                        color: '#fff',
                                        boxShadow: `0 0 20px -5px ${group.color}`
                                    }}
                                >
                                    {index + 1}
                                </div>
                                <h3 className="text-2xl font-bold text-white uppercase tracking-wider text-center">{group.name}</h3>
                                <div className="text-5xl font-black text-blue-400 mt-2">{group.score}</div>
                                <p className="text-sm text-slate-400 mt-1 uppercase tracking-widest">Points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed Table Section */}
            <div className="glass rounded-3xl p-1 md:p-8">
                <div className="flex justify-between items-center mb-6 px-4">
                    <h2 className="text-2xl font-bold text-white">Latest Updates</h2>
                    <span className="badge badge-error text-white font-bold tracking-widest animate-pulse border-0 shadow-[0_0_15px_rgba(239,68,68,0.6)]">LIVE</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full text-slate-300">
                        <thead className="bg-slate-800/50 text-white font-bold uppercase text-sm tracking-wider">
                            <tr>
                                <th className="rounded-l-lg py-3 md:py-4">Student</th>
                                <th className="py-3 md:py-4">Item</th>
                                <th className="py-3 md:py-4">Type</th>
                                <th className="py-3 md:py-4">Group</th>
                                <th className="rounded-r-lg py-3 md:py-4 text-right pr-4 md:pr-8">Score</th>
                            </tr>
                        </thead>
                        <tbody className="text-base">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((e) => {
                                    const grp = groupsConfig[e.group] || { name: e.group, color: '#94a3b8' };
                                    return (
                                        <tr key={e.id} className="hover:bg-white/5 border-b border-white/5 transition-colors text-sm md:text-base">
                                            <td className="font-bold text-white py-3 md:py-4 whitespace-nowrap">{e.studentName}</td>
                                            <td className="py-3 md:py-4 whitespace-nowrap">{e.itemName}</td>
                                            <td className="py-4">
                                                <span className="badge badge-sm badge-ghost">{e.itemType || '-'}</span>
                                            </td>
                                            <td className="py-4">
                                                <span
                                                    className="badge border-0 font-bold"
                                                    style={{ backgroundColor: `${grp.color}33`, color: grp.color }}
                                                >
                                                    {grp.name}
                                                </span>
                                            </td>
                                            <td className="font-bold text-white text-right pr-4 md:pr-8 py-3 md:py-4">+{e.score}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-500">
                                        No Arts scores added yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data.length > itemsPerPage && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button
                            className="btn btn-outline btn-sm text-white hover:bg-white hover:text-black border-slate-600 disabled:opacity-50"
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - itemsPerPage))}
                        >
                            Previous
                        </button>
                        <span className="btn btn-ghost btn-sm text-slate-400">
                            Page {Math.floor(page / itemsPerPage) + 1}
                        </span>
                        <button
                            className="btn btn-outline btn-sm text-white hover:bg-white hover:text-black border-slate-600 disabled:opacity-50"
                            disabled={page + itemsPerPage >= data.length}
                            onClick={() => setPage(p => p + itemsPerPage)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeScreen;
