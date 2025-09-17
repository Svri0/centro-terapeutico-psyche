import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy el asistente virtual de Dentro de Psyché. ¿En qué puedo ayudarte hoy?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "¿Cómo agendar una cita?",
    "¿Qué servicios ofrecen?",
    "¿Aceptan mi isapre?",
    "¿Dónde están ubicados?",
    "¿Cuáles son los precios?"
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userText: string): string => {
    const text = userText.toLowerCase();
    
    if (text.includes('cita') || text.includes('agendar') || text.includes('hora')) {
      return "Para agendar una cita, puedes completar el formulario en nuestra página o contactarnos directamente. Te responderemos en las próximas 24 horas. ¿Te gustaría que te ayude con algo más?";
    }
    
    if (text.includes('servicio') || text.includes('terapia') || text.includes('consulta')) {
      return "Ofrecemos consultas psicológicas, terapias individuales y grupales, evaluaciones psicológicas, y talleres especializados. Nuestro equipo está capacitado para atender niños, adolescentes, adultos y familias. ¿Hay algún servicio específico que te interese?";
    }
    
    if (text.includes('isapre') || text.includes('fonasa') || text.includes('previsión')) {
      return "Sí, trabajamos con las principales isapres (Banmédica, Colmena, Consalud, Cruz Blanca, Vida Tres, Más Vida) y Fonasa. Puedes verificar la cobertura directamente con tu previsión. ¿Necesitas ayuda con algún trámite específico?";
    }
    
    if (text.includes('ubicación') || text.includes('dirección') || text.includes('dónde')) {
      return "Estamos ubicados en [Dirección del centro]. Puedes encontrarnos fácilmente y contamos con estacionamiento disponible. ¿Te gustaría que te envíe la ubicación exacta?";
    }
    
    if (text.includes('precio') || text.includes('costo') || text.includes('valor')) {
      return "Los precios varían según el tipo de servicio y tu previsión. Te recomendamos contactarnos directamente para obtener información detallada sobre costos y cobertura. ¿Te gustaría que te contactemos?";
    }
    
    if (text.includes('horario') || text.includes('horarios') || text.includes('cuándo')) {
      return "Nuestros horarios de atención son de lunes a viernes de 8:00 a 20:00 hrs y sábados de 9:00 a 14:00 hrs. También ofrecemos atención online para mayor comodidad. ¿Prefieres atención presencial u online?";
    }
    
    return "Gracias por tu consulta. Para brindarte información más específica, te recomiendo contactarnos directamente. Nuestro equipo estará encantado de ayudarte. ¿Hay algo más en lo que pueda asistirte?";
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
      >
        {isOpen ? (
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-amber-600 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                  <img 
                    src="/psychebot.png" 
                    alt="PsycheBot" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Asistente Virtual</h3>
                  <p className="text-xs text-amber-100">Centro Terapéutico Integral</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.isUser
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString('es-CL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Respuestas rápidas */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Respuestas rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-100 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isTyping}
                className="w-10 h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
