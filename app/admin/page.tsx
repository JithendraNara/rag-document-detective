'use client';

import Link from 'next/link';

export default function AdminPage() {
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
                            <p>Add documents using the Python ingestion script</p>
                        </div>
                    </div>

                    <div className="instructions">
                        <div className="instruction-step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Add your PDF files</h3>
                                <p>Place your PDF documents in the <code>documents/</code> folder</p>
                            </div>
                        </div>

                        <div className="instruction-step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Set up environment</h3>
                                <p>Create a <code>.env</code> file with your API keys:</p>
                                <pre>{`OPENAI_API_KEY=your_key
PINECONE_API_KEY=your_key`}</pre>
                            </div>
                        </div>

                        <div className="instruction-step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Run the ingestion script</h3>
                                <p>Execute the Python script to process your PDFs:</p>
                                <pre>{`pip install -r requirements.txt
python ingest.py`}</pre>
                            </div>
                        </div>

                        <div className="instruction-step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3>Start chatting!</h3>
                                <p>Your documents are now indexed. Go back to the chat and ask questions.</p>
                            </div>
                        </div>
                    </div>

                    <div className="note">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>PDF parsing in serverless environments has limitations. The Python script provides reliable document processing.</span>
                    </div>
                </div>
            </main>

            <style jsx>{`
                .instructions {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                
                .instruction-step {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }
                
                .step-number {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.875rem;
                    flex-shrink: 0;
                }
                
                .step-content {
                    flex: 1;
                }
                
                .step-content h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    color: white;
                }
                
                .step-content p {
                    font-size: 0.875rem;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 0.5rem;
                }
                
                .step-content code {
                    background: rgba(99, 102, 241, 0.2);
                    padding: 0.125rem 0.375rem;
                    border-radius: 4px;
                    font-family: var(--font-geist-mono), monospace;
                    font-size: 0.8125rem;
                    color: #a5b4fc;
                }
                
                .step-content pre {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    font-family: var(--font-geist-mono), monospace;
                    font-size: 0.8125rem;
                    color: #a5b4fc;
                    overflow-x: auto;
                    margin-top: 0.5rem;
                }
                
                .note {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: rgba(251, 191, 36, 0.1);
                    border: 1px solid rgba(251, 191, 36, 0.2);
                    border-radius: 10px;
                    color: #fcd34d;
                    font-size: 0.8125rem;
                }
                
                .note svg {
                    flex-shrink: 0;
                    margin-top: 0.125rem;
                }
            `}</style>
        </div>
    );
}
