import api from '../api/axios';
import { useQuery } from '@tanstack/react-query';
import { Download, BookOpen, Layers, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyResources = () => {

    const { data: resources = [], isLoading, isError } = useQuery({
        queryKey: ['my-resources'],
        queryFn: async () => {
            const res = await api.get('/resources?my=true');
            return res.data;
        }
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
            .catch(() => {
                toast.error("Download failed", { id: toastId });
            });
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading your uploads...</div>;
    if (isError) return <div className="p-8 text-center text-red-500">Failed to load uploads.</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">My Uploads</h1>

            {resources.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">You haven't uploaded any resources yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(r => (
                        <div key={r.resourceId} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
                            <div className="p-6 flex-grow relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1
                                        ${r.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                            r.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                        {r.status === 'APPROVED' && <CheckCircle size={12} />}
                                        {r.status === 'REJECTED' && <XCircle size={12} />}
                                        {r.status === 'PENDING' && <Clock size={12} />}
                                        {r.status}
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {new Date(r.uploadDate).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" title={r.title}>
                                    {r.title}
                                </h3>

                                <div className="space-y-2 mb-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-gray-400" /> {r.subject}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Layers size={14} className="text-gray-400" /> {r.branch} • Sem {r.semester}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                                <button
                                    onClick={() => handleDownload(r.resourceId, r.fileName || r.title)}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700 font-medium py-2 rounded-lg transition"
                                >
                                    <Download size={16} /> Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyResources;
