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
    High: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Voice Input</h3>
            <p className="text-white/40 text-xs mt-1">Dictate your task dynamically</p>
          </div>
          <button
            onClick={() => onClose?.()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!supported ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
            <p className="text-white/70 font-semibold mb-2">
              Speech Recognition Not Available
            </p>
            <p className="text-white/40 text-xs leading-relaxed">
              Your browser doesn't support the Web Speech API. Please use Chrome or Microsoft Edge.
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
                      : 'bg-indigo-600 text-white shadow-indigo-600/30'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8 animate-pulse" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              {/* Waveform animation */}
              {isRecording && (
                <div className="flex items-center gap-1 h-8">
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
                      className="w-1 h-6 bg-red-400 rounded-full origin-center"
                    />
                  ))}
                </div>
              )}

              <p className="text-white/40 text-xs font-semibold">
                {isRecording ? 'Listening... Tap mic to end dictation' : 'Tap mic to dictate task details'}
              </p>
            </div>

            {/* Transcript Area */}
            <div className="min-h-[100px] p-4 bg-white/5 rounded-2xl border border-white/8 mb-4">
              {displayText ? (
                <div>
                  <p className="text-white text-xs leading-relaxed font-semibold">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-white/40 italic">
                        {interimTranscript}
                      </span>
                    )}
                  </p>
                  {detectedPriority && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] text-white/40">Priority:</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg border ${priorityColors[detectedPriority]}`}
                      >
                        {detectedPriority}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-white/30 text-xs italic">
                  Start speaking... e.g. "Draft final slides immediately"
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
                  className="w-full py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center"
                >
                  ✓ Task registered successfully!
                </motion.div>
              ) : (
                <motion.button
                  key="add"
                  onClick={handleAddTask}
                  disabled={!transcript.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Register Task
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
