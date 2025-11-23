import React, { useState, useEffect, useRef } from 'react';
import { GenerateRequest, GenerationStatus, CalligraphyStyle, FontSize, SubtextStyle, AspectRatio } from '../types';
import { Wand2, Heart, Droplets, Type, PenTool, Crown, Minus, Wind, SprayCan, Palette, Gem, Zap, Pencil, Sunset, Square, Smartphone, Monitor, Upload, X, Image as ImageIcon, Shapes, Triangle, Feather, Flower, Paintbrush, Scissors, Aperture } from 'lucide-react';

interface InputFormProps {
  onGenerate: (data: GenerateRequest) => void;
  status: GenerationStatus;
}

const InputForm: React.FC<InputFormProps> = ({ onGenerate, status }) => {
  const [name, setName] = useState('Romanullah');
  const [subtext, setSubtext] = useState('ACTS 16:31');
  const [style, setStyle] = useState<CalligraphyStyle>('signature');
  const [addHeart, setAddHeart] = useState(true);
  const [addSplatter, setAddSplatter] = useState(true);
  const [blurBackground, setBlurBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState<FontSize>('large');
  const [subtextStyle, setSubtextStyle] = useState<SubtextStyle>('sans');
  const [subtextColor, setSubtextColor] = useState('#e5e5e5');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to determine text color based on background brightness (same logic as service)
  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // Update default colors when background changes
  useEffect(() => {
     const contrast = getContrastColor(backgroundColor);
     setSubtextColor(contrast === '#000000' ? '#333333' : '#e5e5e5');
     // We don't force change main text color here to preserve user choice, 
     // but we could provide a "reset" button or check if it was default.
     // For now, let's just default it if it matches the OPPOSITE contrast (invisible)
     if (textColor === backgroundColor) {
        setTextColor(contrast);
     }
  }, [backgroundColor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onGenerate({ 
        name, 
        subtext, 
        style, 
        addHeart, 
        addSplatter, 
        blurBackground,
        backgroundColor, 
        textColor, 
        fontSize,
        subtextStyle,
        subtextColor,
        aspectRatio,
        referenceImage
    });
  };

  const handleAutoTextColor = () => {
    setTextColor(getContrastColor(backgroundColor));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isLoading = status === GenerationStatus.LOADING;

  const styleOptions: { id: CalligraphyStyle; label: string; icon: React.ElementType; description: string }[] = [
    { id: 'signature', label: 'Signature', icon: PenTool, description: 'Flowing, personal brush-script.' },
    { id: 'gothic', label: 'Gothic', icon: Crown, description: 'Bold, medieval blackletter.' },
    { id: 'minimalist', label: 'Minimalist', icon: Minus, description: 'Clean, airy sans-serif.' },
    { id: 'elegant', label: 'Elegant', icon: Wind, description: 'Sophisticated Copperplate script.' },
    { id: 'graffiti', label: 'Graffiti', icon: SprayCan, description: 'Urban street-art tag.' },
    { id: 'art-deco', label: 'Art Deco', icon: Gem, description: '1920s luxury geometric.' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: Zap, description: 'Futuristic, glitchy tech.' },
    { id: 'chalk', label: 'Chalk', icon: Pencil, description: 'Textured, dusty hand-lettering.' },
    { id: 'retro', label: 'Retro', icon: Sunset, description: '80s synthwave vibe.' },
    { id: 'abstract', label: 'Abstract', icon: Shapes, description: 'Expressive, artistic chaos.' },
    { id: 'minimalist-geometric', label: 'Geometric', icon: Triangle, description: 'Shapes and straight lines.' },
    { id: 'vintage-script', label: 'Vintage', icon: Feather, description: 'Antique 19th-century script.' },
    { id: 'floral', label: 'Floral', icon: Flower, description: 'Intertwined with vines and flowers.' },
    { id: 'brushstroke', label: 'Brush', icon: Paintbrush, description: 'Bold, painterly texture.' },
    { id: 'stencil', label: 'Stencil', icon: Scissors, description: 'Industrial, segmented cut-out.' },
  ];

  const subtextStyleOptions: { id: SubtextStyle; label: string; }[] = [
    { id: 'sans', label: 'Sans' },
    { id: 'serif', label: 'Serif' },
    { id: 'typewriter', label: 'Mono' },
    { id: 'handwritten', label: 'Hand' },
  ];

  const aspectRatioOptions: { id: AspectRatio; label: string; icon: React.ElementType }[] = [
    { id: '1:1', label: 'Square', icon: Square },
    { id: '3:4', label: 'Portrait', icon: Smartphone },
    { id: '16:9', label: 'Landscape', icon: Monitor },
  ];

  const colorPresets = [
    '#000000', // Black
    '#FFFFFF', // White
    '#1a0505', // Dark Red
    '#051a0d', // Dark Green
    '#0f172a', // Slate 900
    '#4a044e', // Fuchsia 950
  ];
  
  const textColors = [
      '#FFFFFF', '#000000', '#F59E0B', '#EF4444', '#3B82F6', '#10B981'
  ];

  const fontSizeOptions: FontSize[] = ['small', 'medium', 'large', 'huge'];

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
      <div className="space-y-6">

        {/* Name Input */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-neutral-300">
            Name or Word
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-neutral-600"
              placeholder="e.g. Romanullah"
              maxLength={20}
            />
            <Type className="absolute right-3 top-3.5 w-5 h-5 text-neutral-600" />
          </div>
        </div>
        
        {/* Reference Image Upload */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300 flex justify-between">
                Reference Image (Optional)
                {referenceImage && (
                    <button 
                        type="button" 
                        onClick={clearReferenceImage}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <X className="w-3 h-3" /> Remove
                    </button>
                )}
            </label>
            {!referenceImage ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-800 bg-neutral-950/50 hover:bg-neutral-900 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors gap-2 text-neutral-500 h-24"
                >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Upload image to copy style</span>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                    />
                </div>
            ) : (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-neutral-700 group">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-white text-xs font-medium">Using as style reference</span>
                    </div>
                </div>
            )}
        </div>

        {/* Subtext Input & Styling */}
        <div className="space-y-2">
          <label htmlFor="subtext" className="block text-sm font-medium text-neutral-300">
            Subtext / Verse
          </label>
          <div className="flex flex-col gap-2">
            <input
                id="subtext"
                type="text"
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white outline-none transition-all placeholder:text-neutral-600"
                placeholder="e.g. ACTS 16:31"
                maxLength={30}
            />
            {/* Subtext Toolbar */}
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-2 rounded-xl">
               <div className="flex bg-neutral-900 rounded-lg p-1 gap-1">
                 {subtextStyleOptions.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSubtextStyle(opt.id)}
                        className={`px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${
                            subtextStyle === opt.id 
                            ? 'bg-white text-black shadow-sm' 
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                        title={opt.label}
                    >
                        {opt.label}
                    </button>
                 ))}
               </div>
               <div className="w-px h-6 bg-neutral-800 mx-1"></div>
               <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-neutral-700">
                     <input 
                        type="color" 
                        value={subtextColor}
                        onChange={(e) => setSubtextColor(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer scale-150"
                     />
                     <div 
                        className="w-full h-full"
                        style={{ backgroundColor: subtextColor }}
                     />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300 flex justify-between">
            Artistic Style
            {referenceImage && <span className="text-[10px] text-neutral-500 uppercase">Blended with Image</span>}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {styleOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStyle(opt.id)}
                className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all gap-1.5 hover:z-30 ${
                  style === opt.id
                    ? 'bg-white text-black border-white shadow-lg scale-[1.02] z-10'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200'
                }`}
              >
                <opt.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{opt.label}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[120px] bg-neutral-800 text-white text-[10px] leading-tight p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 border border-neutral-700 shadow-xl text-center">
                    {opt.description}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800"></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Colors (Main & Bg) */}
        <div className="grid grid-cols-2 gap-4">
             {/* Background Color */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-300">
                    Background
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800 h-12">
                     <label className="relative cursor-pointer group flex-shrink-0">
                        <input 
                            type="color" 
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="absolute opacity-0 w-0 h-0"
                        />
                        <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center bg-neutral-800"
                             style={{ backgroundColor }}>
                        </div>
                    </label>
                    <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
                        {colorPresets.slice(0, 3).map(c => (
                            <button key={c} type="button" onClick={() => setBackgroundColor(c)} className="w-6 h-6 rounded-full border border-neutral-800 flex-shrink-0" style={{backgroundColor: c}} />
                        ))}
                    </div>
                </div>
            </div>

             {/* Text Color */}
             <div className="space-y-2">
                <label className="flex items-center justify-between text-sm font-medium text-neutral-300">
                    Text Color
                    <button type="button" onClick={handleAutoTextColor} className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 hover:text-white">AUTO</button>
                </label>
                <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800 h-12">
                     <label className="relative cursor-pointer group flex-shrink-0">
                        <input 
                            type="color" 
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="absolute opacity-0 w-0 h-0"
                        />
                        <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center bg-neutral-800"
                             style={{ backgroundColor: textColor }}>
                        </div>
                    </label>
                    <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
                        {textColors.slice(0, 3).map(c => (
                            <button key={c} type="button" onClick={() => setTextColor(c)} className="w-6 h-6 rounded-full border border-neutral-800 flex-shrink-0" style={{backgroundColor: c}} />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-300">Dimensions</label>
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                {aspectRatioOptions.map((opt) => (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAspectRatio(opt.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                            aspectRatio === opt.id
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-300'
                        }`}
                    >
                        <opt.icon className="w-3.5 h-3.5" />
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Font Size Selection */}
        <div className="space-y-2">
           <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-300">
                Text Scale
              </label>
              <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                {fontSize}
              </span>
           </div>
           <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={fontSizeOptions.indexOf(fontSize)}
              onChange={(e) => setFontSize(fontSizeOptions[parseInt(e.target.value)])}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
           />
        </div>

        {/* Toggles */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAddHeart(!addHeart)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl border transition-all ${
              addHeart
                ? 'bg-neutral-800 border-neutral-600 text-white'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${addHeart ? 'fill-current text-red-500' : ''}`} />
            <span className="text-xs font-medium">Heart</span>
          </button>
          
          <button
            type="button"
            onClick={() => setAddSplatter(!addSplatter)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl border transition-all ${
              addSplatter
                ? 'bg-neutral-800 border-neutral-600 text-white'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Splatter</span>
          </button>

          <button
            type="button"
            onClick={() => setBlurBackground(!blurBackground)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 rounded-xl border transition-all ${
              blurBackground
                ? 'bg-neutral-800 border-neutral-600 text-white'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-neutral-700'
            }`}
          >
            <Aperture className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Blur</span>
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white hover:bg-neutral-200 text-black font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate Artwork</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InputForm;