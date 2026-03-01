import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import api from '../services/api';

const FacultyLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'email'
    const [qrUuid, setQrUuid] = useState(null);

    const { login, loginWithToken } = useAuth();
    const navigate = useNavigate();

    // Fetch a QR UUID on component mount if tab is 'qr'
    useEffect(() => {
        let interval;
        const fetchQr = async () => {
            try {
                const res = await api.get('/qr/generate');
                setQrUuid(res.data.uuid);
            } catch (error) {
                console.error("Failed to generate QR Code", error);
            }
        };

        if (activeTab === 'qr') {
            fetchQr();
        }

        return () => clearInterval(interval);
    }, [activeTab]);

    // Poll the backend for QR status
    useEffect(() => {
        let timer;
        const pollStatus = async () => {
            if (!qrUuid) return;
            try {
                const res = await api.get(`/qr/status/${qrUuid}`);
                if (res.data.status === 'approved' && res.data.custom_token) {
                    toast.success('QR Login Successful!');
                    setLoading(true);
                    await loginWithToken(res.data.custom_token);
                    navigate('/dashboard');
                } else {
                    // Poll again in 2 seconds
                    timer = setTimeout(pollStatus, 2000);
                }
            } catch (error) {
                console.error("Polling error", error);
                // Keep polling even if there's a minor error
                timer = setTimeout(pollStatus, 2000);
            }
        };

        if (qrUuid) {
            pollStatus();
        }

        return () => clearTimeout(timer);
    }, [qrUuid, loginWithToken, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user?.role !== 'faculty') {
                toast.error('Access Denied. Faculty privileges required.');
            } else {
                toast.success('Faculty Login successful!');
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-primary-600">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Faculty Portal</h1>
                    <p className="text-slate-500">Sign in to manage presentations</p>
                </div>

                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        className={`flex-1 py-2 font-bold ${activeTab === 'qr' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500'}`}
                        onClick={() => setActiveTab('qr')}
                    >
                        QR Code Login
                    </button>
                    <button
                        className={`flex-1 py-2 font-bold ${activeTab === 'email' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500'}`}
                        onClick={() => setActiveTab('email')}
                    >
                        Email / Password
                    </button>
                </div>

                {activeTab === 'email' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Faculty Email</label>
                            <input
                                type="email"
                                required
                                className="input-field"
                                placeholder="name@university.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary-600 hover:bg-primary-700 text-white w-full py-3 text-lg font-bold rounded-xl transition-all shadow-sm"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="mb-4 text-slate-600">Open the EduSlide Faculty app on your mobile device and scan this QR code to log in instantly.</p>
                        <div className="flex justify-center p-4 bg-white border-2 border-slate-100 rounded-xl">
                            {qrUuid ? (
                                <QRCode value={qrUuid} size={200} />
                            ) : (
                                <div className="h-[200px] w-[200px] bg-slate-100 animate-pulse rounded flex items-center justify-center">Loading...</div>
                            )}
                        </div>
                        <p className="mt-4 text-xs text-slate-400 font-mono">Session: {qrUuid}</p>
                    </div>
                )}

                <p className="mt-8 text-center text-sm text-slate-600">
                    Not a faculty member?{' '}
                    <Link to="/login" className="text-primary-600 font-bold hover:underline">
                        Student Portal
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default FacultyLogin;
