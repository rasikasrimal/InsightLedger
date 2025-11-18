import React, { useMemo, useState } from 'react';
import { analyticsAPI } from '../api/analytics';
import './AIChatPage.css';

type ChatRole = 'user' | 'assistant' | 'error';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  model?: string;
}

const promptTemplates = [
  'Give me a concise summary of my finances this month.',
  'Where did I overspend this week?',
  'List the top 3 categories causing variance.',
  'Suggest a quick savings plan for the next 30 days.',
];

const AIChatPage: React.FC = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const lastAssistantMessage = useMemo(
    () => [...aiMessages].reverse().find((msg) => msg.role === 'assistant'),
    [aiMessages]
  );

  const handleAiQuery = async () => {
    const prompt = aiQuery.trim();
    if (!prompt || aiLoading) return;

    const timestamp = new Date().toISOString();
    const userMessage: ChatMessage = { id: `user-${timestamp}`, role: 'user', content: prompt, timestamp };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiQuery('');
    setAiLoading(true);
    setStatusNote(null);

    try {
      const response = await analyticsAPI.askAI(prompt);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer || 'No response returned.',
        timestamp: new Date().toISOString(),
        model: 'Insight Model',
      };
      setAiMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'error',
          content: error?.response?.data?.error || 'Failed to get AI response. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTemplate = (value: string) => {
    setAiQuery(value);
    setStatusNote(null);
  };

  const handleClear = () => {
    setAiMessages([]);
    setAiQuery('');
    setStatusNote(null);
  };

  const handleCopyLastReply = async () => {
    if (!lastAssistantMessage) {
      setStatusNote('No reply to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(lastAssistantMessage.content);
      setStatusNote('Copied last reply.');
    } catch (error) {
      setStatusNote('Clipboard unavailable.');
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="chatgpt-page">
      <div className="chatgpt-shell">
        <main className="chatgpt-main">
          <div className="message-feed">
            {aiMessages.map((msg) => {
              const initials = msg.role === 'assistant' ? 'AI' : msg.role === 'user' ? 'You' : '!';
              const metaPieces = [];
              if (msg.role === 'assistant' && msg.model) metaPieces.push(msg.model);
              metaPieces.push(formatTime(msg.timestamp));

              return (
                <div key={msg.id} className="message">
                  <div className={`avatar ${msg.role === 'assistant' ? 'avatar-assistant' : 'avatar-user'}`}>
                    {initials}
                  </div>
                  <div
                    className={`bubble ${
                      msg.role === 'user' ? 'bubble-user' : msg.role === 'assistant' ? 'bubble-assistant' : 'bubble-error'
                    }`}
                  >
                    <div className="bubble-meta">{metaPieces.join(' | ')}</div>
                    <div className="bubble-content">{msg.content}</div>
                  </div>
                </div>
              );
            })}

            {aiLoading && (
              <div className="message">
                <div className="avatar avatar-assistant">AI</div>
                <div className="bubble bubble-assistant">
                  <span className="typing" aria-label="Model typing">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="composer-bar">
        <div className="composer-shell">
          <div className="quick-row">
            {promptTemplates.map((template) => (
              <button key={template} className="chip" type="button" onClick={() => handleTemplate(template)}>
                {template}
              </button>
            ))}
            {statusNote && <span className="chatgpt-subtitle">{statusNote}</span>}
          </div>

          <div className="unified-composer">
            <div className="uc-panel" role="group" aria-label="Message composer">
              <div className="uc-input">
                <textarea
                  placeholder="Ask anything"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiQuery();
                    }
                  }}
                  aria-label="Message text"
                />
              </div>
              <div className="uc-actions">
                <button
                  type="button"
                  className="send-button"
                  aria-label="Send"
                  onClick={handleAiQuery}
                  disabled={aiLoading || !aiQuery.trim()}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 16V6.414L5.707 9.707C5.316 10.098 4.683 10.098 4.293 9.707C3.902 9.317 3.902 8.684 4.293 8.293L9.293 3.293L9.369 3.225C9.762 2.904 10.341 2.927 10.707 3.293L15.707 8.293L15.775 8.369C16.096 8.762 16.073 9.341 15.707 9.707C15.341 10.073 14.762 10.096 14.369 9.775L14.293 9.707L11 6.414V16C11 16.552 10.552 17 10 17C9.448 17 9 16.552 9 16Z"
                      fill="#ffffff"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;
