import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Loader2, Sparkles, AudioWaveform } from "lucide-react";

// --- 1. Emotion Configuration ---
const EMOTION_GROUPS = {
  excitement: "POS_HIGH", joy: "POS_HIGH", amusement: "POS_HIGH", pride: "POS_HIGH",
  love: "POS_LOW", gratitude: "POS_LOW", optimism: "POS_LOW", relief: "POS_LOW", caring: "POS_LOW",
  anger: "NEG_HIGH", fear: "NEG_HIGH", nervousness: "NEG_HIGH", disgust: "NEG_HIGH", annoyance: "NEG_HIGH",
  sadness: "NEG_LOW", grief: "NEG_LOW", remorse: "NEG_LOW", disappointment: "NEG_LOW", disapproval: "NEG_LOW",
  surprise: "NEUTRAL", realization: "NEUTRAL", confusion: "NEUTRAL", curiosity: "NEUTRAL", neutral: "NEUTRAL"
};

const THEMES = {
  POS_HIGH: { bgBase: "bg-orange-50", blob1: "bg-yellow-400", blob2: "bg-orange-500", blob3: "bg-amber-300", textColor: "text-amber-900", accentColor: "bg-amber-500", borderColor: "border-amber-200", icon: "☀️", barColor: "rgb(245, 158, 11)" },
  POS_LOW: { bgBase: "bg-rose-50", blob1: "bg-pink-300", blob2: "bg-rose-400", blob3: "bg-orange-200", textColor: "text-rose-900", accentColor: "bg-rose-400", borderColor: "border-rose-200", icon: "🌸", barColor: "rgb(251, 113, 133)" },
  NEG_HIGH: { bgBase: "bg-red-50", blob1: "bg-red-600", blob2: "bg-orange-600", blob3: "bg-rose-600", textColor: "text-white", accentColor: "bg-red-600", borderColor: "border-red-400", icon: "🔥", barColor: "rgb(220, 38, 38)" },
  NEG_LOW: { bgBase: "bg-slate-900", blob1: "bg-indigo-600", blob2: "bg-blue-800", blob3: "bg-violet-900", textColor: "text-white", accentColor: "bg-indigo-500", borderColor: "border-indigo-400", icon: "💧", barColor: "rgb(99, 102, 241)" },
  NEUTRAL: { bgBase: "bg-slate-50", blob1: "bg-indigo-200", blob2: "bg-purple-200", blob3: "bg-slate-300", textColor: "text-slate-800", accentColor: "bg-slate-800", borderColor: "border-slate-300", icon: "✨", barColor: "rgb(71, 85, 105)" }
};

// --- 2. Dumb Visualizer Component (Just Draws) ---
const AudioVisualizer = ({ analyser, isPlaying, color }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    // Explicitly set canvas size to match display size for sharpness
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) return;

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.fillStyle = color;

        ctx.beginPath();
        // Draw bars growing from center or bottom (bottom looks cleaner here)
        ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, 4);
        ctx.fill();

        x += barWidth;
      }
    };

    if (isPlaying) {
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, color, analyser]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// --- 3. Fluid Background ---
const FluidBackground = ({ theme }) => {
  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden transition-colors duration-1000 ${theme.bgBase}`}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <motion.div className={`absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] rounded-full mix-blend-multiply filter blur-[80px] opacity-60 ${theme.blob1}`} animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className={`absolute top-[20%] right-[-10%] w-[60vh] h-[60vh] rounded-full mix-blend-multiply filter blur-[80px] opacity-60 ${theme.blob2}`} animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className={`absolute bottom-[-20%] left-[20%] w-[70vh] h-[70vh] rounded-full mix-blend-multiply filter blur-[80px] opacity-60 ${theme.blob3}`} animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
};

export default function App() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef(null);

  // --- AUDIO ENGINE STATE (The Single Source of Truth) ---
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const [isAudioSetup, setIsAudioSetup] = useState(false);

  const group = EMOTION_GROUPS[currentEmotion] || "NEUTRAL";
  const theme = THEMES[group];

  // Initialize Audio Context ONCE
  useEffect(() => {
    // Only run if audio element exists and we haven't setup yet
    if (audioRef.current && !isAudioSetup) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        // Store in refs
        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
        setIsAudioSetup(true); // Mark as ready
      } catch (e) {
        console.error("Audio setup failed:", e);
      }
    }
  }, [audioRef]); // Runs once when audioRef attaches

  const handleGenerate = async () => {
    if (!text) return;
    setIsLoading(true);
    setIsPlaying(false);

    try {
      const response = await fetch("http://localhost:8000/generate-audio", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }),
      });

      const detectedEmotion = response.headers.get("X-Emotion");
      if (detectedEmotion) setCurrentEmotion(detectedEmotion);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = url;

        // IMPORTANT: Resume context on user click (Browser Policy)
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        await audioRef.current.play();
        setIsPlaying(true);

        audioRef.current.onended = () => setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 font-sans overflow-hidden">
      <FluidBackground theme={theme} />

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 w-full max-w-lg bg-white/30 backdrop-blur-2xl border ${theme.borderColor} shadow-2xl rounded-3xl p-8 overflow-hidden`}
        style={{ boxShadow: "0 20px 60px -15px rgba(0, 0, 0, 0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${theme.accentColor} text-white shadow-lg`}>
              <Volume2 size={24} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${theme.textColor}`}>Darwix TTS</h1>
              <p className={`text-xs font-medium opacity-60 ${theme.textColor}`}>AI Emotion Engine</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentEmotion}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/50 border border-white/60 shadow-sm ${theme.textColor}`}
            >
              {theme.icon} {currentEmotion}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="relative mb-6 group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something emotional..."
            className={`w-full h-40 bg-white/40 border border-white/40 rounded-2xl p-5 text-lg ${theme.textColor} placeholder-slate-500/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/60 transition-all resize-none shadow-inner`}
          />
        </div>

        {/* VISUALIZER AREA */}
        <div className="h-16 mb-4 relative flex items-center justify-center w-full">
          {/* Visualizer Layer */}
          <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            {/* Only pass the analyser if setup is complete */}
            {isAudioSetup && (
              <AudioVisualizer
                analyser={analyserRef.current}
                isPlaying={isPlaying}
                color={theme.barColor}
              />
            )}
          </div>

          {/* Ready Text Layer */}
          <div className={`transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'} flex items-center gap-2 opacity-40 text-xs font-medium uppercase tracking-widest ${theme.textColor}`}>
            <AudioWaveform size={14} /> Ready to Speak
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !text}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transform transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${theme.accentColor}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={20} className="fill-white/20" /> Speak It
            </>
          )}
        </button>

        <audio ref={audioRef} className="hidden" crossOrigin="anonymous" />

      </motion.div>
    </div>
  );
}