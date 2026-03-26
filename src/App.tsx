import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Globe,
  Hexagon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateApp, AppStructure, GeneratedFile } from './services/ai';
import { FileTree } from './components/FileTree';
import { CodeEditor } from './components/CodeEditor';
import { Terminal } from './components/Terminal';
import { GitHubModal } from './components/GitHubModal';
import { VisualDesigner } from './components/VisualDesigner';
import { HeroState } from './components/HeroState';
import { ModelSettingsModal, ModelConfig } from './components/ModelSettingsModal';
import { IntelligentLoadingOverlay } from './components/IntelligentLoadingOverlay';
import { exportProjectToZip } from './lib/export';
import { cn } from './lib/utils';
import { getWebContainer, filesToTree } from './lib/webcontainer';
import { Github, Palette, MessageSquare, User, Bot } from 'lucide-react';
import Markdown from 'react-markdown';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [appData, setAppData] = useState<AppStructure | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'preview' | 'designer' | 'review' | 'roadmap'>('chat');
  const [logs, setLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSettings, setShowSettings] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [cloneUrl, setCloneUrl] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    provider: 'gemini',
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'llama3'
  });
  
  // WebContainer State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewStatus, setPreviewStatus] = useState<string>('');
  const [isBooting, setIsBooting] = useState(false);

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
    
    const currentPrompt = prompt;
    setPrompt('');
    setIsGenerating(true);
    const isModification = !!appData;
    setLogs([]);
    
    setMessages(prev => [...prev, { role: 'user', content: currentPrompt }]);
    
    // Add a temporary assistant message that we will update
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    
    const steps = isModification ? [
      "Initializing Neural Architect Engine...",
      "Analyzing existing codebase and component tree...",
      "Planning targeted modifications...",
      "Streaming modifications..."
    ] : [
      "Initializing Neural Architect Engine...",
      "Analyzing semantic requirements and design patterns...",
      "Synthesizing full-stack architecture...",
      "Streaming files..."
    ];

    // Simulate initial thinking steps
    for (const step of steps) {
      setLogs(prev => [...prev, step]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    try {
      let hasStartedStreaming = false;
      const currentMessages = [...messages, { role: 'user' as const, content: currentPrompt }];
      const result = await generateApp(currentPrompt, appData, { useWebSearch, modelConfig, messages: currentMessages }, (partialResult) => {
        if (!hasStartedStreaming && partialResult.app && partialResult.app.files.length > 0) {
          hasStartedStreaming = true;
          setIsStreaming(true);
          setActiveTab('code');
        } else if (!hasStartedStreaming && partialResult.text) {
          setActiveTab('chat');
        }
        
        if (partialResult.app) {
          setAppData(partialResult.app);
          if (partialResult.app.files.length > 0) {
            // Auto-select the last file being generated so the user can watch it type
            const lastFile = partialResult.app.files[partialResult.app.files.length - 1];
            setSelectedFilePath(lastFile.path);
          }
        }
        
        // Update the last assistant message
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = partialResult.text;
          return newMessages;
        });
      });
      
      if (result.app) {
        setAppData(result.app);
        isServerRunningRef.current = false; // Force a reboot if the app changed
      }
      
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = result.text || (result.app ? "I've updated the code for you." : "I couldn't generate a response.");
        return newMessages;
      });
      
      setLogs(prev => [...prev, isModification ? "✓ App modified successfully!" : "✓ App generated successfully!", result.app ? `Project: ${result.app.name}` : "Response complete."]);
    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, "⚠ Error: Failed to generate app. Please check your connection and try again."]);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "Sorry, I encountered an error while processing your request.";
        return newMessages;
      });
    } finally {
      setIsGenerating(false);
      setIsStreaming(false);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const isServerRunningRef = useRef(false);
  const devProcessRef = useRef<any>(null);

  useEffect(() => {
    if (!appData || isStreaming) return;

    let isMounted = true;

    const bootContainer = async () => {
      try {
        setIsBooting(true);
        
        const wc = await getWebContainer();
        
        setPreviewStatus('Mounting files...');
        addLog('📁 Mounting generated files...');
        await wc.mount(filesToTree(appData.files));

        if (isServerRunningRef.current) {
          addLog('⚡ Server already running, files updated.');
          setIsBooting(false);
          return;
        }

        setPreviewStatus('Booting WebContainer...');
        addLog('🚀 Booting WebContainer environment...');
        
        setPreviewStatus('Installing dependencies...');
        addLog('📦 Running npm install...');
        const installProcess = await wc.spawn('npm', ['install']);
        
        installProcess.output.pipeTo(new WritableStream({
          write(data) {
            if (isMounted) addLog(`[npm install] ${data}`);
          }
        }));

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error('Installation failed');
        }

        if (devProcessRef.current) {
          devProcessRef.current.kill();
        }

        setPreviewStatus('Starting dev server...');
        addLog('⚡ Starting development server...');
        const devProcess = await wc.spawn('npm', ['run', 'dev']);
        devProcessRef.current = devProcess;
        
        devProcess.output.pipeTo(new WritableStream({
          write(data) {
            if (isMounted) addLog(`[dev server] ${data}`);
          }
        }));

        wc.on('server-ready', (port, url) => {
          if (isMounted) {
            isServerRunningRef.current = true;
            addLog(`✅ Server ready at ${url}`);
            setPreviewUrl(url);
            setPreviewStatus('Ready');
            setIsBooting(false);
          }
        });

      } catch (error) {
        console.error('WebContainer error:', error);
        if (isMounted) {
          addLog(`❌ WebContainer error: ${error instanceof Error ? error.message : String(error)}`);
          setPreviewStatus('Error booting container');
          setIsBooting(false);
        }
      }
    };

    bootContainer();

    return () => {
      isMounted = false;
    };
  }, [appData, isStreaming]);

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
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shrink-0 shadow-lg shadow-orange-500/20">
            <Hexagon size={20} className="absolute" strokeWidth={2.5} />
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white hidden sm:block">
            DevHive <span className="text-orange-500">Builder</span>
          </h1>
          {appData && (
            <div className="ml-1 md:ml-4 flex items-center gap-2 rounded-full bg-zinc-800 px-2 md:px-3 py-1 text-[10px] md:text-xs">
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium text-zinc-200 truncate max-w-[80px] md:max-w-none">{appData.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={() => setShowSettings(true)}
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            title="Model Settings"
          >
            <Settings size={14} />
          </button>
          {appData && !isMobile && (
            <>
              <button 
                className="flex items-center gap-2 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors"
                onClick={() => exportProjectToZip(appData.name, appData.files)}
              >
                <Download size={14} />
                Export
              </button>
              <button 
                className="flex items-center gap-2 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors"
                onClick={() => setShowGitHubModal(true)}
              >
                <Github size={14} />
                GitHub
              </button>
            </>
          )}
          <button 
            className={cn(
              "flex items-center gap-2 rounded-md px-2 md:px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === 'chat' ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
            onClick={() => {
              setActiveTab('chat');
              if (isMobile) setSidebarOpen(false);
            }}
          >
            <MessageSquare size={14} />
            <span className="hidden xs:block">Chat</span>
          </button>
          <button 
            className={cn(
              "flex items-center gap-2 rounded-md px-2 md:px-3 py-1.5 text-xs font-medium transition-colors",
              activeTab === 'designer' ? "bg-zinc-700 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
            onClick={() => {
              setActiveTab('designer');
              if (isMobile) setSidebarOpen(false);
            }}
            disabled={!appData}
          >
            <Palette size={14} />
            <span className="hidden xs:block">Designer</span>
          </button>
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

          {/* Intelligent Loading Overlay */}
          <AnimatePresence>
            {isGenerating && !isStreaming && <IntelligentLoadingOverlay logs={logs} />}
          </AnimatePresence>

          {activeTab === 'chat' ? (
            <div className="flex flex-1 flex-col overflow-hidden bg-[#111]">
              <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {messages.length === 0 ? (
                  <HeroState 
                    onSuggestionClick={(suggestion) => {
                      setPrompt(suggestion);
                    }} 
                  />
                ) : (
                  <div className="mx-auto max-w-3xl space-y-6 pb-20">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
                          msg.role === 'user' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        )}>
                          {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={cn(
                          "rounded-2xl px-5 py-3.5 max-w-[85%] shadow-sm",
                          msg.role === 'user' ? "bg-blue-600 text-white rounded-tr-sm" : "bg-zinc-800 text-zinc-300 rounded-tl-sm border border-zinc-700"
                        )}>
                          <div className="markdown-body text-sm leading-relaxed">
                            <Markdown>
                              {msg.content || (isGenerating && idx === messages.length - 1 ? "Thinking..." : "")}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'code' ? (
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
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-zinc-500 bg-[#111]">
                  <Code2 size={32} className="mb-4 opacity-20" />
                  <p className="text-sm">Select a file from the sidebar to view its code</p>
                </div>
              )}
            </div>
          ) : activeTab === 'preview' ? (
            <div className="flex flex-1 flex-col bg-white overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex h-10 items-center justify-between border-b bg-zinc-100 px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="ml-4 flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-zinc-500 shadow-sm ring-1 ring-zinc-200 min-w-[200px]">
                    <span className="opacity-50">https://</span>
                    <span className="truncate">{previewUrl ? new URL(previewUrl).host : (appData?.name.toLowerCase().replace(/\s+/g, '-') || 'preview') + '.devhive.app'}</span>
                  </div>
                </div>
                {previewUrl && (
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              
              {!appData ? (
                <div className="flex flex-1 items-center justify-center bg-zinc-50 p-8">
                  <div className="text-center">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200 text-zinc-400">
                      <Layout size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">No App Generated</h3>
                    <p className="text-sm text-zinc-500">Generate an app to see the live preview.</p>
                  </div>
                </div>
              ) : isBooting || !previewUrl ? (
                <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 p-8">
                  {previewStatus === 'Error booting container' ? (
                    <>
                      <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
                      <h3 className="text-lg font-bold text-zinc-900 mb-2">WebContainer Error</h3>
                      <p className="text-sm text-zinc-500 max-w-md text-center mb-4">
                        WebContainers require a cross-origin isolated environment. If you are seeing this error, your browser is likely blocking third-party cookies or service workers.
                      </p>
                      <button 
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Open App in New Tab
                      </button>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                      <h3 className="text-lg font-bold text-zinc-900 mb-2">Setting up environment</h3>
                      <p className="text-sm text-zinc-500">{previewStatus}</p>
                    </>
                  )}
                </div>
              ) : (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full border-0 bg-white"
                  title="WebContainer Preview"
                  allow="cross-origin-isolated"
                />
              )}
            </div>
          ) : activeTab === 'designer' ? (
            <div className="flex flex-1 flex-col overflow-hidden bg-[#111]">
              {appData ? (
                <VisualDesigner 
                  files={appData.files} 
                  onUpdateFiles={(updatedFiles) => {
                    setAppData({ ...appData, files: updatedFiles });
                    addLog("🎨 Theme applied successfully. Rebuilding preview...");
                  }} 
                />
              ) : (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div className="max-w-md">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50 text-zinc-500">
                      <Palette size={32} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white">Visual Designer</h3>
                    <p className="text-sm text-zinc-400">Generate an app first to unlock the visual theme and layout editor.</p>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'roadmap' ? (
            <div className="flex flex-1 flex-col overflow-auto bg-[#0a0a0a] p-8">
              <div className="mx-auto max-w-4xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 text-4xl font-black tracking-tight text-white">Future of DevHive Builder</h2>
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
                    <div className="mt-4 inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-500">
                      Completed
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
                      Seamlessly push your generated projects to GitHub repositories. Manage branches, commits, and pull requests directly from DevHive.
                    </p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-500">
                      Completed
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
                    <div className="mt-4 inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-green-500">
                      Completed
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
              <button 
                onClick={() => setUseWebSearch(!useWebSearch)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold transition-all",
                  useWebSearch 
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-400" 
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-blue-500/50 hover:text-white"
                )}
              >
                <Globe size={12} />
                {useWebSearch ? 'Web Search: ON' : 'Web Search: OFF'}
              </button>
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
      <ModelSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={modelConfig}
        onSave={(newConfig) => {
          setModelConfig(newConfig);
          setLogs(prev => [...prev, `⚙️ AI Provider updated to: ${newConfig.provider.toUpperCase()}`]);
        }}
      />

      {/* GitHub Modal */}
      {appData && (
        <GitHubModal
          isOpen={showGitHubModal}
          onClose={() => setShowGitHubModal(false)}
          files={appData.files}
          defaultRepoName={appData.name}
        />
      )}

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
