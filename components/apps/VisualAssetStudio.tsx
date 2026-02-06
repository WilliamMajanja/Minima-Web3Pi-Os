
import React, { useState, useRef } from 'react';
import { generateClusterAssets, generateVeoVideo } from '../../services/geminiService';

const VisualAssetStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [assets, setAssets] = useState<{ type: 'image' | 'video', url: string, prompt: string }[]>([]);
  const [orientation, setOrientation] = useState<'16:9' | '9:16'>('16:9');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleGenerate = async (type: 'image' | 'video') => {
    if (!prompt.trim() || isGenerating) return;
    
    // Check key
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    setIsGenerating(true);
    let url = null;

    if (type === 'image') {
      url = await generateClusterAssets(prompt);
    } else {
      url = await generateVeoVideo(prompt, orientation);
    }

    if (url) {
      setAssets(prev => [{ type, url, prompt }, ...prev]);
      setPrompt('');
    }
    setIsGenerating(false);
  };

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setAssets(prev => [{ type: 'video', url, prompt: 'Screen Capture Session' }, ...prev]);
        
        // Stop all tracks to release resource
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      
      // Stop recording if user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== 'inactive') {
            recorder.stop();
        }
        setIsRecording(false);
      };

    } catch (err) {
      console.error("Screen capture failed:", err);
    }
  };

  const stopScreenCapture = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/80">
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-pink-500/20">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Visual Asset Studio</h1>
            <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Nano Banana Pro + Veo 3 Integration</p>
          </div>
        </div>
        <div className="flex gap-2">
            {!isRecording ? (
              <button 
                onClick={startScreenCapture}
                className="px-3 py-1.5 bg-red-500/10 border border-red-500/50 rounded-lg text-[10px] text-red-400 font-bold uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Record Screen
              </button>
            ) : (
              <button 
                onClick={stopScreenCapture}
                className="px-3 py-1.5 bg-red-600 rounded-lg text-[10px] text-white font-bold uppercase hover:bg-red-700 transition-all animate-pulse"
              >
                Stop Recording
              </button>
            )}
            <button 
              onClick={() => setOrientation(orientation === '16:9' ? '9:16' : '16:9')}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-300 font-bold uppercase hover:bg-white/10"
            >
              Mode: {orientation}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {assets.length === 0 && !isGenerating && !isRecording && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
            <div className="w-32 h-32 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center text-5xl">🎨</div>
            <p className="max-w-xs text-sm font-medium">Generate high-fidelity OS screenshots or record workflows for Agentic training.</p>
          </div>
        )}

        {isRecording && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Recording Active Environment...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset, i) => (
            <div key={i} className="glass-dark border border-white/10 rounded-3xl overflow-hidden group relative">
              {asset.type === 'image' ? (
                <img src={asset.url} className="w-full aspect-video object-cover" />
              ) : (
                <video src={asset.url} controls className="w-full aspect-video object-cover" />
              )}
              <div className="p-4 bg-black/60 backdrop-blur-md">
                <div className="flex justify-between items-start">
                   <p className="text-[10px] text-white font-mono opacity-80 truncate flex-1">{asset.prompt}</p>
                   {asset.type === 'video' && asset.prompt === 'Screen Capture Session' && (
                     <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase">REC</span>
                   )}
                </div>
                <div className="mt-2 flex gap-2">
                  <a href={asset.url} download={`web3pios-asset-${i}.png`} className="text-[9px] font-bold text-pink-400 uppercase tracking-widest hover:text-white transition-colors">Download</a>
                  {asset.type === 'video' && (
                    <button className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                      <span>Analyze with Agent</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isGenerating && (
          <div className="flex flex-col items-center justify-center p-12 glass-dark rounded-3xl border border-white/10 border-dashed animate-pulse">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-xs font-bold text-pink-400 uppercase tracking-[0.3em]">Synthesizing Neural Visuals...</span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10 bg-black/40">
        <div className="flex gap-3">
          <input 
            className="flex-1 glass-dark border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all shadow-2xl"
            placeholder="Describe the OS component or cluster visualization you want to generate..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          <button 
            onClick={() => handleGenerate('image')}
            disabled={isGenerating || isRecording}
            className="px-6 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            Gen Image
          </button>
          <button 
            onClick={() => handleGenerate('video')}
            disabled={isGenerating || isRecording}
            className="px-6 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-pink-900/40 disabled:opacity-50"
          >
            Gen Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualAssetStudio;
