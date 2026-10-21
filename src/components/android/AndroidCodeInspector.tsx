/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../../data/androidProjectFiles';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  FolderGit2,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AndroidCodeInspector: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = Array.from(new Set(ANDROID_PROJECT_FILES.map((f) => f.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Banner in Luxury Gradient Glass */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/60 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-2">
            <FolderGit2 className="w-4 h-4 text-cyan-400" />
            <span>Native Android Studio Architecture · Kotlin + Jetpack Compose</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Android Studio Project & Source Code
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Every layer of BlueWave Recharge is prepared for native Android compilation:
            Material 3 UI screens, <code>CarryForwardEngine</code> with 64-bit Long byte math,
            Retrofit carrier API interfaces, and JUnit 5 unit test suites.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy File'}</span>
          </button>
          <button
            onClick={handleDownloadFile}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 border border-white/15 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      {/* Main Code Studio Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Project File Tree (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl shadow-black/40 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-black text-white uppercase tracking-widest">
              Project Structure
            </span>
            <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-bold">
              com.bluewave.recharge
            </span>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat} className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                  {cat}
                </span>
                <div className="space-y-1">
                  {ANDROID_PROJECT_FILES.filter((f) => f.category === cat).map((file) => {
                    const isSelected = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">
                          {file.language}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Setup Instructions Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 text-xs text-slate-300 space-y-2">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Build with Gradle
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Open in Android Studio Hedgehog or newer. Run tests using <code className="text-cyan-300 font-mono">./gradlew test</code>.
            </p>
          </div>
        </div>

        {/* Right: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
          {/* File Tab Header */}
          <div className="bg-slate-900/90 px-5 py-3.5 border-b border-white/10 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 font-mono text-cyan-300 font-bold">{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-medium">{selectedFile.description}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200 max-h-[700px] overflow-y-auto selection:bg-blue-600 selection:text-white">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
