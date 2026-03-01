import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const QRScanner = () => {
    const { user } = useAuth();
    const [scanResult, setScanResult] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 5,
        });

        scanner.render(success, error);

        function success(result) {
            scanner.clear();
            setScanResult(result);
            approveSession(result);
        }

        function error(err) {
            // Ignore ongoing scan errors
        }

        return () => {
            scanner.clear().catch(e => console.error(e));
        };
    }, []);

    const approveSession = async (uuid) => {
        setProcessing(true);
        try {
            await api.post('/qr/approve', { uuid });
            toast.success('Desktop Login Approved!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to approve session');
            setScanResult(null); // Allow scanning again
        } finally {
            setProcessing(false);
        }
    };

    if (user?.role !== 'faculty' && user?.role !== 'admin') {
        return (
            <div className="p-8 max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="text-slate-600 mt-2">Only Faculty members can use the mobile QR scanner to approve logins.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Mobile Authenticator</h1>
                <p className="text-slate-500">Scan the QR code displayed on your desktop to log in securely without a password.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                {scanResult ? (
                    <div className="text-center py-10">
                        {processing ? (
                            <div>
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                                <h3 className="text-xl font-bold text-slate-700">Approving Login...</h3>
                            </div>
                        ) : (
                            <div>
                                <div className="text-green-500 mb-4 inline-block">
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Login Approved</h3>
                                <p className="text-slate-600 mb-6">Your desktop has been successfully authenticated.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn-primary"
                                >
                                    Scan Another Code
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div id="reader" className="w-full"></div>
                )}
            </div>
        </div>
    );
};

export default QRScanner;
