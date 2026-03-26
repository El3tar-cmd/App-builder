import React from 'react';
import { motion } from 'motion/react';
import { Loader2, Cpu, Database, Layout, Shield, Zap, Code2 } from 'lucide-react';

interface IntelligentLoadingOverlayProps {
  logs: string[];
}

export function IntelligentLoadingOverlay({ logs }: IntelligentLoadingOverlayProps) {
  const currentLog = logs[logs.length - 1] || "Initializing...";

  // Determine icon based on log content
  let Icon = Code2;
  if (currentLog.toLowerCase().includes('database') || currentLog.toLowerCase().includes('schema')) Icon = Database;
  else if (currentLog.toLowerCase().includes('ui') || currentLog.toLowerCase().includes('layout')) Icon = Layout;
  else if (currentLog.toLowerCase().includes('security') || currentLog.toLowerCase().includes('middleware')) Icon = Shield;
  else if (currentLog.toLowerCase().includes('compiling') || currentLog.toLowerCase().includes('build')) Icon = Zap;
  else if (currentLog.toLowerCase().includes('neural') || currentLog.toLowerCase().includes('analyzing')) Icon = Cpu;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#1e1e1e]/90 backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center">
        {/* Glowing Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 h-64 w-64 rounded-full bg-purple-500/20 blur-[80px]"
        />

        {/* Central Icon */}
        <motion.div 
          key={Icon.name}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative z-10 mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/50 shadow-2xl backdrop-blur-xl"
        >
          <Icon size={40} className="text-blue-400" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-3xl border border-dashed border-blue-500/30"
          />
        </motion.div>

        {/* Status Text */}
        <div className="relative z-10 text-center">
          <motion.h2 
            key={currentLog}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-3 text-2xl font-bold tracking-tight text-white"
          >
            {currentLog.replace(/\[.*?\]\s*/, '')}
          </motion.h2>
          
          <div className="flex items-center justify-center gap-3 text-sm text-zinc-400">
            <Loader2 size={14} className="animate-spin text-blue-500" />
            <span>Synthesizing architecture...</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mt-12 w-64 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
