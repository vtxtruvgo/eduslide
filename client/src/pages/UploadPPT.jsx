import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Upload, FileUp } from 'lucide-react';

const UploadPPT = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [file, setFile] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            const res = await api.get('/subjects');
            setSubjects(res.data);
        };
        fetchSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a file');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('subject_id', subjectId);
        formData.append('presentation', file);

        setLoading(true);
        try {
            await api.post('/presentations', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Presentation uploaded successfully!');
            setTitle('');
            setDescription('');
            setFile(null);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileUp className="text-primary-600" />
                Upload New Presentation
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Presentation Title</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                    <select
                        required
                        className="input-field"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                    >
                        <option value="">Select a subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                        className="input-field min-h-[100px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">File (PDF, PPT, PPTX - Max 20MB)</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 hover:border-primary-400 transition-colors group cursor-pointer">
                        <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".pdf, .ppt, .pptx"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <div className="text-center">
                            <Upload className="mx-auto text-slate-400 group-hover:text-primary-500 mb-2" size={32} />
                            <p className="text-sm font-medium text-slate-600">
                                {file ? file.name : 'Click or drag file to upload'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3"
                >
                    {loading ? 'Uploading...' : 'Upload Presentation'}
                </button>
            </form>
        </div>
    );
};

export default UploadPPT;
