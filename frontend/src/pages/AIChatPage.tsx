import React, { useState } from 'react';
import { analyticsAPI } from '../api/analytics';
import './AnalyticsPage.css';

type ChatRole = 'user' | 'assistant' | 'error';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

const AIChatPage: React.FC = () => {
  const [aiQuery, setAiQuery] = useState('Where did I overspend this month?');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);

  const handleAiQuery = async () => {
    const prompt = aiQuery.trim();
    if (!prompt || aiLoading) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: prompt };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiQuery('');
    setAiLoading(true);

    try {
      const response = await analyticsAPI.askAI(prompt);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer || 'No response returned.',
      };
      setAiMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'error',
          content: error?.response?.data?.error || 'Failed to get AI response. Please try again.',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>AI Chat</h1>
      <p style={{ marginBottom: '16px', color: '#4b5563' }}>
        Ask questions and get quick AI-powered insights. Replies use the same model as the floating chat.
      </p>

      <div className="card ai-panel">
        <h2>AI Financial Insights</h2>
        <div className="ai-query-section ai-chat">
          <p className="ai-description">
            Ask AI anything about your finances and get intelligent insights based on your data.
          </p>

          <div className="ai-messages">
            {aiMessages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message-row ${msg.role === 'user' ? 'ai-user-row' : 'ai-assistant-row'}`}
              >
                <div
                  className={`ai-bubble ${
                    msg.role === 'user' ? 'ai-user-bubble' : 'ai-assistant-bubble'
                  } ${msg.role === 'error' ? 'ai-error-bubble' : ''}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="ai-message-row ai-assistant-row">
                <div className="ai-bubble ai-assistant-bubble">
                  <span className="ai-typing-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="ai-query-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAiQuery();
                }
              }}
            />
            <button className="ai-send-btn" onClick={handleAiQuery} disabled={aiLoading || !aiQuery.trim()}>
              ➤
            </button>
          </div>

          <div className="ai-suggestions">
            <p><strong>Suggested Questions:</strong></p>
            <div className="suggestion-chips">
              <button
                className="suggestion-chip"
                onClick={() => setAiQuery('Where did I overspend this month?')}
              >
                Where did I overspend?
              </button>
              <button
                className="suggestion-chip"
                onClick={() => setAiQuery('Why are my expenses higher?')}
              >
                Why are expenses higher?
              </button>
              <button
                className="suggestion-chip"
                onClick={() => setAiQuery('What cost grew most?')}
              >
                What cost grew most?
              </button>
              <button
                className="suggestion-chip"
                onClick={() => setAiQuery('Give me a savings plan')}
              >
                Give me a savings plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
