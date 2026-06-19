import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';

const UploadResource = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [metadata, setMetadata] = useState({
        branch: '',
        semester: '',
        subject: '',
        resourceType: 'Notes',
        description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('branch', metadata.branch);
        formData.append('semester', metadata.semester);
        formData.append('subject', metadata.subject);
        formData.append('resourceType', metadata.resourceType);
        formData.append('description', metadata.description);

        const toastId = toast.loading('Uploading resource...');

        try {
            await api.post('/resources/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });
            toast.success("Upload successful! Pending admin approval.", { id: toastId });
            navigate('/student/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed", { id: toastId });
            setProgress(0);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <UploadCloud className="text-blue-600" size={32} />
                Upload Resource
            </h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-4 border border-gray-100">

                {/* File Input */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="pointer-events-none">
                        <UploadCloud className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-gray-600 font-medium">{file ? file.name : "Click to select PDF"}</p>
                        <p className="text-xs text-gray-400 mt-1">Max size: 10MB</p>
                    </div>
                </div>

                {progress > 0 && progress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        <p className="text-xs text-right mt-1 text-gray-500">{progress}%</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Branch</label>
                        <input
                            type="text"
                            value={metadata.branch}
                            onChange={(e) => setMetadata({ ...metadata, branch: e.target.value })}
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. CSE"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Semester</label>
                        <input
                            type="number"
                            min="1"
                            max="8"
                            value={metadata.semester}
                            onChange={(e) => setMetadata({ ...metadata, semester: e.target.value })}
                            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. 4"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Type</label>
                    <select
                        value={metadata.resourceType}
                        onChange={(e) => setMetadata({ ...metadata, resourceType: e.target.value })}
                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="NOTES">Notes</option>
                        <option value="QUESTION_PAPER">Question Paper</option>
                        <option value="LAB_MANUAL">Lab Manual</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Description</label>
                    <textarea
                        value={metadata.description}
                        onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                        className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows="3"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
                    disabled={progress > 0 && progress < 100}
                >
                    {progress > 0 && progress < 100 ? 'Uploading...' : 'Upload Resource'}
                </button>
            </form>
        </div>
    );
};

export default UploadResource;
