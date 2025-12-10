import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <div className="navbar fixed top-0 z-50 px-2 py-2 md:px-4 md:py-3 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost normal-case text-xl md:text-2xl font-bold tracking-tight text-white gap-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        SCOREBOARD
                    </span>
                    <span className="font-light text-slate-300">2025</span>
                </Link>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1 gap-2">
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `font-medium transition-all duration-200 ${isActive ? 'text-blue-400 bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`
                            }
                        >
                            Arts
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/sports"
                            className={({ isActive }) =>
                                `font-medium transition-all duration-200 ${isActive ? 'text-purple-400 bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`
                            }
                        >
                            Sports
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const Footer = () => {
    return (
        <footer className="footer items-center p-4 bg-neutral-900/50 text-neutral-content mt-auto backdrop-blur-sm border-t border-white/5">
            <aside className="items-center grid-flow-col flex flex-col gap-1">
                <p className="text-slate-400 text-center">Copyright © 2025 - All rights reserved by Department of Computer Science</p>
                <div className="text-center">
                    <p className="text-slate-500 text-sm font-medium">Created by <span className="text-blue-400">Adwaith V</span></p>
                    <p className="text-slate-600 text-xs font-medium"> </p>
                    <p className="text-slate-600 text-xs font-medium">BSC CS</p>
                </div>
            </aside>
        </footer>
    );
};

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16 md:pt-20 px-2 md:px-4 pb-10 container mx-auto">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
