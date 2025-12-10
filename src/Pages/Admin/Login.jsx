import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Failed to log in: ' + err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="glass-card p-8 rounded-2xl w-full max-w-md animate-fade-in-up">
                <h2 className="text-3xl font-bold text-white text-center mb-6">Judge Login</h2>
                {error && <div className="alert alert-error mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="label">
                            <span className="label-text text-slate-300">Email</span>
                        </label>
                        <input
                            type="email"
                            className="input input-bordered w-full bg-slate-800/50 text-white placeholder-slate-500 border-slate-600 focus:border-blue-500"
                            placeholder="judge@scoreboard.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text text-slate-300">Password</span>
                        </label>
                        <input
                            type="password"
                            className="input input-bordered w-full bg-slate-800/50 text-white placeholder-slate-500 border-slate-600 focus:border-blue-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full text-lg">Log In</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
