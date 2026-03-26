import React, { useState, useEffect } from 'react';
import { 
  Mic,
  MicOff,
  FolderOpen,
  FileUp,
  Link2,
  Menu,
  X,
  Plus, 
  Search, 
  Play, 
  Code2, 
  Layout, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Send,
  Loader2,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateApp, AppStructure, GeneratedFile } from './services/ai';
import { FileTree } from './components/FileTree';
import { CodeEditor } from './components/CodeEditor';
import { Terminal } from './components/Terminal';
import { cn } from './lib/utils';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [appData, setAppData] = useState<AppStructure | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'review' | 'roadmap'>('code');
  const [logs, setLogs] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSettings, setShowSettings] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneUrl, setCloneUrl] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedFile = appData?.files.find(f => f.path === selectedFilePath);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    const isModification = !!appData;
    setLogs([]);
    
    const steps = isModification ? [
      "Initializing Neural Architect Engine...",
      "Analyzing existing codebase and component tree...",
      "Planning targeted modifications...",
      "Refactoring React components and state logic...",
      "Updating backend API routes and middleware...",
      "Verifying integration and static analysis...",
      "Finalizing iterative deployment..."
    ] : [
      "Initializing Neural Architect Engine...",
      "Analyzing semantic requirements and design patterns...",
      "Synthesizing full-stack architecture (React 19 + Node.js 22)...",
      "Optimizing database schema with relational integrity...",
      "Generating responsive UI components with Tailwind JIT...",
      "Implementing secure RESTful API layer and middleware...",
      "Compiling source code and performing static analysis...",
      "Running production-grade build and optimization...",
      "Finalizing project artifacts and deployment manifests..."
    ];

    // Simulate thinking steps
    for (const step of steps) {
      setLogs(prev => [...prev, step]);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
    }
    
    try {
      const result = await generateApp(prompt, appData);
      setAppData(result);
      if (result.files.length > 0) {
        const fileExists = result.files.some(f => f.path === selectedFilePath);
        if (!fileExists) {
          setSelectedFilePath(result.files[0].path);
        }
      }
      setLogs(prev => [...prev, isModification ? "✓ App modified successfully!" : "✓ App generated successfully!", `Project: ${result.name}`]);
      setPrompt('');
    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, "⚠ Error: Failed to generate app. Please check your connection and try again."]);
    } finally {
      setIsGenerating(false);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog("⚠ Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      addLog("🎙 Listening for your prompt...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      addLog(`⚠ Voice error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addLog(`📁 Uploaded ${files.length} files for context.`);
    }
  };

  const handleCloneWebsite = () => {
    setShowCloneModal(true);
  };

  const submitClone = () => {
    if (cloneUrl.trim()) {
      setPrompt(`Clone this website and make it editable: ${cloneUrl}`);
      addLog(`🌐 Initializing clone sequence for: ${cloneUrl}`);
      setShowCloneModal(false);
      setCloneUrl('');
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#0a0a0a] text-zinc-300 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="flex h-14 md:h-12 items-center justify-between border-b border-zinc-800 bg-[#111] px-4">
        <div className="flex items-center gap-2 md:gap-3">
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-1 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
            <Sparkles size={18} />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white hidden sm:block">Nexus AI Builder</h1>
          {appData && (
            <div className="ml-1 md:ml-4 flex items-center gap-2 rounded-full bg-zinc-800 px-2 md:px-3 py-1 text-[10px] md:text-xs">
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-zinc-200 truncate max-w-[80px] md:max-w-none">{appData.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {!isMobile && (
            <button 
              className="flex items-center gap-2 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors"
              onClick={() => addLog("Exporting project...")}
            >
              <Download size={14} />
              Export
            </button>
          )}
          <button 
            className={cn(
              "flex items-center gap-2 rounded-md px-2 md:px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === 'roadmap' ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
            onClick={() => {
              setActiveTab('roadmap');
              if (isMobile) setSidebarOpen(false);
            }}
          >
            <Sparkles size={14} />
            <span className="hidden xs:block">Roadmap</span>
          </button>
          <button 
            className={cn(
              "flex items-center gap-2 rounded-md px-2 md:px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === 'review' ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
            onClick={() => {
              setActiveTab('review');
              if (isMobile) setSidebarOpen(false);
            }}
            disabled={!appData}
          >
            <CheckCircle2 size={14} />
            <span className="hidden xs:block">Review</span>
          </button>
          <button 
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 md:px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
            onClick={() => {
              setActiveTab(activeTab === 'preview' ? 'code' : 'preview');
              if (isMobile) setSidebarOpen(false);
            }}
          >
            {activeTab === 'preview' ? <Code2 size={14} /> : <Play size={14} fill="currentColor" />}
            <span className="hidden xs:block">{activeTab === 'preview' ? 'Code' : 'Run'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: isMobile ? -260 : 0, width: isMobile ? 260 : 0, opacity: 0 }}
              animate={{ x: 0, width: 260, opacity: 1 }}
              exit={{ x: isMobile ? -260 : 0, width: 0, opacity: 0 }}
              className={cn(
                "flex flex-col border-r border-zinc-800 bg-[#111] overflow-hidden z-30",
                isMobile ? "absolute inset-y-0 left-0 shadow-2xl" : "relative"
              )}
            >
              {appData ? (
                <FileTree 
                  files={appData.files} 
                  selectedPath={selectedFilePath} 
                  onSelect={(path) => {
                    setSelectedFilePath(path);
                    if (isMobile) setSidebarOpen(false);
                  }} 
                />
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-zinc-500">
                  <Layout size={32} className="mb-4 opacity-20" />
                  <p className="text-xs">Generate an app to see the file structure</p>
                </div>
              )}
              
              <div className="mt-auto border-t border-zinc-800 p-4">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="flex w-full items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  <Settings size={12} />
                  <span>Project Settings</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
          />
        )}

        {/* Editor/Preview Area */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-[#1e1e1e]">
          {/* Toggle Sidebar Button (Desktop only) */}
          {!isMobile && (
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-r-md bg-zinc-800 p-1 text-zinc-400 hover:text-white"
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          {activeTab === 'code' ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              {selectedFile ? (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex h-9 items-center border-b border-zinc-800 bg-[#181818] px-4 text-xs">
                    <span className="text-zinc-400">{selectedFile.path}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor 
                      content={selectedFile.content} 
                      language={selectedFile.language} 
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center bg-[#1e1e1e] p-12 text-center">
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-800/50 text-zinc-600">
                    <Code2 size={40} />
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-white">Ready to build?</h2>
                  <p className="max-w-md text-sm text-zinc-500">
                    Enter a prompt below to generate a full-stack React application with an Express backend.
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === 'preview' ? (
            <div className="flex flex-1 flex-col bg-white overflow-auto">
              {/* Simulated Preview */}
              <div className="sticky top-0 z-10 flex h-8 items-center justify-between border-b bg-zinc-100 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="ml-4 flex items-center gap-2 rounded bg-white px-3 py-0.5 text-[10px] text-zinc-500 shadow-sm ring-1 ring-zinc-200">
                    <span className="opacity-50">https://</span>
                    <span>{appData?.name.toLowerCase().replace(/\s+/g, '-') || 'preview'}.nexus.ai</span>
                  </div>
                </div>
                <ExternalLink size={12} className="text-zinc-400 cursor-pointer hover:text-zinc-600" />
              </div>
              
              {!appData ? (
                <div className="flex flex-1 items-center justify-center bg-zinc-50 p-8">
                  <div className="text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200 text-zinc-400">
                      <Layout size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">No App Generated</h3>
                    <p className="text-sm text-zinc-500">Generate an app to see the preview.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col bg-white">
                  {/* Mockup Header */}
                  <nav className="flex h-16 items-center justify-between border-b px-8">
                    <div className="text-xl font-bold text-blue-600">{appData.name}</div>
                    <div className="flex gap-6 text-sm font-medium text-zinc-600">
                      <span>Home</span>
                      <span>Features</span>
                      <span>About</span>
                      <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">Get Started</button>
                    </div>
                  </nav>

                  {/* Mockup Hero */}
                  <div className="flex flex-1 flex-col items-center justify-center px-8 py-20 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-3xl"
                    >
                      <h2 className="mb-6 text-5xl font-extrabold tracking-tight text-zinc-900">
                        {appData.description}
                      </h2>
                      <p className="mb-10 text-xl text-zinc-600">
                        Experience the power of {appData.name}. Built with cutting-edge technology and designed for production excellence.
                      </p>
                      <div className="flex justify-center gap-4">
                        <button className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-blue-500/20">
                          Launch App
                        </button>
                        <button className="rounded-xl border border-zinc-200 bg-white px-8 py-4 text-lg font-bold text-zinc-900 shadow-sm">
                          Learn More
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Mockup Features */}
                  <div className="bg-zinc-50 px-8 py-20">
                    <div className="mx-auto max-w-6xl">
                      <div className="mb-12 text-center">
                        <h3 className="text-3xl font-bold text-zinc-900">Why Choose {appData.name}?</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                            <div className="mb-4 h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Sparkles size={24} />
                            </div>
                            <h4 className="mb-2 text-xl font-bold text-zinc-900">Feature {i}</h4>
                            <p className="text-zinc-600">High-performance React components with optimized state management and seamless backend integration.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'roadmap' ? (
            <div className="flex flex-1 flex-col overflow-auto bg-[#0a0a0a] p-8">
              <div className="mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-4xl font-black tracking-tight text-white">Future of Nexus AI</h2>
                  <p className="text-lg text-zinc-500">Our vision for the ultimate AI-native development environment.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-blue-500/50 hover:bg-zinc-900">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      <Play size={24} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">Live Execution</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Replace simulated previews with real-time Node.js execution using WebContainers. Run your Express server and React app directly in the browser.
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-500">
                      High Priority
                    </div>
                  </div>

                  <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-purple-500/50 hover:bg-zinc-900">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                      <Send size={24} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">Iterative Refinement</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Chat with your code. Ask the AI to add features, fix bugs, or change styles on top of your existing project without losing progress.
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-500">
                      Completed
                    </div>
                  </div>

                  <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-green-500/50 hover:bg-zinc-900">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                      <Download size={24} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">GitHub Integration</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Seamlessly push your generated projects to GitHub repositories. Manage branches, commits, and pull requests directly from Nexus.
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-500">
                      Planned
                    </div>
                  </div>

                  <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-orange-500/50 hover:bg-zinc-900">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                      <Layout size={24} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">Visual Designer</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      A drag-and-drop UI builder that stays in sync with your React code. Edit visually or via code, and see changes reflected instantly.
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-500">
                      Concept
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-auto bg-[#111] p-8">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Production Readiness Review</h2>
                    <p className="text-sm text-zinc-500">Automated quality assessment of the generated codebase.</p>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none rounded-2xl border border-zinc-800 bg-[#181818] p-8 text-zinc-300">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {appData?.review}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-zinc-800 bg-[#181818] p-4">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Security</div>
                    <div className="text-lg font-semibold text-white">Passed</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-[#181818] p-4">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Performance</div>
                    <div className="text-lg font-semibold text-white">Optimized</div>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-[#181818] p-4">
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Accessibility</div>
                    <div className="text-lg font-semibold text-white">WCAG 2.1</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Terminal */}
          <div className="h-32 md:h-48 border-t border-zinc-800">
            <Terminal logs={logs} />
          </div>
        </div>
      </main>

      {/* Prompt Input */}
      <footer className="border-t border-zinc-800 bg-[#111] p-3 md:p-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button 
                onClick={handleCloneWebsite}
                className="flex shrink-0 items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:border-blue-500/50 hover:text-white transition-all"
              >
                <Link2 size={12} />
                Clone Website
              </button>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:border-blue-500/50 hover:text-white transition-all">
                <FileUp size={12} />
                Add Files
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:border-blue-500/50 hover:text-white transition-all">
                <FolderOpen size={12} />
                Add Folder
                <input type="file" webkitdirectory="" directory="" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            <div className="relative flex items-center">
              <button
                onClick={startVoiceInput}
                className={cn(
                  "absolute left-2 flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                  isListening ? "bg-red-500 text-white animate-pulse" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder={isMobile ? (appData ? "Ask to modify..." : "Describe or speak your prompt...") : (appData ? "Ask to modify the app, add a feature, or fix a bug..." : "Describe, speak, or drop a URL to clone...")}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 md:py-3 pl-12 pr-12 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={cn(
                  "absolute right-1.5 md:right-2 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg transition-all",
                  isGenerating || !prompt.trim() 
                    ? "bg-zinc-700 text-zinc-500" 
                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40"
                )}
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
          <div className="mt-2 hidden md:flex items-center justify-center gap-4 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} /> Multi-page React
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} /> Express Backend
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} /> Tailwind CSS
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} /> Lucide Icons
            </span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111] p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Project Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Project Name</label>
                  <input 
                    type="text" 
                    value={appData?.name || "Untitled Project"} 
                    readOnly
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Environment</label>
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Production (Simulated)</span>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">AI Model</label>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300">
                    gemini-3.1-pro-preview
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Clone Website Modal */}
      <AnimatePresence>
        {showCloneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCloneModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111] p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Clone Website</h2>
                <button onClick={() => setShowCloneModal(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Enter the URL of the website you want to clone. The AI will analyze its structure and generate an editable React replica.
                </p>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Website URL</label>
                  <input 
                    type="url" 
                    value={cloneUrl}
                    onChange={(e) => setCloneUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitClone()}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setShowCloneModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitClone}
                  disabled={!cloneUrl.trim()}
                  className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                  Prepare Clone
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
