import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import styles from './ChatBubble.module.css';

type ChatRole = 'user' | 'assistant';

export interface ChatBubbleProps {
  accentColor?: string;
  bubbleOffsets?: {
    bottom?: number;
    right?: number;
  };
  panelWidth?: number;
  panelHeight?: number;
  systemPrompt?: string;
}

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  isError?: boolean;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      role: ChatRole | 'system';
      content?: string;
    };
  }>;
}

// Usage:
// - Set REACT_APP_OPENAI_API_KEY or REACT_APP_GEMINI_API_KEY in your .env, rebuild CRA after changes.
// - Adjust ACCENT_COLOR, BUBBLE_OFFSETS, PANEL_WIDTH, PANEL_HEIGHT, and SYSTEM_PROMPT below
//   or override via component props.
// - Add to App.tsx: import ChatBubble from './components/ChatBubble'; then render <ChatBubble />.
// Security note: In production, proxy this request server-side to avoid exposing your API key.

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const DEFAULT_ACCENT_COLOR = '#4f46e5';
const DEFAULT_BUBBLE_OFFSETS = { bottom: 20, right: 20 };
const DEFAULT_PANEL_WIDTH = 360;
const DEFAULT_PANEL_HEIGHT = 520;
const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful assistant for InsightLedger. Be concise and focus on product-related support.';

type Provider = 'openai' | 'gemini';
const GEMINI_MODEL = 'gemini-1.5-flash-latest';

const ChatBubble: React.FC<ChatBubbleProps> = ({
  accentColor = DEFAULT_ACCENT_COLOR,
  bubbleOffsets = DEFAULT_BUBBLE_OFFSETS,
  panelWidth = DEFAULT_PANEL_WIDTH,
  panelHeight = DEFAULT_PANEL_HEIGHT,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const resolvedOffsets = useMemo(
    () => ({
      bottom: bubbleOffsets.bottom ?? DEFAULT_BUBBLE_OFFSETS.bottom,
      right: bubbleOffsets.right ?? DEFAULT_BUBBLE_OFFSETS.right,
    }),
    [bubbleOffsets],
  );

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
      adjustTextareaHeight();
    }
  }, [isOpen]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const maxHeight = 120; // ~3 lines
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const callOpenAI = async (history: ChatMessage[], prompt: string) => {
    const response = await axios.post<ChatCompletionResponse>(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map((msg) => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY?.trim()}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return (
      response.data?.choices?.[0]?.message?.content?.trim() ||
      'Sorry, I could not generate a response.'
    );
  };

  const callGemini = async (history: ChatMessage[], prompt: string) => {
    interface GeminiResponse {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    }

    const geminiHistory = [
      ...history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      { role: 'user', parts: [{ text: prompt }] },
    ];

    const response = await axios.post<GeminiResponse>(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY?.trim()}`,
      {
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemPrompt }],
        },
        contents: geminiHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'Sorry, I could not generate a response.'
    );
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    const provider: Provider | null = OPENAI_API_KEY?.trim()
      ? 'openai'
      : GEMINI_API_KEY?.trim()
      ? 'gemini'
      : null;

    if (!provider) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'API key missing. Set REACT_APP_OPENAI_API_KEY or REACT_APP_GEMINI_API_KEY in your .env and rebuild.',
          isError: true,
        },
      ]);
      setIsSending(false);
      return;
    }

    try {
      const history = [...messages, userMessage].filter((msg) => !msg.isError);
      let assistantText = 'Sorry, I could not generate a response.';

      if (provider === 'openai') {
        try {
          assistantText = await callOpenAI(history, trimmed);
        } catch (error) {
          console.error('OpenAI chat error', error);
          if (GEMINI_API_KEY?.trim()) {
            assistantText = await callGemini(history, trimmed);
          } else {
            throw error;
          }
        }
      } else if (provider === 'gemini') {
        assistantText = await callGemini(history, trimmed);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('OpenAI chat error', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          isError: true,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const closePanel = () => setIsOpen(false);

  const containerStyle: React.CSSProperties = {
    bottom: resolvedOffsets.bottom,
    right: resolvedOffsets.right,
    ['--accent-color' as string]: accentColor,
  };

  const panelStyle: React.CSSProperties = {
    width: panelWidth,
    height: panelHeight,
  };

  return (
    <div className={styles.chatContainer} style={containerStyle}>
      <div
        className={`${styles.chatPanel} ${isOpen ? styles.open : ''}`}
        style={panelStyle}
        aria-hidden={!isOpen}
      >
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Chat with OpenAI</div>
            <div className={styles.subtitle}>Ask questions or get quick help</div>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={closePanel}
            aria-label="Close chat panel"
          >
            ✕
          </button>
        </div>

        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                msg.role === 'user' ? styles.userRow : styles.assistantRow
              }`}
            >
              <div
                className={`${styles.messageBubble} ${
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                } ${msg.isError ? styles.errorBubble : ''}`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className={`${styles.messageRow} ${styles.assistantRow}`}>
              <div className={`${styles.messageBubble} ${styles.assistantBubble}`}>
                <span className={styles.typingDots}>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.footer}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Type a message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            aria-label="Chat message input"
            rows={1}
            disabled={isSending}
          />
          <button
            type="button"
            className={styles.sendButton}
            onClick={handleSend}
            disabled={isSending || !input.trim()}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>

      <button
        type="button"
        className={styles.chatButton}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        💬
      </button>
    </div>
  );
};

export default ChatBubble;
