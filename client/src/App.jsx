import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import FacultyLogin from './pages/FacultyLogin';
import AdminLogin from './pages/AdminLogin';
import QRScanner from './pages/QRScanner';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadPPT from './pages/UploadPPT';
import Submissions from './pages/Submissions';

import AdminSetup from './pages/AdminSetup';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Toaster position="top-right" richColors />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/faculty/login" element={<FacultyLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/upload" element={<UploadPPT />} />
                        <Route path="/submissions" element={<Submissions />} />
                        <Route path="/admin" element={<AdminSetup />} />
                        <Route path="/scan" element={<QRScanner />} />

                        {/* More routes can be added here */}
                        <Route path="/subjects" element={<div className="p-8"><h1 className="text-2xl font-bold">Subjects Management (Admin/Faculty Only)</h1></div>} />
                        <Route path="/departments" element={<div className="p-8"><h1 className="text-2xl font-bold">Departments Management (Admin Only)</h1></div>} />
                        <Route path="/users" element={<div className="p-8"><h1 className="text-2xl font-bold">User Management (Admin Only)</h1></div>} />
                        <Route path="/notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications</h1></div>} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
