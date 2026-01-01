import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ChatWidget = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMsg = i18n.language === 'fr'
        ? "Bonjour ! Je suis l'assistant virtuel d'Auto Discount Location. Comment puis-je vous aider aujourd'hui ?"
        : "Hello! I'm the Auto Discount Location virtual assistant. How can I help you today?";
      
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: welcomeMsg,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (isAuthenticated) {
        const response = await axios.post(`${API}/chat/message`, {
          message: input,
          session_id: sessionId
        });

        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString()
        }]);
      } else {
        // Basic responses for non-authenticated users
        const defaultResponse = i18n.language === 'fr'
          ? "Pour une assistance personnalisée, veuillez vous connecter à votre compte. En attendant, consultez notre FAQ ou contactez-nous au +590 590 XX XX XX."
          : "For personalized assistance, please log in to your account. In the meantime, check our FAQ or contact us at +590 590 XX XX XX.";

        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: defaultResponse,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = i18n.language === 'fr'
        ? "Désolé, je rencontre un problème technique. Veuillez réessayer ou contacter notre équipe."
        : "Sorry, I'm experiencing a technical issue. Please try again or contact our team.";

      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg btn-primary z-50"
        data-testid="chat-widget-trigger"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'w-72 h-14' : 'w-96 h-[500px]'
      }`}
      data-testid="chat-widget"
    >
      {/* Header */}
      <div className="bg-[#3D3A6B] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-medium">{t('chat.ai_assistant')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
            data-testid="chat-close-btn"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-[380px] p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-[#3D3A6B] flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#F5A623] text-black'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="h-8 w-8 rounded-full bg-[#3D3A6B] flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-slate-100 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-slate-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chat.placeholder')}
                disabled={loading}
                className="flex-1"
                data-testid="chat-input"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || loading}
                className="btn-primary"
                data-testid="chat-send-btn"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
