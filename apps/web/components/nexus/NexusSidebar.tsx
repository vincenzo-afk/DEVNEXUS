'use client';
import { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NexusSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 glass-card rounded-r-none border-r-0 p-2 flex flex-col items-center gap-2 hover:w-12 transition-all ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
        style={{ zIndex: 40 }}
      >
        <Bot size={20} className="text-primary" />
        <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-widest text-primary rotate-180">NEXUS</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
            className="w-80 h-full border-l border-border glass flex flex-col absolute right-0 top-0 shadow-2xl"
            style={{ zIndex: 45 }}
          >
            <div className="h-14 border-b border-border flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-glow-sm relative">
                  🤖
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-background"></span>
                </div>
                <span className="font-bold">NEXUS AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="chat-bubble-nexus">
                Hello! I'm NEXUS, your AI developer assistant. How can I help you today?
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                <button className="badge-primary whitespace-nowrap text-xs cursor-pointer">Summarize week</button>
                <button className="badge-primary whitespace-nowrap text-xs cursor-pointer">Add TODO</button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask NEXUS..." 
                  className="w-full bg-input rounded-full pl-4 pr-10 py-2 text-sm border border-border focus:border-primary focus:outline-none transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Send size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
