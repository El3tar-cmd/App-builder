import React from 'react';
import { motion } from 'motion/react';
import { Hexagon, Code2, Zap, Cpu, ArrowRight, LayoutDashboard, MessageSquare, ShoppingCart, Kanban, Briefcase } from 'lucide-react';

interface HeroStateProps {
  onSuggestionClick: (prompt: string) => void;
}

export function HeroState({ onSuggestionClick }: HeroStateProps) {
  const suggestions = [
    {
      title: "ERP System",
      description: "A comprehensive enterprise resource planning suite.",
      icon: <Briefcase size={18} />,
      prompt: "Build an advanced ERP system dashboard. Include a sidebar with modules for HR, Inventory, Finance, and CRM. The main view should have a high-level overview with KPI cards, a recent activity feed, and a data table for active inventory or employee records."
    },
    {
      title: "SaaS Dashboard",
      description: "A modern analytics dashboard with charts and data tables.",
      icon: <LayoutDashboard size={18} />,
      prompt: "Build a modern SaaS analytics dashboard with a sidebar, top navigation, and a main content area featuring interactive charts (use recharts) and a data table with pagination."
    },
    {
      title: "AI Chat Interface",
      description: "A sleek messaging UI with typing indicators.",
      icon: <MessageSquare size={18} />,
      prompt: "Create a sleek AI chat interface similar to ChatGPT. Include a sidebar for chat history, a main chat area with message bubbles (differentiating user and AI), and a sticky input area at the bottom."
    },
    {
      title: "Kanban Board",
      description: "A drag-and-drop project management tool.",
      icon: <Kanban size={18} />,
      prompt: "Create a Kanban board for project management. Include columns for 'To Do', 'In Progress', and 'Done'. Add the ability to create new tasks and move them between columns."
    }
  ];

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-[#0a0a0a] p-8 text-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-orange-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-amber-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-white/10 shadow-2xl shadow-orange-500/20"
        >
          <Hexagon className="text-orange-500" size={40} strokeWidth={2.5} />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500"
        >
          What will we build today?
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 max-w-xl text-lg text-zinc-400"
        >
          Describe your vision, and DevHive Builder will architect, design, and deploy a production-ready full-stack application in seconds.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl"
        >
          {suggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(item.prompt)}
              className="group relative flex flex-col items-start rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-5 text-left transition-all hover:border-orange-500/30 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-orange-500/5 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-300 group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors">
                {item.icon}
              </div>
              <h3 className="relative z-10 mb-1 font-semibold text-zinc-200 group-hover:text-white transition-colors">{item.title}</h3>
              <p className="relative z-10 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors line-clamp-2">{item.description}</p>
              <ArrowRight size={14} className="absolute bottom-5 right-5 text-zinc-600 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
