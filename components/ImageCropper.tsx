import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Crop, Move } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedUrl: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageUrl, onCrop, onCancel }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const getClientPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const clientPos = getClientPos(e);
    
    // Calculate position relative to the image
    const x = clientPos.x - rect.left;
    const y = clientPos.y - rect.top;

    // Ensure start is within bounds
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

    setStartPos({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !imgRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = imgRef.current.getBoundingClientRect();
    const clientPos = getClientPos(e);
    
    const currX = clientPos.x - rect.left;
    const currY = clientPos.y - rect.top;

    const width = currX - startPos.x;
    const height = currY - startPos.y;

    let finalX = width < 0 ? currX : startPos.x;
    let finalY = height < 0 ? currY : startPos.y;
    let finalW = Math.abs(width);
    let finalH = Math.abs(height);

    // Constrain to image bounds
    if (finalX < 0) { finalW += finalX; finalX = 0; }
    if (finalY < 0) { finalH += finalY; finalY = 0; }
    if (finalX + finalW > rect.width) finalW = rect.width - finalX;
    if (finalY + finalH > rect.height) finalH = rect.height - finalY;

    setCrop({ x: finalX, y: finalY, width: finalW, height: finalH });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const performCrop = () => {
    if (!imgRef.current || !crop || crop.width === 0 || crop.height === 0) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    onCrop(canvas.toDataURL('image/png'));
  };

  return (
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
       <div className="flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
           <div className="flex items-center gap-2 text-white">
             <Crop className="w-5 h-5 text-neutral-400" />
             <span className="font-medium">Crop Image</span>
           </div>
           <div className="flex gap-2">
               <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">
                 <X className="w-3.5 h-3.5"/> Cancel
               </button>
               <button onClick={performCrop} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-black bg-white hover:bg-neutral-200 rounded-lg transition-colors">
                 <Check className="w-3.5 h-3.5"/> Apply
               </button>
           </div>
       </div>
       
       <div 
         className="relative bg-black flex items-center justify-center p-4 cursor-crosshair min-h-[300px] select-none"
         onMouseDown={handleStart}
         onMouseMove={handleMove}
         onMouseUp={handleEnd}
         onMouseLeave={handleEnd}
         onTouchStart={handleStart}
         onTouchMove={handleMove}
         onTouchEnd={handleEnd}
       >
          <div className="relative inline-block">
            <img 
              ref={imgRef} 
              src={imageUrl} 
              className="max-w-full max-h-[60vh] block pointer-events-none" 
              alt="Crop target" 
            />
            {crop && (
              <div 
                  className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.75)]"
                  style={{
                      left: `${crop.x}px`,
                      top: `${crop.y}px`,
                      width: `${crop.width}px`,
                      height: `${crop.height}px`,
                  }}
              />
            )}
            {!crop && !isDragging && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex items-center gap-2 text-white/70 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                        <Move className="w-4 h-4" />
                        <span className="text-xs font-medium">Drag to crop</span>
                    </div>
                </div>
            )}
          </div>
       </div>
    </div>
  );
};
