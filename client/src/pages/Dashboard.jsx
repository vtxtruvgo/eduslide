import { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/presentations');
                const data = res.data;
                setStats({
                    total: data.length,
                    approved: data.filter(p => p.status === 'approved').length,
                    pending: data.filter(p => p.status === 'pending').length,
                    rejected: data.filter(p => p.status === 'rejected').length
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total PPTs" value={stats.total} icon={FileText} color="bg-blue-500" />
            <StatCard title="Approved" value={stats.approved} icon={CheckCircle} color="bg-emerald-500" />
            <StatCard title="Pending" value={stats.pending} icon={Clock} color="bg-amber-500" />
            <StatCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-rose-500" />
        </div>
    );
};

export default Dashboard;
