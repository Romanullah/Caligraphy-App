import React, { useState, useEffect } from 'react';
import { GenerationStatus, GenerateRequest } from '../types';
import { Download, Maximize2, Crop as CropIcon, AlertTriangle } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

interface ResultDisplayProps {
  imageUrl: string | null;
  status: GenerationStatus;
  error: string | null;
  requestData: GenerateRequest | null;
}

const getFriendlyError = (rawError: string | null) => {
  const err = (rawError || "").toLowerCase();

  if (err.includes('safety') || err.includes('blocked') || err.includes('policy')) {
    return {
      title: 'Content Policy Violation',
      message: 'The AI could not generate this image due to safety guidelines.',
      suggestion: 'Try adjusting your prompt, removing potentially sensitive words, or using a different style.'
    };
  }
  
  if (err.includes('quota') || err.includes('429') || err.includes('limit') || err.includes('resource exhausted')) {
    return {
      title: 'Usage Limit Exceeded',
      message: 'The API rate limit has been reached.',
      suggestion: 'Please wait a moment before trying again.'
    };
  }

  if (err.includes('key') || err.includes('401') || err.includes('403') || err.includes('permission') || err.includes('unauthenticated')) {
    return {
      title: 'Authorization Error',
      message: 'There is an issue with the API authentication.',
      suggestion: 'Please check your API key configuration.'
    };
  }

  if (err.includes('network') || err.includes('fetch') || err.includes('connect') || err.includes('failed to fetch')) {
     return {
      title: 'Connection Issue',
      message: 'Could not connect to the AI service.',
      suggestion: 'Check your internet connection and try again.'
    };
  }
  
  if (err.includes('no image data') || err.includes('candidate')) {
      return {
          title: 'Generation Empty',
          message: 'The AI returned a response but no image was generated.',
          suggestion: 'This often happens with complex prompts. Try simplifying your request or checking the reference image.'
      }
  }

  return {
    title: 'Generation Failed',
    message: rawError || 'An unexpected error occurred.',
    suggestion: 'Please try again or change your settings.'
  };
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ imageUrl, status, error, requestData }) => {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);

  useEffect(() => {
    setLocalImageUrl(imageUrl);
    setIsCropping(false);
    
    if (imageUrl) {
        setShowShimmer(true);
        // Run animation for 2 seconds then stop
        const timer = setTimeout(() => setShowShimmer(false), 2000);
        return () => clearTimeout(timer);
    }
  }, [imageUrl]);
  
  const handleDownload = () => {
    if (!localImageUrl) return;
    
    // Construct descriptive filename
    let filename = `calligraphy-art-${Date.now()}.png`;
    
    if (requestData) {
        // Sanitize name for filename
        const safeName = requestData.name.replace(/[^a-z0-9]/gi, '_');
        // Capitalize style for better readability
        const styleName = requestData.style.charAt(0).toUpperCase() + requestData.style.slice(1);
        filename = `${safeName}_${styleName}_Style.png`;
    }

    const link = document.createElement('a');
    link.href = localImageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCropComplete = (croppedUrl: string) => {
    setLocalImageUrl(croppedUrl);
    setIsCropping(false);
  };

  if (status === GenerationStatus.ERROR) {
    const friendly = getFriendlyError(error);
    return (
      <div className="w-full aspect-square max-w-md bg-neutral-900/50 border border-red-900/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="p-4 bg-red-900/20 text-red-400 rounded-full mb-4 ring-1 ring-red-900/40">
            <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{friendly.title}</h3>
        <p className="text-neutral-400 text-sm mb-6 max-w-xs leading-relaxed">{friendly.message}</p>
        
        <div className="w-full bg-neutral-900/80 rounded-xl p-3 border border-neutral-800 text-left">
             <p className="text-xs text-neutral-500 font-medium uppercase mb-1">Suggestion</p>
             <p className="text-sm text-neutral-300">{friendly.suggestion}</p>
        </div>
      </div>
    );
  }

  if (status === GenerationStatus.LOADING) {
    return (
      <div className="w-full aspect-square max-w-md bg-neutral-900 rounded-2xl flex flex-col items-center justify-center p-8 border border-neutral-800 relative overflow-hidden group">
         {/* Animated skeleton effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-900 animate-pulse opacity-50" />
        
        <div className="relative z-10 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="text-neutral-400 font-light tracking-wide animate-pulse">Creating your masterpiece...</p>
        </div>
      </div>
    );
  }

  if (isCropping && localImageUrl) {
    return (
        <ImageCropper 
            imageUrl={localImageUrl} 
            onCrop={handleCropComplete} 
            onCancel={() => setIsCropping(false)} 
        />
    );
  }

  if (!localImageUrl) {
    return (
      <div className="w-full aspect-square max-w-md bg-neutral-900/30 border border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-neutral-600 p-6">
        <div className="p-4 bg-neutral-900 rounded-full mb-4">
            <Maximize2 className="w-6 h-6 opacity-50" />
        </div>
        <p className="text-sm">Your art will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4 animate-in fade-in zoom-in duration-500">
      <div className="relative group rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-black">
        
        {/* Shimmer Animation Styles */}
        <style>{`
            @keyframes shimmer {
                0% { transform: translateX(-150%) skewX(-20deg); }
                100% { transform: translateX(150%) skewX(-20deg); }
            }
            .animate-shimmer {
                animation: shimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
        `}</style>

        <img 
          src={localImageUrl} 
          alt="Generated Calligraphy" 
          className="w-full h-full object-contain"
        />
        
        {/* Shimmer Overlay */}
        {showShimmer && (
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm z-30">
          <button 
            onClick={() => setIsCropping(true)}
            className="p-3 bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all shadow-lg border border-white/20"
            title="Crop"
          >
            <CropIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={handleDownload}
            className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg"
            title="Download"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
         <button 
            onClick={() => setIsCropping(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-all"
         >
            <CropIcon className="w-4 h-4" />
            Crop
         </button>
         <button 
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
         >
            <Download className="w-4 h-4" />
            Download
         </button>
      </div>
    </div>
  );
};

export default ResultDisplay;