import { useState } from 'react';
import api from '../api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, FileText, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const queryClient = useQueryClient();

    // Polling for pending resources
    const { data: pending = [], isLoading } = useQuery({
        queryKey: ['pending'],
        queryFn: async () => {
            const res = await api.get('/admin/pending');
            return res.data;
        },
        refetchInterval: 2000,
        keepPreviousData: true,
    });

    const approveMutation = useMutation({
        mutationFn: (id) => api.put(`/admin/approve/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending'] });
            toast.success('Resource Approved');
        },
        onError: () => toast.error('Failed to approve'),
    });

    const rejectMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/reject/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending'] });
            toast.success('Resource Rejected');
        },
        onError: () => toast.error('Failed to reject'),
    });

    const handleApprove = (id) => {
        approveMutation.mutate(id);
    };

    const handleReject = (id) => {
        if (confirm("Are you sure you want to reject this resource?")) {
            rejectMutation.mutate(id);
        }
    };

    const handleViewFile = (r) => {
        // ... same logic
        const toastId = toast.loading('Opening file...');
        api.get(`/resources/download?resourceId=${r.resourceId}`, { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                window.open(url);
                toast.dismiss(toastId);
            })
            .catch(() => toast.error('Failed to open file', { id: toastId }));
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen text-blue-600">
            <Loader className="animate-spin" size={48} />
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Admin Dashboard <span className="text-gray-400 text-lg font-normal">({pending.length} Pending)</span>
            </h1>

            {pending.length === 0 ? (
                <div className="text-center text-gray-400 py-12 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
                    <Check size={48} className="mx-auto mb-4 text-green-500" />
                    <p>All caught up! No pending resources.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {pending.map(r => (
                        <div key={r.resourceId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FileText size={20} className="text-blue-500" />
                                    {r.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">Subject: {r.subject}</p>

                                <div className="flex gap-3 mt-2 text-sm font-medium text-gray-500">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{r.branch}</span>
                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">Sem {r.semester}</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                                        By: {r.uploaderName} <span className="text-xs text-gray-400">({r.uploaderEmail})</span>
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {r.description}
                                </p>
                                <button
                                    onClick={() => handleViewFile(r)}
                                    className="mt-3 text-blue-600 underline text-sm hover:text-blue-800 transition"
                                >
                                    View File ({r.fileName})
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(r.resourceId)}
                                    className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition"
                                    title="Approve"
                                    disabled={approveMutation.isLoading}
                                >
                                    <Check size={24} />
                                </button>
                                <button
                                    onClick={() => handleReject(r.resourceId)}
                                    className="bg-red-100 text-red-700 p-2 rounded-full hover:bg-red-200 transition"
                                    title="Reject"
                                    disabled={rejectMutation.isLoading}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
