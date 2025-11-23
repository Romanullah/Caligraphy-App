import React, { useState, useEffect } from 'react';
import { PenTool, Download } from 'lucide-react';

const Header: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="w-full py-6 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-full">
              <PenTool className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">CalligraphyGen</h1>
            <p className="text-xs text-neutral-400">AI-Powered Typography Art</p>
          </div>
        </div>

        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors border border-neutral-700"
          >
            <Download className="w-4 h-4" />
            Install App
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;