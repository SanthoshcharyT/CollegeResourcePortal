import { useState } from 'react';
import api from '../api/axios';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, FileText, Filter as FilterIcon, BookOpen, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        branch: '',
        semester: '',
        subject: '',
        resourceType: ''
    });

    // Public Fetch (No Auth Header required if backend configured correctly, 
    // but axios interceptor attaches it if present, which is fine)
    const { data: resources = [], isLoading, isError } = useQuery({
        queryKey: ['public-resources', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(filters)) {
                if (value) params.append(key, value);
            }
            const res = await api.get(`/resources?${params.toString()}`);
            return res.data;
        },
        keepPreviousData: true,
    });

    const handleDownload = (resourceId, fileName) => {
        if (!user) {
            toast('Please login to download files', { icon: '🔒' });
            navigate('/login');
            return;
        }

        const toastId = toast.loading('Starting download...');
        api.get(`/resources/download?resourceId=${resourceId}`, { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success('Download started', { id: toastId });
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                } else {
                    toast.error("Download failed", { id: toastId });
                }
            });
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen pb-12 bg-gray-50">
            {/* Hero Section - Purple Gradient */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white pt-20 pb-24 px-4 mb-2">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-sm font-semibold mb-6 backdrop-blur-sm">
                        Academic Year 2025-26
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                        Your Content, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                            Our Community.
                        </span>
                    </h1>
                    <p className="text-xl text-purple-100/80 max-w-2xl mx-auto leading-relaxed">
                        Access thousands of peer-reviewed notes, question papers, and lab manuals.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 -mt-12 relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
                        <FilterIcon size={20} />
                        <h2>Filter Resources</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                name="branch"
                                placeholder="Branch (e.g. CSE)"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                onChange={handleFilterChange}
                            />
                        </div>
                        <input
                            name="semester"
                            type="number"
                            placeholder="Semester (1-8)"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            onChange={handleFilterChange}
                        />
                        <input
                            name="subject"
                            placeholder="Subject"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            onChange={handleFilterChange}
                        />
                        <select name="resourceType" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" onChange={handleFilterChange}>
                            <option value="">All Types</option>
                            <option value="NOTES">Notes</option>
                            <option value="QUESTION_PAPER">Question Paper</option>
                            <option value="LAB_MANUAL">Lab Manual</option>
                        </select>
                    </div>
                </div>

                {/* Resource Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center text-red-500 py-12 bg-white rounded-xl shadow">
                        <p className="text-lg">Failed to load resources. Please try again later.</p>
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center text-gray-500 py-20 bg-white rounded-xl shadow-sm">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl font-medium">No resources found matching your criteria.</p>
                        <p className="text-sm mt-2">Try adjusting the filters or be the first to upload!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map(r => (
                            <div key={r.resourceId} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
                                <div className="p-6 flex-grow relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                                            ${r.resourceType === 'NOTES' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                r.resourceType === 'QUESTION_PAPER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>
                                            {r.resourceType.replace('_', ' ')}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {new Date(r.uploadDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition line-clamp-2" title={r.title}>
                                        {r.title}
                                    </h3>

                                    <div className="space-y-3 mb-4 mt-4">
                                        <div className="flex items-center text-sm">
                                            <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mr-3">
                                                <BookOpen size={16} />
                                            </span>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase">Subject</p>
                                                <p className="font-medium text-gray-700 truncate w-40">{r.subject}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 mr-3">
                                                <Layers size={16} />
                                            </span>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase">Course Info</p>
                                                <p className="font-medium text-gray-700">{r.branch} • Sem {r.semester}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {r.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2 bg-gray-50/50 p-3 rounded-xl mb-2 italic">
                                            "{r.description}"
                                        </p>
                                    )}

                                    <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-50">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                                            {r.uploaderName?.charAt(0) || 'U'}
                                        </div>
                                        <span className="text-xs text-gray-500">Shared by <span className="font-medium text-gray-700">{r.uploaderName}</span></span>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 group-hover:bg-purple-50/10 transition-colors">
                                    <button
                                        onClick={() => handleDownload(r.resourceId, r.fileName || r.title)}
                                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-purple-600 hover:bg-purple-600 hover:text-white text-gray-700 font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-lg hover:shadow-purple-200"
                                    >
                                        <Download size={18} /> Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
