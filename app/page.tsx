'use client';

import { useState, FormEvent } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages([...newMessages, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // The AI SDK v6 toTextStreamResponse() returns plain text chunks
          assistantMessage.content += chunk;
          setMessages([...newMessages, { ...assistantMessage }]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.',
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>📄 Private Doc Detective</h1>
      </header>

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-emoji">🔍</div>
              <p>Ask a question about your PDF document</p>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`message ${m.role}`}>
              <p className="message-role">{m.role}</p>
              <p>{m.content}</p>
            </div>
          ))}
        </div>

        <div className="input-container">
          <form onSubmit={handleSubmit} className="input-form">
            <input
              className="input-field"
              value={input}
              placeholder="Ask a question about your PDF..."
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
