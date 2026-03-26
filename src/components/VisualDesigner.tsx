import React, { useState, useEffect } from 'react';
import { Palette, Type, LayoutTemplate, Save, RefreshCw } from 'lucide-react';
import { GeneratedFile } from '../services/ai';

interface VisualDesignerProps {
  files: GeneratedFile[];
  onUpdateFiles: (files: GeneratedFile[]) => void;
}

export function VisualDesigner({ files, onUpdateFiles }: VisualDesignerProps) {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6'); // Default blue
  const [borderRadius, setBorderRadius] = useState('0.5rem');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [isApplying, setIsApplying] = useState(false);

  // Extract current values from index.css if possible
  useEffect(() => {
    const cssFile = files.find(f => f.path === 'src/index.css' || f.path === 'index.css');
    if (cssFile) {
      // Very basic extraction logic for demo purposes
      const colorMatch = cssFile.content.match(/--color-primary:\s*([^;]+);/);
      if (colorMatch) setPrimaryColor(colorMatch[1]);
    }
  }, [files]);

  const handleApplyTheme = () => {
    setIsApplying(true);
    
    // Create a new array of files with updated CSS
    const updatedFiles = files.map(file => {
      if (file.path === 'src/index.css' || file.path === 'index.css') {
        // We'll inject some CSS variables at the top of the file or replace existing ones
        let newContent = file.content;
        
        const themeVars = `
:root {
  --color-primary: ${primaryColor};
  --radius: ${borderRadius};
  --font-sans: '${fontFamily}', system-ui, sans-serif;
}
`;
        // If it already has a :root block, we might just prepend this for simplicity in this demo
        if (!newContent.includes('--color-primary')) {
          newContent = themeVars + '\n' + newContent;
        } else {
          // Replace existing
          newContent = newContent.replace(/--color-primary:[^;]+;/, `--color-primary: ${primaryColor};`);
          newContent = newContent.replace(/--radius:[^;]+;/, `--radius: ${borderRadius};`);
          newContent = newContent.replace(/--font-sans:[^;]+;/, `--font-sans: '${fontFamily}', system-ui, sans-serif;`);
        }
        
        return { ...file, content: newContent };
      }
      
      // Also update tailwind.config.ts if it exists to use these variables
      if (file.path === 'tailwind.config.ts' || file.path === 'tailwind.config.js') {
        let newContent = file.content;
        if (!newContent.includes('var(--color-primary)')) {
          // This is a naive injection for the demo
          newContent = newContent.replace(
            /extend:\s*\{/, 
            `extend: {
      colors: {
        primary: 'var(--color-primary)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },`
          );
        }
        return { ...file, content: newContent };
      }
      
      return file;
    });

    setTimeout(() => {
      onUpdateFiles(updatedFiles);
      setIsApplying(false);
    }, 800);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#1e1e1e] text-white">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#181818] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
            <Palette size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Visual Designer</h2>
            <p className="text-xs text-zinc-400">Professional Theme & Layout Editor</p>
          </div>
        </div>
        <button
          onClick={handleApplyTheme}
          disabled={isApplying}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          {isApplying ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          Apply Theme
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-3xl space-y-8">
          
          {/* Colors Section */}
          <div className="rounded-xl border border-zinc-800 bg-[#181818] p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Palette size={18} className="text-blue-400" />
              <h3 className="text-lg font-medium">Brand Colors</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Preset Palettes</label>
                <div className="flex gap-2">
                  {['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#000000'].map(color => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className="h-8 w-8 rounded-full border-2 border-zinc-700 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="rounded-xl border border-zinc-800 bg-[#181818] p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Type size={18} className="text-green-400" />
              <h3 className="text-lg font-medium">Typography</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Inter">Inter (Modern Sans)</option>
                  <option value="Roboto">Roboto (Clean Sans)</option>
                  <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                  <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech/Startup)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Layout Section */}
          <div className="rounded-xl border border-zinc-800 bg-[#181818] p-6">
            <div className="mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <LayoutTemplate size={18} className="text-orange-400" />
              <h3 className="text-lg font-medium">Layout & Shapes</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Border Radius</label>
                <select
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="0px">Sharp (0px)</option>
                  <option value="0.25rem">Small (4px)</option>
                  <option value="0.5rem">Medium (8px)</option>
                  <option value="1rem">Large (16px)</option>
                  <option value="9999px">Pill (Fully Rounded)</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
