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
          <div className="quick-row flex flex-wrap justify-start px-4 md:px-5">
            {promptTemplates.map((template) => (
              <button key={template} className="chip" type="button" onClick={() => handleTemplate(template)}>
                {template}
              </button>
            ))}
            {statusNote && <span className="chatgpt-subtitle">{statusNote}</span>}
          </div>

          <div className="unified-composer">
            <div className="uc-panel" role="group" aria-label="Message composer">
              <div className="uc-leading">
                <button type="button" className="uc-icon-btn" aria-label="Add files">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9.33496 16.5V10.665H3.5C3.13273 10.665 2.83496 10.3673 2.83496 10C2.83496 9.63273 3.13273 9.33496 3.5 9.33496H9.33496V3.5C9.33496 3.13273 9.63273 2.83496 10 2.83496C10.3673 2.83496 10.665 3.13273 10.665 3.5V9.33496H16.5L16.6338 9.34863C16.9369 9.41057 17.165 9.67857 17.165 10C17.165 10.3214 16.9369 10.5894 16.6338 10.6514L16.5 10.665H10.665V16.5C10.665 16.8673 10.3673 17.165 10 17.165C9.63273 17.165 9.33496 16.8673 9.33496 16.5Z" />
                  </svg>
                </button>
              </div>
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
                  rows={1}
                />
              </div>
              <div className="uc-trailing">
                <button type="button" className="uc-icon-btn" aria-label="Dictate">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M15.7806 10.1963C16.1326 10.3011 16.3336 10.6714 16.2288 11.0234L16.1487 11.2725C15.3429 13.6262 13.2236 15.3697 10.6644 15.6299L10.6653 16.835H12.0833L12.2171 16.8486C12.5202 16.9106 12.7484 17.1786 12.7484 17.5C12.7484 17.8214 12.5202 18.0894 12.2171 18.1514L12.0833 18.165H7.91632C7.5492 18.1649 7.25128 17.8672 7.25128 17.5C7.25128 17.1328 7.5492 16.8351 7.91632 16.835H9.33527L9.33429 15.6299C6.775 15.3697 4.6558 13.6262 3.84992 11.2725L3.76984 11.0234L3.74445 10.8906C3.71751 10.5825 3.91011 10.2879 4.21808 10.1963C4.52615 10.1047 4.84769 10.2466 4.99347 10.5195L5.04523 10.6436L5.10871 10.8418C5.8047 12.8745 7.73211 14.335 9.99933 14.335C12.3396 14.3349 14.3179 12.7789 14.9534 10.6436L15.0052 10.5195C15.151 10.2466 15.4725 10.1046 15.7806 10.1963ZM12.2513 5.41699C12.2513 4.17354 11.2437 3.16521 10.0003 3.16504C8.75675 3.16504 7.74835 4.17343 7.74835 5.41699V9.16699C7.74853 10.4104 8.75685 11.418 10.0003 11.418C11.2436 11.4178 12.2511 10.4103 12.2513 9.16699V5.41699ZM13.5814 9.16699C13.5812 11.1448 11.9781 12.7479 10.0003 12.748C8.02232 12.748 6.41845 11.1449 6.41828 9.16699V5.41699C6.41828 3.43889 8.02221 1.83496 10.0003 1.83496C11.9783 1.83514 13.5814 3.439 13.5814 5.41699V9.16699Z" />
                  </svg>
                </button>
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
