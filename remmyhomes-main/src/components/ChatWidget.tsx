import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  text: string;
  isUser: boolean;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! How can we help you today?", isUser: false }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Thanks for your message! Our support team will reply shortly. You can also reach us on WhatsApp: +254 769 353 430", 
        isUser: false 
      }]);
    }, 1000);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-4 bg-primary text-primary-foreground p-3 rounded-full shadow-2xl z-50 font-bold flex items-center gap-2"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        {!isOpen && <span className="text-sm">Chat</span>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed right-4 bottom-20 w-80 bg-card-light rounded-lg shadow-2xl z-50 overflow-hidden"
          >
            <div className="bg-background text-primary p-3 font-bold">
              Support Chat
            </div>
            
            <div className="p-3 max-h-64 overflow-y-auto space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl text-sm ${
                    msg.isUser 
                      ? 'bg-primary/20 text-card-light-foreground ml-auto max-w-[80%]' 
                      : 'bg-card-light-foreground/10 text-card-light-foreground max-w-[80%]'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-card-light-foreground/10 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
              />
              <Button 
                size="icon" 
                onClick={sendMessage}
                className="bg-primary text-primary-foreground hover:bg-secondary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
