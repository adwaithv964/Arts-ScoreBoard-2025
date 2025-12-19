import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Score Form States
    const [studentName, setStudentName] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemType, setItemType] = useState('Individual');
    const [group, setGroup] = useState('');
    const [score, setScore] = useState('');
    const [category, setCategory] = useState('Arts');

    // Edit Mode State
    const [editingScoreId, setEditingScoreId] = useState(null);

    // Data States
    const [recentScores, setRecentScores] = useState([]);
    const [groupsData, setGroupsData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Group Management States
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState('#000000');

    // Default Groups Config (fallback)
    const defaultGroups = [
        { id: 'Nishan', name: 'Nishan', color: '#ef4444' }, // Red
        { id: 'Nagara', name: 'Nagara', color: '#22c55e' }, // Green
        { id: 'Dhankul', name: 'Dhankul', color: '#3b82f6' }, // Blue
        { id: 'Bansuri', name: 'Bansuri', color: '#a855f7' }  // Purple
    ];

    useEffect(() => {
        // Fetch Scores
        const qScore = query(collection(db, "scores"), orderBy("timestamp", "desc"));
        const unsubScore = onSnapshot(qScore, (snapshot) => {
            setRecentScores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Groups (Real-time)
        const qGroups = collection(db, "groups");
        const unsubGroups = onSnapshot(qGroups, (snapshot) => {
            if (!snapshot.empty) {
                const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGroupsData(groups);

                // Set default group if not set or invalid
                setGroup(prevGroup => {
                    const isValid = groups.some(g => g.id === prevGroup);
                    return isValid ? prevGroup : '';
                });

            } else {
                setGroupsData(defaultGroups);
                // Initialize groups if empty (one-time)
                defaultGroups.forEach(g => {
                    setDoc(doc(db, "groups", g.id), g);
                });
                setGroup('');
            }
        });

        return () => { unsubScore(); unsubGroups(); };
    }, []);

    const handleSaveScore = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const scoreData = {
                studentName,
                itemName,
                itemType,
                group,
                score: Number(score),
                category,
                timestamp: serverTimestamp()
            };

            if (editingScoreId) {
                // Update existing
                await setDoc(doc(db, "scores", editingScoreId), scoreData, { merge: true });
                alert("Score updated successfully!");
                setEditingScoreId(null);
            } else {
                // Create new
                await addDoc(collection(db, "scores"), scoreData);
                alert("Score added successfully!");
            }

            // Reset form
            setStudentName('');
            setItemName('');
            setScore('');
        } catch (err) {
            alert("Error saving score: " + err.message);
        }
        setLoading(false);
    };

    const handleEdit = (scoreItem) => {
        setStudentName(scoreItem.studentName);
        setItemName(scoreItem.itemName);
        setItemType(scoreItem.itemType || 'Individual');
        setGroup(scoreItem.group);
        setScore(scoreItem.score);
        setCategory(scoreItem.category);
        setEditingScoreId(scoreItem.id);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setStudentName('');
        setItemName('');
        setScore('');
        setEditingScoreId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this score?")) {
            await deleteDoc(doc(db, "scores", id));
        }
    };

    const handleUpdateGroup = async (id, field, value) => {
        try {
            await setDoc(doc(db, "groups", id), { [field]: value }, { merge: true });
        } catch (err) {
            console.error("Failed to update group", err);
        }
    };

    const handleAddGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName.trim()) return;

        // Create ID from name (remove spaces, etc)
        const id = newGroupName.replace(/\s+/g, '').trim();

        try {
            await setDoc(doc(db, "groups", id), {
                name: newGroupName,
                color: newGroupColor
            });
            setNewGroupName('');
            setNewGroupColor('#000000');
            alert("Group added successfully!");
        } catch (err) {
            console.error("Error adding group:", err);
            alert("Error adding group: " + err.message);
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm("Are you sure you want to delete this group? valid scores might lose their group association.")) {
            try {
                await deleteDoc(doc(db, "groups", id));
            } catch (err) {
                console.error("Error deleting group:", err);
                alert("Error deleting group");
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    return (
        <div className="space-y-8 animate-fade-in-up pb-20">
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl backdrop-blur-sm sticky top-20 z-40 border border-white/5">
                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                <button onClick={handleLogout} className="btn btn-error btn-sm">Log Out</button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* 1. Add Score Form */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="badge badge-primary badge-lg">1</span> {editingScoreId ? 'Edit Score' : 'Add Points'}
                    </h2>
                    <form onSubmit={handleSaveScore} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text text-slate-300">Category</span></label>
                                <div className="join w-full">
                                    <input
                                        className="join-item btn w-1/2"
                                        type="radio"
                                        name="category"
                                        aria-label="Arts"
                                        checked={category === 'Arts'}
                                        onChange={() => setCategory('Arts')}
                                    />

                                    <input
                                        className="join-item btn w-1/2"
                                        type="radio"
                                        name="category"
                                        aria-label="Sports"
                                        checked={category === 'Sports'}
                                        onChange={() => setCategory('Sports')}
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text text-slate-300">Item Type</span></label>
                                <div className="join w-full">
                                    <input
                                        className="join-item btn w-1/2"
                                        type="radio"
                                        name="itemType"
                                        aria-label="Individual"
                                        checked={itemType === 'Individual'}
                                        onChange={() => setItemType('Individual')}
                                    />
                                    <input
                                        className="join-item btn w-1/2"
                                        type="radio"
                                        name="itemType"
                                        aria-label="Group"
                                        checked={itemType === 'Group'}
                                        onChange={() => setItemType('Group')}
                                    />
                                </div>
                            </div>


                            <div className="form-control">
                                <label className="label"><span className="label-text text-slate-300">Group</span></label>
                                <select
                                    className="select select-bordered bg-slate-800/50 text-white"
                                    value={group}
                                    onChange={(e) => setGroup(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Group</option>
                                    {groupsData.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text text-slate-300">Student Name</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Adwaith"
                                    className="input input-bordered bg-slate-800/50 text-white"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text text-slate-300">Item Name</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Solo Dance"
                                    className="input input-bordered bg-slate-800/50 text-white"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text text-slate-300">Score</span></label>
                            <input
                                type="number"
                                placeholder="Points to add"
                                className="input input-bordered bg-slate-800/50 text-white font-mono text-xl"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex gap-2">
                            {editingScoreId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="btn btn-ghost flex-1 text-slate-400"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                className={`btn btn-primary flex-[2] text-lg mt-4 ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (editingScoreId ? 'Update Score' : 'Publish Score +')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. Group Management */}
                <div className="glass-card p-6 rounded-2xl h-fit">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="badge badge-secondary badge-lg">2</span> Edit Groups
                    </h2>
                    <div className="space-y-4">
                        {/* Add New Group Form */}
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-white/10 mb-6">
                            <h3 className="font-bold text-white text-sm mb-3">Add New Group</h3>
                            <div className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Group Name"
                                    className="input input-sm input-bordered bg-slate-900 text-white w-full"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        className="h-8 w-10 rounded cursor-pointer"
                                        value={newGroupColor}
                                        onChange={(e) => setNewGroupColor(e.target.value)}
                                    />
                                    <button
                                        onClick={handleAddGroup}
                                        disabled={!newGroupName}
                                        className="btn btn-sm btn-success flex-1"
                                    >
                                        Add Group
                                    </button>
                                </div>
                            </div>
                        </div>

                        {groupsData.map(g => (
                            <div key={g.id} className="collapse collapse-arrow bg-slate-800/30 border border-white/5">
                                <input type="checkbox" />
                                <div className="collapse-title font-bold text-white flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: g.color }}></div>
                                    {g.name}
                                </div>
                                <div className="collapse-content space-y-3 pt-2">
                                    <div className="form-control">
                                        <label className="label-text text-xs text-slate-400">Display Name</label>
                                        <input
                                            type="text"
                                            className="input input-sm input-bordered bg-slate-900 text-white"
                                            value={g.name}
                                            onChange={(e) => handleUpdateGroup(g.id, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label-text text-xs text-slate-400">Color (Hex)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                className="w-8 h-8 rounded cursor-pointer"
                                                value={g.color}
                                                onChange={(e) => handleUpdateGroup(g.id, 'color', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="input input-sm input-bordered bg-slate-900 text-white w-full"
                                                value={g.color}
                                                onChange={(e) => handleUpdateGroup(g.id, 'color', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            onClick={() => handleDeleteGroup(g.id)}
                                            className="btn btn-xs btn-error btn-outline w-full"
                                        >
                                            Delete Group
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Recent Activity */}
            <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">Recent Scores</h2>
                <div className="overflow-x-auto">
                    <table className="table w-full text-slate-300">
                        <thead>
                            <tr className="text-slate-500">
                                <th>Category</th>
                                <th>Student</th>
                                <th>Item</th>
                                <th>Group</th>
                                <th>Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentScores.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No scores yet.</td></tr>
                            ) : (
                                recentScores.map(s => {
                                    const grp = groupsData.find(g => g.id === s.group) || {};
                                    return (
                                        <tr key={s.id} className="hover:bg-white/5">
                                            <td>
                                                <span className={`badge badge-sm ${s.category === 'Sports' ? 'badge-secondary' : 'badge-primary'}`}>
                                                    {s.category}
                                                </span>
                                            </td>
                                            <td className="font-bold text-white">{s.studentName}</td>
                                            <td>{s.itemName}</td>
                                            <td>
                                                <span className="font-bold" style={{ color: grp.color }}>
                                                    {grp.name || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-slate-500 ml-1 font-mono">
                                                    [{s.group}]
                                                </span>
                                            </td>
                                            <td className="font-mono font-bold text-white">+{s.score}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(s)} className="btn btn-ghost btn-xs text-info">Edit</button>
                                                    <button onClick={() => handleDelete(s.id)} className="btn btn-ghost btn-xs text-error">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Debug Section */}
            <div className="p-4 bg-black/50 rounded-xl font-mono text-xs text-slate-400">
                <h3 className="font-bold text-white mb-2">Debug Data (Groups)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {groupsData.map(g => (
                        <div key={g.id} className="border border-slate-700 p-2 rounded">
                            <div className="text-white">{g.name}</div>
                            <div className="text-slate-600">{g.id}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
