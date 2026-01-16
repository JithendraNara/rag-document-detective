'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

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

            setStatus(`Success! Ingested ${data.chunks} chunks from "${file.name}"`);
            setFile(null);
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setStatus('');
            }
        }
    };

    return (
        <div className="admin-container">
            {/* Header */}
            <header className="admin-header">
                <Link href="/" className="back-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    <span>Back to Chat</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div className="admin-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                <line x1="12" y1="6" x2="16" y2="6" />
                                <line x1="12" y1="10" x2="16" y2="10" />
                                <line x1="8" y1="6" x2="8.01" y2="6" />
                                <line x1="8" y1="10" x2="8.01" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <h1>Knowledge Base</h1>
                            <p>Upload PDF documents to train your AI assistant</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpload} className="upload-form">
                        {/* Password Input */}
                        <div className="form-group">
                            <label htmlFor="password">Admin Password</label>
                            <div className="input-wrapper">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your admin password"
                                />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="form-group">
                            <label>PDF Document</label>
                            <div
                                className={`dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        setFile(e.target.files?.[0] || null);
                                        setStatus('');
                                    }}
                                    className="file-input"
                                />
                                {file ? (
                                    <div className="file-preview">
                                        <div className="file-icon success">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                        <div className="file-info">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="remove-file"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="dropzone-content">
                                        <div className="upload-icon">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                        </div>
                                        <span className="dropzone-text">Drop your PDF here or <strong>browse</strong></span>
                                        <span className="dropzone-hint">PDF files up to 10MB</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !file || !password}
                            className="submit-button"
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                    </svg>
                                    <span>Start Ingestion</span>
                                </>
                            )}
                        </button>

                        {/* Status Message */}
                        {status && (
                            <div className={`status-message ${status.includes('Success') ? 'success' : status.includes('Error') ? 'error' : 'info'}`}>
                                {status.includes('Success') ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                ) : status.includes('Error') ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="16" x2="12" y2="12" />
                                        <line x1="12" y1="8" x2="12.01" y2="8" />
                                    </svg>
                                )}
                                <span>{status}</span>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
}
