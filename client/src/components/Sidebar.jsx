import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Upload,
    BookOpen,
    Users,
    FileText,
    Bell,
    LogOut,
    Building2,
    ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'faculty', 'student'] },
        { label: 'Upload PPT', icon: Upload, path: '/upload', roles: ['student'] },
        { label: 'Submissions', icon: FileText, path: '/submissions', roles: ['admin', 'faculty', 'student'] },
        { label: 'Subjects', icon: BookOpen, path: '/subjects', roles: ['admin', 'faculty'] },
        { label: 'Departments', icon: Building2, path: '/departments', roles: ['admin'] },
        { label: 'Users', icon: Users, path: '/users', roles: ['admin'] },
        { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['admin', 'faculty', 'student'] },
        { label: 'Admin Setup', icon: ShieldCheck, path: '/admin', roles: ['admin'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-primary-400">EduSlide Pro</h1>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{user?.role} Portal</p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {filteredMenu.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            location.pathname === item.path
                                ? "bg-primary-600 text-white"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors w-full text-left"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
