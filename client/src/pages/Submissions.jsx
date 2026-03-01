import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ExternalLink, Check, X } from 'lucide-react';

const Submissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/presentations');
            setSubmissions(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/presentations/${id}/status`, { status });
            toast.success(`Status updated to ${status}`);
            fetchSubmissions();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Title</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Uploader</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {submissions.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-semibold text-slate-900">{item.title}</p>
                                <p className="text-xs text-slate-500 truncate w-48">{item.description}</p>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">{item.uploader_name}</td>
                            <td className="px-6 py-4 text-slate-600">{item.subject_name}</td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        item.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                            'bg-amber-100 text-amber-700'
                                    }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <a
                                        href={`${api.defaults.baseURL.replace('/api', '')}${item.file_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                    </a>

                                    {(user.role === 'admin' || user.role === 'faculty') && item.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(item.id, 'approved')}
                                                className="p-2 text-emerald-400 hover:text-emerald-600 transition-colors"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(item.id, 'rejected')}
                                                className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Submissions;
