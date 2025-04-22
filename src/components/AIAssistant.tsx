import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot, X, MessageSquare, Search, Mic, Send, Sparkles,
  ChevronRight, PlusSquare, MapPin, LayoutDashboard, Star
} from 'lucide-react';

interface Suggestion {
  id: string;
  text: string;
  icon: typeof MapPin;
  action: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions: Suggestion[] = [
    {
      id: 'create-campaign',
      text: 'Crear nueva campaña',
      icon: PlusSquare,
      action: () => navigate('/create')
    },
    {
      id: 'find-screens',
      text: 'Buscar pantallas en Medellín',
      icon: MapPin,
      action: () => navigate('/marketplace')
    },
    {
      id: 'view-analytics',
      text: 'Ver mis estadísticas',
      icon: LayoutDashboard,
      action: () => navigate('/analytics')
    }
  ];

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'buenos días' : hour < 18 ? 'buenas tardes' : 'buenas noches';
    
    switch (location.pathname) {
      case '/':
        return `¡Hola! ${timeOfDay}. ¿Necesitas ayuda para encontrar la pantalla perfecta?`;
      case '/create':
        return '¿Necesitas ayuda para crear tu campaña?';
      case '/marketplace':
        return '¿Buscas una ubicación específica para tu anuncio?';
      default:
        return `¡Hola! ${timeOfDay}. ¿En qué puedo ayudarte?`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Entiendo lo que buscas. Déjame ayudarte con eso...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-40 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#ABFAA9] rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative flex items-center gap-3 px-6 py-4 bg-[#0B0B16] rounded-2xl border border-[#ABFAA9]/20 hover:border-[#ABFAA9]/40 transition-colors">
              <div className="w-10 h-10 bg-[#ABFAA9]/10 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#ABFAA9]" />
              </div>
              <div className="pr-2">
                <p className="text-[#ABFAA9] font-medium">Asistente IA</p>
                <p className="text-white/60 text-sm">¿Necesitas ayuda?</p>
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-[#ABFAA9] rounded-full"
              />
            </div>
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="w-full md:w-[500px] h-[85vh] md:h-[750px] bg-[#0B0B16] rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden border border-[#ABFAA9]/20"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ABFAA9]/10 rounded-xl flex items-center justify-center">
                      <Bot className="w-5 h-5 text-[#ABFAA9]" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-white">Asistente IA</h2>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ABFAA9] rounded-full" />
                        <p className="text-sm text-[#ABFAA9]">En línea</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 h-[calc(85vh-180px)] md:h-[calc(750px-180px)]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                      className="w-16 h-16 bg-[#ABFAA9]/10 rounded-2xl flex items-center justify-center mb-6"
                    >
                      <Sparkles className="w-8 h-8 text-[#ABFAA9]" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      ¡Hola! Soy tu asistente
                    </h3>
                    <p className="text-white/60 mb-8 max-w-sm">
                      Estoy aquí para ayudarte a encontrar las mejores pantallas y crear campañas increíbles
                    </p>
                    
                    <div className="w-full space-y-3">
                      {suggestions.map((suggestion) => (
                        <motion.button
                          key={suggestion.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={suggestion.action}
                          className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left group"
                        >
                          <div className="w-10 h-10 bg-[#ABFAA9]/10 rounded-lg flex items-center justify-center group-hover:bg-[#ABFAA9]/20 transition-colors">
                            <suggestion.icon className="w-5 h-5 text-[#ABFAA9]" />
                          </div>
                          <span className="flex-1 text-white group-hover:text-[#ABFAA9] transition-colors">
                            {suggestion.text}
                          </span>
                          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#ABFAA9] transition-colors" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`
                          max-w-[80%] rounded-2xl px-4 py-3
                          ${message.type === 'user'
                            ? 'bg-[#ABFAA9] text-[#0B0B16]'
                            : 'bg-white/10 text-white'
                          }
                        `}>
                          {message.content}
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.5, 1]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-2 h-2 bg-[#ABFAA9] rounded-full"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.5, 1]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.2
                            }}
                            className="w-2 h-2 bg-[#ABFAA9] rounded-full"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.5, 1]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.4
                            }}
                            className="w-2 h-2 bg-[#ABFAA9] rounded-full"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/10 bg-[#0B0B16]">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu mensaje..."
                      className="w-full pl-4 pr-12 py-3 bg-white/5 border-none rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#ABFAA9] text-white placeholder:text-white/40 min-h-[44px] max-h-[120px]"
                      rows={1}
                    />
                    <button
                      onClick={() => {/* Handle voice input */}}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Mic className="w-5 h-5 text-white/40" />
                    </button>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3 bg-[#ABFAA9] text-[#0B0B16] rounded-xl hover:bg-[#9AE998] disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}