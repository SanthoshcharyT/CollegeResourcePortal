import { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const [filters, setFilters] = useState({
        branch: '',
        semester: '',
        subject: '',
        resourceType: ''
    });

    // React Query with Polling (2000ms)
    const { data: resources = [], isLoading, isError } = useQuery({
        queryKey: ['resources', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(filters)) {
                if (value) params.append(key, value);
            }
            const res = await api.get(`/resources?${params.toString()}`);
            return res.data;
        },
        refetchInterval: 2000, // Poll every 2 seconds
        keepPreviousData: true,
    });

    const handleDownload = (resourceId, fileName) => {
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
            .catch(err => toast.error("Download failed", { id: toastId }));
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Student Dashboard
                </h1>
                <Link to="/student/upload" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center gap-2">
                    <FileText size={18} /> Upload Resource
                </Link>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        name="branch"
                        placeholder="Filter by Branch"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        onChange={handleFilterChange}
                    />
                </div>
                <input
                    name="semester"
                    placeholder="Filter by Semester"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onChange={handleFilterChange}
                />
                <input
                    name="subject"
                    placeholder="Filter by Subject"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onChange={handleFilterChange}
                />
                <select name="resourceType" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" onChange={handleFilterChange}>
                    <option value="">All Types</option>
                    <option value="Notes">Notes</option>
                    <option value="Paper">Paper</option>
                </select>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : isError ? (
                <div className="text-center text-red-500 py-10">Failed to load resources</div>
            ) : resources.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No resources found.</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {resources.map(r => (
                        <div key={r.resourceId} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition flex justify-between items-center group">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">{r.title}</h3>
                                <p className="text-sm text-gray-500 mb-1">{r.subject}</p>
                                <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">{r.branch}</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">Sem {r.semester}</span>
                                    <span className={`px-2 py-0.5 rounded ${r.resourceType === 'Notes' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {r.resourceType}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2">{r.description}</p>
                                <div className="flex justify-between items-center mt-3">
                                    <p className="text-xs text-gray-400">Uploaded {new Date(r.uploadDate).toLocaleDateString()} by <span className="font-medium text-gray-600">{r.uploaderName}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(r.resourceId, r.fileName || r.title + ".pdf")}
                                className="bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition border border-green-200 flex items-center gap-2"
                            >
                                <Download size={18} /> Download
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
