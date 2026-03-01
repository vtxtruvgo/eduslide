import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, BookOpen, Building, ShieldCheck, PieChart, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        presentations: 0,
        subjects: 0,
        departments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, fetch these from an admin endpoint
        // For now, simulating data load
        setTimeout(() => {
            setStats({
                users: 24,
                presentations: 120,
                subjects: 15,
                departments: 4,
            });
            setLoading(false);
        }, 800);
    }, []);

    const StatCard = ({ title, value, icon: Icon, colorClass, linkTo }) => (
        <Link to={linkTo} className="block group">
            <motion.div
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-lg"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                            {loading ? <span className="animate-pulse bg-slate-200 dark:bg-slate-700 text-transparent rounded w-16 inline-block">00</span> : value}
                        </h3>
                    </div>
                    <div className={`p-4 rounded-xl ${colorClass}`}>
                        <Icon size={28} className="text-white" />
                    </div>
                </div>
            </motion.div>
        </Link>
    );

    const ActionCard = ({ title, desc, icon: Icon, btnText, linkTo }) => (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                <Icon size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow">{desc}</p>
            <Link to={linkTo} className="w-full">
                <button className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    {btnText}
                </button>
            </Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="text-red-600" size={36} />
                        Admin Control Panel
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">System Overview and Management</p>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Users" value={stats.users} icon={Users} colorClass="bg-blue-500 shadow-blue-500/30" linkTo="/users" />
                <StatCard title="Presentations" value={stats.presentations} icon={PieChart} colorClass="bg-emerald-500 shadow-emerald-500/30" linkTo="/submissions" />
                <StatCard title="Subjects" value={stats.subjects} icon={BookOpen} colorClass="bg-purple-500 shadow-purple-500/30" linkTo="/subjects" />
                <StatCard title="Departments" value={stats.departments} icon={Building} colorClass="bg-orange-500 shadow-orange-500/30" linkTo="/departments" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Actions */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ActionCard
                                title="Manage Users"
                                desc="Add, remove, or modify roles for students, faculty, and admins."
                                icon={Users}
                                btnText="Go to Users"
                                linkTo="/users"
                            />
                            <ActionCard
                                title="Departments & Subjects"
                                desc="Configure the academic structure of the slide system."
                                icon={Building}
                                btnText="Manage Structure"
                                linkTo="/departments"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Info Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Info size={20} className="text-blue-400" />
                                <h3 className="font-bold text-lg">System Status</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                                    <span className="text-slate-400 text-sm">Database</span>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold">Connected (SQL)</span>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                                    <span className="text-slate-400 text-sm">Storage</span>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold">Active (Cloudinary)</span>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center border border-slate-700">
                                    <span className="text-slate-400 text-sm">Auth</span>
                                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold">Secure (Firebase)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
