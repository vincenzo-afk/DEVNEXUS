'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Plus, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onClose?: () => void;
  onAddTask?: (title: string, priority: 'High' | 'Medium' | 'Low') => void;
}

function extractPriority(text: string): 'High' | 'Medium' | 'Low' {
  const lower = text.toLowerCase();
  if (/urgent|critical|asap|immediately|now|emergency/.test(lower)) return 'High';
  if (/soon|shortly|quickly|next/.test(lower)) return 'Medium';
  return 'Low';
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceInput({ onClose, onAddTask }: VoiceInputProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [taskAdded, setTaskAdded] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = transcript;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.abort();
    };
  }, [transcript]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleAddTask = () => {
    const text = transcript.trim();
    if (!text) return;
    const priority = extractPriority(text);
    onAddTask?.(text, priority);
    setTaskAdded(true);
    setTimeout(() => {
      setTaskAdded(false);
      setTranscript('');
    }, 1500);
  };

  const displayText = transcript + interimTranscript;
  const detectedPriority = displayText ? extractPriority(displayText) : null;

  const priorityColors = {
    High: 'text-red-400 bg-red-500/10 border-red-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Low: 'text-green-400 bg-green-500/10 border-green-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Voice Input</h3>
            <p className="text-[var(--text-tertiary)] text-sm mt-1">Speak your task aloud</p>
          </div>
          <button
            onClick={() => onClose?.()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!supported ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] font-semibold mb-2">
              Speech Recognition Not Available
            </p>
            <p className="text-[var(--text-tertiary)] text-sm">
              Your browser doesn't support the Web Speech API. Try Chrome or Edge.
            </p>
          </div>
        ) : (
          <>
            {/* Mic button */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="relative">
                {isRecording && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-red-500"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.7, 1], opacity: [0.2, 0, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      className="absolute inset-0 rounded-full bg-red-500"
                    />
                  </>
                )}
                <button
                  onClick={toggleRecording}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isRecording
                      ? 'bg-red-500 text-white shadow-red-500/30'
                      : 'bg-[var(--accent-primary)] text-white shadow-[var(--accent-primary)]/30'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* Waveform animation */}
              {isRecording && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scaleY: [0.3, 1, 0.3],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.08,
                      }}
                      className="w-1 h-8 bg-red-400 rounded-full origin-center"
                    />
                  ))}
                </div>
              )}

              <p className="text-[var(--text-tertiary)] text-sm font-medium">
                {isRecording ? 'Listening... tap to stop' : 'Tap to start recording'}
              </p>
            </div>

            {/* Transcript */}
            <div className="min-h-[100px] p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] mb-4">
              {displayText ? (
                <div>
                  <p className="text-[var(--text-primary)] text-sm leading-relaxed">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-[var(--text-tertiary)] italic">
                        {interimTranscript}
                      </span>
                    )}
                  </p>
                  {detectedPriority && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-[var(--text-tertiary)]">Detected priority:</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${priorityColors[detectedPriority]}`}
                      >
                        {detectedPriority === 'High' ? '🔴' : detectedPriority === 'Medium' ? '🟡' : '🟢'} {detectedPriority}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[var(--text-tertiary)] text-sm italic">
                  Your speech will appear here...
                </p>
              )}
            </div>

            {/* Add task button */}
            <AnimatePresence mode="wait">
              {taskAdded ? (
                <motion.div
                  key="added"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="w-full py-3 rounded-2xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold text-center"
                >
                  ✅ Task added successfully!
                </motion.div>
              ) : (
                <motion.button
                  key="add"
                  onClick={handleAddTask}
                  disabled={!transcript.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--accent-primary)]/90"
                >
                  <Plus className="w-4 h-4" />
                  Add to TODO List
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
