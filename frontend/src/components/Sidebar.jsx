import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Upload, Shield, User, LogOut, BookOpen, Layers } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const linkClass = (path) => `
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
        ${isActive(path)
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 transform scale-105'
            : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}
    `;

    return (
        <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-16">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-b from-white to-purple-50/30">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-xl">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{user.name}</h3>
                    <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full mt-2 uppercase tracking-wide">
                        {user.role}
                    </span>
                    <p className="text-gray-400 text-sm mt-1 mb-2">{user.email}</p>
                </div>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</div>

                <Link to="/" className={linkClass('/')}>
                    <Home size={20} />
                    Browse Resources
                </Link>

                {user.role === 'STUDENT' && (
                    <>
                        <Link to="/student/my-uploads" className={linkClass('/student/my-uploads')}>
                            <Layers size={20} />
                            My Uploads
                        </Link>
                        <Link to="/student/upload" className={linkClass('/student/upload')}>
                            <Upload size={20} />
                            Upload Resource
                        </Link>
                    </>
                )}

                {user.role === 'ADMIN' && (
                    <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                        <Shield size={20} />
                        Pending Approvals
                    </Link>
                )}
            </nav>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition font-medium"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
