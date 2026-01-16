'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !password) return;

        setLoading(true);
        setStatus('Processing PDF & Generating Embeddings...');

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

            setStatus(`✅ Success! Ingested ${data.chunks} chunks from "${file.name}"`);
            setFile(null);
        } catch (err: any) {
            setStatus(`❌ Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors group">
                        <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Chat
                    </Link>

                    <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Knowledge Base
                    </h1>
                    <p className="text-gray-400 mb-8 text-sm">
                        Upload PDFs to train your AI assistant. Secure access only.
                    </p>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-blue-400 transition-colors">
                                Access Key
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-inner"
                                placeholder="Enter admin password..."
                            />
                        </div>

                        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 relative ${file ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-gray-500 hover:bg-white/5'
                            }`}>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                    setFile(e.target.files?.[0] || null);
                                    setStatus('');
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            <div className="flex flex-col items-center gap-3">
                                {file ? (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-medium break-all">{file.name}</p>
                                            <p className="text-xs text-green-400 mt-1">Ready to upload</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-1">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-300">Click or drag PDF here</p>
                                            <p className="text-xs text-gray-500 mt-1">PDF files only (max 10MB)</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file || !password}
                            className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform duration-200 flex items-center justify-center gap-2 ${loading
                                    ? 'bg-gray-700 cursor-not-allowed opacity-70'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25 active:scale-[0.98]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Ingesting Document...</span>
                                </>
                            ) : (
                                <>
                                    <span>Start Ingestion</span>
                                    <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </>
                            )}
                        </button>

                        {status && (
                            <div className={`p-4 rounded-xl border flex items-start gap-3 animation-fade-in ${status.includes('Success')
                                    ? 'bg-green-500/10 border-green-500/20 text-green-200'
                                    : status.includes('Error')
                                        ? 'bg-red-500/10 border-red-500/20 text-red-200'
                                        : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
                                }`}>
                                <div className={`mt-0.5 ${status.includes('Success') ? 'text-green-400' : status.includes('Error') ? 'text-red-400' : 'text-blue-400'}`}>
                                    {status.includes('Success') ? '✓' : status.includes('Error') ? '⚠' : 'ℹ'}
                                </div>
                                <p className="text-sm font-medium">{status}</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animation-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
