import { GoogleGenAI } from "@google/genai";
import { GenerateRequest, CalligraphyStyle, FontSize, SubtextStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to determine text color based on background brightness
const getContrastColor = (hexColor: string): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Calculate brightness (YIQ formula)
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

const getStyleDescription = (style: CalligraphyStyle, name: string, textColor: string): string => {
  switch (style) {
    case 'gothic':
      return `Main Text: The name "${name}" masterfully inscribed in a sharp, dramatic ${textColor} Blackletter typeface. Evoking medieval manuscripts, it features diamond-shaped serifs, dense vertical strokes, and an aura of ancient mystery.`;
    case 'minimalist':
      return `Main Text: The name "${name}" presented in an ultra-clean, refined ${textColor} sans-serif font. The design prioritizes negative space, balance, and simplicity, conveying a modern, high-end editorial look with absolutely no clutter.`;
    case 'elegant':
      return `Main Text: The name "${name}" flowing in a luxurious ${textColor} Copperplate or Spencerian script. Expect deep contrast between thick shading strokes and hairline thin flourishes, creating a rhythm of sophistication and grace.`;
    case 'graffiti':
      return `Main Text: The name "${name}" blasted in a dynamic, wildstyle ${textColor} graffiti tag. Use distinct street-art elements: drips, arrows, bubbles, and sharp angles to convey raw urban energy and rebellion.`;
    case 'art-deco':
      return `Main Text: The name "${name}" designed in a lavish ${textColor} Art Deco typeface. Think Great Gatsby: geometric symmetry, sunburst motifs, fan shapes, and tall, condensed letters that exude 1920s glamour and architectural precision.`;
    case 'cyberpunk':
      return `Main Text: The name "${name}" rendered in a futuristic, dystopian ${textColor} font. Incorporate digital glitches, circuit board traces, neon-like glows (even if solid color), and jagged, aggressive angles typical of high-tech sci-fi interfaces.`;
    case 'chalk':
      return `Main Text: The name "${name}" hand-lettered in a dusty, textured ${textColor} chalk style. The strokes should show varying opacity and grain, mimicking the friction of chalk on a slate board, with a slightly rough, organic finish.`;
    case 'retro':
      return `Main Text: The name "${name}" written in a tubular, neon-inspired 1980s synthwave script in ${textColor}. Think Miami Vice or old arcade games: bold curves, chrome-like reflections implied by the shape, and a nostalgic, electric vibe.`;
    case 'abstract':
      return `Main Text: The name "${name}" deconstructed into an avant-garde ${textColor} art piece. The letters should push the boundaries of legibility, using expressive splatters, erratic lines, and form-breaking strokes to convey pure emotion and artistic chaos.`;
    case 'minimalist-geometric':
      return `Main Text: The name "${name}" constructed entirely from fundamental geometric shapes—circles, triangles, and straight lines—in ${textColor}. A Bauhaus-inspired approach where the letters are reduced to their simplest architectural forms.`;
    case 'vintage-script':
      return `Main Text: The name "${name}" penned in an antique, weathered ${textColor} quill script. Capture the essence of an 18th-century love letter or legal document, with slight ink bleeds, variable line weight, and a timeless, historical character.`;
    case 'floral':
      return `Main Text: The name "${name}" blossoming into a botanical illustration in ${textColor}. The letterforms should be partly composed of or intertwined with delicate vines, leaves, and blooming petals, merging typography with nature in a romantic organic flow.`;
    case 'brushstroke':
      return `Main Text: The name "${name}" executed with a wide, bristle-heavy brush in ${textColor}. Capture the "Sumi-e" or dry-brush aesthetic, where the speed and pressure of the hand are visible in the trailing textures and energetic, sweeping gestures.`;
    case 'stencil':
      return `Main Text: The name "${name}" stamped in a rugged, military-grade ${textColor} stencil font. Features distinct bridges (gaps) in the letters, sharp utilitarian edges, and a bold, industrial visual language.`;
    case 'signature':
    default:
      return `Main Text: The name "${name}" signed in a fluid, fast-paced ${textColor} autograph style. It should look personal and authentic, with connected letters and a sweeping underline or flourish that suggests a confident hand.`;
  }
};

const getFontSizeInstruction = (size: FontSize): string => {
  switch (size) {
    case 'small':
      return "Scale: Small. The text should be small and centered, surrounded by a vast amount of negative space. It should look delicate.";
    case 'medium':
      return "Scale: Medium. The text should be balanced in the center, occupying about 40% of the canvas. Standard portrait sizing.";
    case 'large':
      return "Scale: Large. The text should be prominent and bold, occupying about 70% of the canvas. It should be the clear focal point.";
    case 'huge':
      return "Scale: Huge. The text should be massive, filling almost the entire image (90%+), creating a bold, poster-like effect. It can nearly touch the edges.";
    default:
      return "Scale: Large.";
  }
};

const getSubtextStyleDescription = (style: SubtextStyle): string => {
  switch (style) {
    case 'serif':
      return "classic serif font (like Garamond or Times)";
    case 'typewriter':
      return "vintage typewriter or monospaced font";
    case 'handwritten':
      return "simple handwritten print font";
    case 'sans':
    default:
      return "clean sans-serif font (like Arial or Helvetica)";
  }
};

export const generateCalligraphyImage = async (request: GenerateRequest): Promise<string> => {
  const { 
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
  } = request;

  // Use provided text color, or fallback to contrast calculation if empty (though UI enforces a value)
  const mainTextColor = textColor || getContrastColor(backgroundColor);
  
  const styleDescription = getStyleDescription(style, name, mainTextColor);
  const sizeInstruction = getFontSizeInstruction(fontSize);
  const subtextDesc = getSubtextStyleDescription(subtextStyle);

  let prompt = '';
  
  if (referenceImage) {
      // Prompt optimized for style transfer/referencing
      prompt = `
        Use the attached image as a STRICT structural and stylistic reference. 
        Create a new artwork that looks exactly like the style of the provided reference image, BUT replace the text content.
        
        New Main Text: "${name}"
        New Subtext: "${subtext}"
        
        Colors: Use the colors from the reference image, OR override them with Background: ${backgroundColor} and Text: ${mainTextColor} if they differ significantly from the reference.
        
        The composition, font style, and artistic flair should mimic the reference image.
        ${addHeart ? 'Integrate a heart into the design like the reference (or add one if missing).' : ''}
        ${addSplatter ? 'Maintain the textural elements (splatters/grain) of the reference.' : ''}
        ${blurBackground ? 'Apply a soft background blur or tilt-shift effect, ensuring the text remains razor sharp while the background elements are slightly out of focus.' : ''}
        
        Subtext placement: Below main text.
      `;
  } else {
      // Standard generation prompt
      prompt = `
        Create a high-contrast digital typography image.
        Background: Solid color ${backgroundColor}.
        ${styleDescription}
        ${sizeInstruction}
        ${addHeart ? `Style Detail: Integrate a simple, hand-drawn ${mainTextColor} heart outline near or into the text. It should look cohesive with the chosen font style.` : ''}
        
        Subtext: Below the main name, write "${subtext}" in a small, ${subtextDesc}. 
        Subtext Color: ${subtextColor}.
        The subtext should be subtle, legible, and perfectly centered under the main text.
        
        ${addSplatter ? `Texture: Add some artistic ${mainTextColor} paint splatters or speckles at the very bottom or corners of the image to give it texture.` : ''}
        ${blurBackground ? 'Depth of Field: Shallow. The background should be slightly soft or blurred to make the text pop. Even with a solid background, add a subtle vignette or soft focus effect.' : 'Sharpness: High throughout.'}
        
        Overall Vibe: artistic, typographic, high-contrast.
        Ensure the main text is strictly ${mainTextColor} and the background is strictly ${backgroundColor}.
      `;
  }

  const parts: any[] = [];
  
  // If reference image exists, add it to parts
  if (referenceImage) {
      // Extract base64 data (remove "data:image/png;base64," prefix if present)
      const base64Data = referenceImage.split(',')[1];
      const mimeType = referenceImage.split(';')[0].split(':')[1] || 'image/png';
      
      parts.push({
          inlineData: {
              data: base64Data,
              mimeType: mimeType
          }
      });
  }
  
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates.length > 0) {
        const content = response.candidates[0].content;
        if (content && content.parts) {
            for (const part of content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    return `data:${mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
    }

    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};