'use client';

import { useState } from 'react';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !password) return;

        setLoading(true);
        setStatus('Uploading and processing...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        try {
            const res = await fetch('/api/ingest', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setStatus(`✅ Success! Uploaded ${data.chunks} chunks to Pinecone.`);
            setFile(null);
        } catch (err: any) {
            setStatus(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
                <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Admin Document Upload
                </h1>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Admin Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                            placeholder="Enter secret password"
                        />
                    </div>

                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors bg-gray-700/30">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm text-gray-300">
                                {file ? file.name : "Click to select PDF"}
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !file || !password}
                        className={`w-full py-2 px-4 rounded font-bold transition-all transform hover:scale-[1.02] ${loading
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                            }`}
                    >
                        {loading ? 'Processing...' : 'Upload Document'}
                    </button>

                    {status && (
                        <div className={`mt-4 p-3 rounded text-sm text-center ${status.startsWith('✅') ? 'bg-green-500/10 text-green-400' :
                                status.startsWith('❌') ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                            {status}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
