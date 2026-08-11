"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Sparkles, MessageSquareText, ArrowRight, Play, Square } from "lucide-react";
import { useRouter } from "next/navigation";

// Extend window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const INTERVIEW_QUESTIONS = [
  "Hello! I'm your AI Interviewer. I've reviewed your resume. To start off, can you tell me a little bit about yourself and your background?",
  "Can you elaborate on how you optimized the checkout flow to reduce latency by 40%?",
  "What challenges did you face while architecting the REST APIs using FastAPI?",
  "Tell me about a time you spearheaded a cross-functional team and faced resistance. How did you handle it?",
  "That concludes our mock interview. Thank you for your time!"
];

export default function InterviewSessionPage() {
  const router = useRouter();
  
  // Controls state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  
  // Interview flow state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveUserText, setLiveUserText] = useState("");
  const [transcript, setTranscript] = useState<{sender: 'ai' | 'user', text: string}[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const finalTranscriptRef = useRef("");

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          
          setLiveUserText((finalTranscriptRef.current + " " + interimTranscript).trim());
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          // If we are still supposed to be listening and haven't muted, restart
          if (isListening && !isMuted && sessionActive) {
             try {
                recognitionRef.current.start();
             } catch(e) {}
          } else {
             setIsListening(false);
          }
        };
      } else {
        console.warn("Web Speech API not supported in this browser.");
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, liveUserText]);

  // Handle muting
  useEffect(() => {
    if (isMuted && isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else if (!isMuted && !isAiSpeaking && hasStarted && sessionActive && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {}
    }
  }, [isMuted]);

  const speakQuestion = (index: number) => {
    if (!sessionActive) return;
    
    // Stop any current listening or speaking
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    window.speechSynthesis.cancel();

    const text = INTERVIEW_QUESTIONS[index];
    setTranscript(prev => [...prev, { sender: 'ai', text }]);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for natural feel
    
    utterance.onstart = () => setIsAiSpeaking(true);
    
    utterance.onend = () => {
      setIsAiSpeaking(false);
      // Automatically start listening after AI finishes (if not the last question and not muted)
      if (index < INTERVIEW_QUESTIONS.length - 1 && !isMuted && recognitionRef.current) {
        setLiveUserText("");
        finalTranscriptRef.current = "";
        try {
           recognitionRef.current.start();
           setIsListening(true);
        } catch (e) {}
      } else if (index === INTERVIEW_QUESTIONS.length - 1) {
        // End of interview
        setTimeout(() => handleEndCall(), 3000);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    setHasStarted(true);
    speakQuestion(0);
  };

  const handleNextQuestion = () => {
    // Save current user answer to transcript
    if (liveUserText.trim()) {
      setTranscript(prev => [...prev, { sender: 'user', text: liveUserText }]);
      setLiveUserText("");
      finalTranscriptRef.current = "";
    } else if (isListening) {
      setTranscript(prev => [...prev, { sender: 'user', text: "[No verbal response]" }]);
    }
    
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < INTERVIEW_QUESTIONS.length) {
      setCurrentQuestionIndex(nextIndex);
      speakQuestion(nextIndex);
    }
  };

  const handleEndCall = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    
    // Save transcript to generate feedback
    if (transcript.length > 0) {
      sessionStorage.setItem("interviewTranscript", JSON.stringify(transcript));
    }
    
    setSessionActive(false);
    setTimeout(() => {
      router.push("/dashboard/interview/feedback");
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Mock Interview Session <Sparkles className="w-5 h-5 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm">Interactive Voice Evaluation</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sessionActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${sessionActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-sm font-medium text-white/70">{sessionActive ? "Live" : "Ended"}</span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 relative min-h-0">
        
        {/* Left Column: Video Feeds */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* AI Interviewer Video */}
          <div className="flex-1 relative rounded-3xl glass-card border border-white/10 overflow-hidden flex items-center justify-center bg-black/40 min-h-[300px]">
            {!hasStarted ? (
              <div className="flex flex-col items-center gap-6 relative z-10">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <button 
                  onClick={startInterview}
                  className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:-translate-y-0.5 transition-all shadow-lg flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" /> Begin Interview
                </button>
                <p className="text-sm text-muted-foreground max-w-sm text-center">
                  Ensure your microphone is connected and volume is turned up. The AI will ask questions out loud.
                </p>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {isAiSpeaking && sessionActive && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                      className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isAiSpeaking ? 'bg-primary/20 border-2 border-primary/50 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'bg-white/5 border border-white/10'}`}>
                    <Sparkles className={`w-12 h-12 ${isAiSpeaking ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <p className="text-lg font-medium text-white tracking-wide">AI Interviewer</p>
                </div>
                
                {/* Status Label */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  {isAiSpeaking && sessionActive ? (
                    <>
                      <div className="flex items-end gap-0.5 h-3">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-green-400 rounded-full" />
                        <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-green-400 rounded-full" />
                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-green-400 rounded-full" />
                      </div>
                      <span className="text-xs font-medium text-white">Speaking</span>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">Listening</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Video Placeholder */}
          <div className="h-48 relative rounded-3xl glass-card border border-white/10 overflow-hidden flex items-center justify-center bg-black/60 shrink-0">
            {isVideoOff ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <VideoOff className="w-10 h-10" />
                <span className="text-sm">Camera Off</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/80">
                <User className="w-12 h-12" />
                <span className="text-sm font-medium">You</span>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-2">
              {isMuted ? (
                <MicOff className="w-3.5 h-3.5 text-red-400" />
              ) : isListening ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-medium text-white">Listening...</span>
                </>
              ) : (
                <Mic className="w-3.5 h-3.5 text-green-400" />
              )}
            </div>
            
            {/* Answer Controls */}
            {hasStarted && !isAiSpeaking && sessionActive && currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1 && (
              <div className="absolute right-4 bottom-4">
                <button 
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors flex items-center gap-2 shadow-lg"
                >
                  Finish Answer <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Transcript */}
        <div className="flex flex-col rounded-3xl glass-card border border-white/10 overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-white/5 shrink-0">
            <MessageSquareText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-white">Live Transcript</h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {transcript.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${msg.sender === 'ai' ? 'items-start' : 'items-end'}`}
              >
                <span className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider px-1">
                  {msg.sender === 'ai' ? 'Interviewer' : 'You'}
                </span>
                <div className={`p-3 rounded-2xl max-w-[90%] ${msg.sender === 'ai' ? 'bg-white/10 text-white rounded-tl-sm' : 'bg-primary text-white rounded-tr-sm'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            
            {/* Live streaming text for current answer */}
            {isListening && liveUserText && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-end"
              >
                 <span className="text-[10px] text-primary/70 mb-1 uppercase tracking-wider px-1">
                  You (Speaking...)
                </span>
                <div className="p-3 rounded-2xl max-w-[90%] bg-primary/40 border border-primary/30 text-white/90 rounded-tr-sm italic">
                  <p className="text-sm leading-relaxed">{liveUserText}</p>
                </div>
              </motion.div>
            )}

            {!sessionActive && transcript.length > 0 && (
              <div className="text-center p-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-red-500/10 text-red-400">Session Ended</span>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>

      </div>

      {/* Control Bar */}
      <div className="flex justify-center shrink-0 relative z-20">
        <div className="p-2 rounded-2xl glass-card border border-white/10 flex items-center gap-4 bg-black/50 backdrop-blur-xl">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
          
          <div className="w-px h-8 bg-white/10 mx-2" />
          
          <button 
            onClick={handleEndCall}
            disabled={!sessionActive}
            className="w-16 h-12 rounded-xl flex items-center justify-center bg-red-500 text-white hover:bg-red-600 hover:scale-105 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:hover:scale-100"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
      
    </div>
  );
}
