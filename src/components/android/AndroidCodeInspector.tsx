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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
            <FolderGit2 className="w-4 h-4" />
            <span>Native Android Studio Architecture · Kotlin + Jetpack Compose</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Android Studio Project & Source Code
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Every layer of BlueWave Recharge is prepared for native Android compilation:
            Material 3 UI screens, <code>CarryForwardEngine</code> with 64-bit Long byte math,
            Retrofit carrier API interfaces, and JUnit 5 unit test suites.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy File'}</span>
          </button>
          <button
            onClick={handleDownloadFile}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      {/* Main Code Studio Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Project File Tree (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Project Structure
            </span>
            <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
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
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-sm'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
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
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              Build with Gradle
            </p>
            <p className="text-[11px]">
              Open in Android Studio Hedgehog or newer. Run tests using <code>./gradlew test</code>.
            </p>
          </div>
        </div>

        {/* Right: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          {/* File Tab Header */}
          <div className="bg-slate-900/90 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-slate-200">{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400">{selectedFile.description}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
