import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                            Campus Resource Sharing Portal
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            A centralized platform for students and faculty to share knowledge, resources, and academic materials securely and efficiently.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-500">
                            <li><a href="/" className="hover:text-blue-600 transition">Browse Resources</a></li>
                            <li><a href="/login" className="hover:text-blue-600 transition">Login</a></li>
                            <li><a href="/register" className="hover:text-blue-600 transition">Register</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Connect</h4>
                        <div className="flex space-x-4 text-gray-400">
                            <a href="#" className="hover:text-gray-600 transition"><Github size={20} /></a>
                            <a href="#" className="hover:text-blue-400 transition"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-blue-700 transition"><Linkedin size={20} /></a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Campus Portal. All rights reserved.</p>
                    <p className="flex items-center gap-1 mt-2 md:mt-0">
                        Made with <Heart size={14} className="text-red-500 fill-current" /> for Education
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
