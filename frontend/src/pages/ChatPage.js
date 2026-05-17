import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Globe, ThumbsUp, ThumbsDown, Loader, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const sessionId = uuidv4();

const SUGGESTED_QUESTIONS = {
  en: [
    'What are your business hours?',
    'How do I reset my password?',
    'What is your refund policy?',
    'How can I contact support?'
  ],
  hi: [
    'आपके व्यापार के घंटे क्या हैं?',
    'मैं अपना पासवर्ड कैसे रीसेट करूं?',
    'आपकी वापसी नीति क्या है?',
    'मैं सहायता से कैसे संपर्क करूं?'
  ]
};

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [queryId, setQueryId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    const question = text.trim();
    setInput('');

    const userMsg = { id: uuidv4(), role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post('/chat/query', { question, sessionId, language });
      const { answer, sources, queryId: qId } = res.data;
      setQueryId(qId);
      const botMsg = {
        id: uuidv4(),
        role: 'assistant',
        content: answer,
        sources: sources || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to get answer');
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: language === 'hi'
          ? 'माफ़ करें, कुछ गलत हो गया। कृपया फिर से प्रयास करें।'
          : 'Sorry, something went wrong. Please try again.',
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful) => {
    if (!queryId) return;
    try {
      await axios.post(`/chat/feedback/${queryId}`, { helpful, rating: helpful ? 5 : 2 });
      toast.success('Thank you for your feedback!');
    } catch {}
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <Bot size={22} className="bot-icon" />
          <div>
            <h1 className="chat-title">Knowledge Assistant</h1>
            <p className="chat-subtitle">Powered by RAG • Ask anything about our products</p>
          </div>
        </div>
        <button
          className={`lang-toggle ${language === 'hi' ? 'hi' : ''}`}
          onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
          title="Switch language"
        >
          <Globe size={16} />
          <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <Sparkles size={40} />
            </div>
            <h2>{language === 'hi' ? 'नमस्ते! मैं आपका AI सहायक हूं' : 'Hello! I\'m your AI Knowledge Assistant'}</h2>
            <p>{language === 'hi'
              ? 'हमारे नॉलेज बेस से कोई भी सवाल पूछें'
              : 'Ask me anything from our knowledge base'}</p>
            <div className="suggestions">
              {SUGGESTED_QUESTIONS[language].map((q, i) => (
                <button key={i} className="suggestion-btn" onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-body">
              <div className="message-content">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.sources?.length > 0 && (
                <div className="sources">
                  <p className="sources-label">📚 Sources:</p>
                  {msg.sources.map((s, i) => (
                    <div key={i} className="source-item">
                      <span className="source-title">{s.title}</span>
                      <span className="source-score">{s.relevanceScore}% match</span>
                    </div>
                  ))}
                </div>
              )}
              {msg.role === 'assistant' && messages.indexOf(msg) === messages.length - 1 && (
                <div className="feedback-row">
                  <span>Was this helpful?</span>
                  <button onClick={() => handleFeedback(true)} className="feedback-btn good"><ThumbsUp size={14} /></button>
                  <button onClick={() => handleFeedback(false)} className="feedback-btn bad"><ThumbsDown size={14} /></button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="message-avatar"><Bot size={16} /></div>
            <div className="message-body">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="input-wrapper">
          <textarea
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={language === 'hi' ? 'अपना प्रश्न यहाँ टाइप करें...' : 'Type your question here...'}
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? <Loader size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="input-hint">Press Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  );
}
