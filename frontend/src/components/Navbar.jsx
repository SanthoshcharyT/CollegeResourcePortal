import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Upload, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-16">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">

                    {/* Brand */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-purple-600 p-2 rounded-lg text-white group-hover:scale-110 transition-transform shadow-lg shadow-purple-200">
                                <BookOpen size={24} />
                            </div>
                            <span className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
                                Campus<span className="text-purple-600">Portal</span>
                            </span>
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {!user && (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition">
                                    Log In
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button - Shown only on small screens */}
                        {user && (
                            <div className="lg:hidden flex items-center gap-3">
                                {/* Mobile-only simple nav could go here */}
                                <button onClick={handleLogout} className="text-gray-500">
                                    <LogOut size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
