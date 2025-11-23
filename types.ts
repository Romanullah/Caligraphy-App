export type CalligraphyStyle = 'signature' | 'gothic' | 'minimalist' | 'elegant' | 'graffiti' | 'art-deco' | 'cyberpunk' | 'chalk' | 'retro' | 'abstract' | 'minimalist-geometric' | 'vintage-script' | 'floral' | 'brushstroke' | 'stencil';

export type FontSize = 'small' | 'medium' | 'large' | 'huge';

export type SubtextStyle = 'sans' | 'serif' | 'typewriter' | 'handwritten';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

export interface GenerateRequest {
  name: string;
  subtext: string;
  style: CalligraphyStyle;
  addSplatter: boolean;
  addHeart: boolean;
  blurBackground: boolean;
  backgroundColor: string;
  textColor: string;
  fontSize: FontSize;
  subtextStyle: SubtextStyle;
  subtextColor: string;
  aspectRatio: AspectRatio;
  referenceImage: string | null; // Base64 string of uploaded image
}

export interface GenerateResult {
  imageUrl: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}