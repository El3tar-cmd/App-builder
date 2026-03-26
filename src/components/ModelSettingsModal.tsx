import React, { useState } from 'react';
import { Settings, X, Server, Cpu, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ModelConfig {
  provider: 'gemini' | 'ollama';
  ollamaEndpoint: string;
  ollamaModel: string;
}

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  onSave: (config: ModelConfig) => void;
}

export function ModelSettingsModal({ isOpen, onClose, config, onSave }: ModelSettingsModalProps) {
  const [localConfig, setLocalConfig] = useState<ModelConfig>(config);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#1e1e1e] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <Settings size={20} />
              <h3 className="font-bold">AI Model Settings</h3>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">AI Provider</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLocalConfig({ ...localConfig, provider: 'gemini' })}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                    localConfig.provider === 'gemini'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800'
                  }`}
                >
                  <Server size={24} />
                  <span className="text-sm font-semibold">Google Gemini</span>
                  <span className="text-[10px] opacity-70">Cloud (Recommended)</span>
                </button>
                <button
                  onClick={() => setLocalConfig({ ...localConfig, provider: 'ollama' })}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                    localConfig.provider === 'ollama'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800'
                  }`}
                >
                  <Cpu size={24} />
                  <span className="text-sm font-semibold">Local Ollama</span>
                  <span className="text-[10px] opacity-70">Self-Hosted</span>
                </button>
              </div>
            </div>

            {/* Ollama Settings */}
            {localConfig.provider === 'ollama' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 overflow-hidden"
              >
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-400">
                  <div className="mb-2 flex items-center gap-2 font-bold">
                    <AlertTriangle size={16} />
                    Important Note
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    Ollama runs locally. To use it from this cloud-hosted web app, you must configure your local Ollama instance to allow CORS from this domain:
                    <br /><code className="mt-1 block rounded bg-black/30 p-1 text-[10px]">OLLAMA_ORIGINS="*" ollama serve</code>
                    <br />Also, local models may struggle with the massive context window required for full-app generation.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Ollama Endpoint URL</label>
                  <input
                    type="text"
                    value={localConfig.ollamaEndpoint}
                    onChange={(e) => setLocalConfig({ ...localConfig, ollamaEndpoint: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Model Name</label>
                  <input
                    type="text"
                    value={localConfig.ollamaModel}
                    onChange={(e) => setLocalConfig({ ...localConfig, ollamaModel: e.target.value })}
                    placeholder="llama3, mistral, etc."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </motion.div>
            )}

            <button
              onClick={() => {
                onSave(localConfig);
                onClose();
              }}
              className="mt-4 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Save Configuration
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
