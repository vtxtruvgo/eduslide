import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user?.role !== 'admin') {
                toast.error('Access Denied. Administrator privileges required.');
                // Optionally log them out if they are not admin
            } else {
                toast.success('Admin Login successful!');
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
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-8 border-red-600">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">System Admin Portal</h1>
                    <p className="text-slate-500">EduSlide Pro Administrative Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Email</label>
                        <input
                            type="email"
                            required
                            className="input-field"
                            placeholder="admin@eduslide.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Secure Password</label>
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
                        className="bg-red-600 hover:bg-red-700 text-white w-full py-3 text-lg font-bold rounded-xl transition-all shadow-sm"
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-600">
                    Not an administrator?{' '}
                    <Link to="/login" className="text-primary-600 font-bold hover:underline">
                        Student Portal
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
