export type ElementType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'heart' | 'lightning' | 'rocket' | 'text' | 'image' | 'pentagon' | 'hexagon' | 'octagon' | 'cross' | 'dashed-line' | 'curved-arrow' | 'speech-bubble' | 'cloud' | 'checkmark' | 'cog' | 'shield';

export type AnimationType = 'none' | 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'pulse' | 'bounce' | 'zoomIn' | 'zoomOut' | 'rotate' | 'shake' | 'jello';
export type AnimationDirection = 'top' | 'bottom' | 'left' | 'right';
export type AnimationIteration = '1' | 'infinite';
export type AnimationTrigger = 'onLoad' | 'onHover' | 'onLoadAndHover';

export interface Animation {
  type: AnimationType;
  duration: number; // in seconds
  delay: number; // in seconds
  direction: AnimationDirection;
  iteration: AnimationIteration;
  trigger: AnimationTrigger;
}

export interface Effects {
  opacity: number; // 0-100
  brightness: number; // 0-200, 100 is default
  contrast: number; // 0-200, 100 is default
  saturate: number; // 0-200, 100 is default
  grayscale: number; // 0-100
  sepia: number; // 0-100
  invert: number; // 0-100
  hueRotate: number; // 0-360
  blur: number; // 0-20 (px)
  dropShadow: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
    enabled: boolean;
  };
  textStroke?: {
    width: number;
    color: string;
    enabled: boolean;
  };
}

export interface EffectPreset {
  name: string;
  type: 'all' | 'image' | 'text';
  effects: Partial<Effects>;
}

export type Selection = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'keep' | 'remove';
};


interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  borderRadius?: number | { tl: number; tr: number; br: number; bl: number; };
  animation?: Animation;
  effects?: Partial<Effects>;
}

export interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'heart' | 'lightning' | 'rocket' | 'pentagon' | 'hexagon' | 'octagon' | 'cross' | 'dashed-line' | 'curved-arrow' | 'speech-bubble' | 'cloud' | 'checkmark' | 'cog' | 'shield';
  fill?: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextElement extends BaseElement {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | 400 | 700;
    color: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
}

export interface ImageElement extends BaseElement {
    type: 'image';
    src: string;
    originalSrc?: string;
    naturalWidth?: number;
    naturalHeight?: number;
    crop?: {
      x: number; // percentage
      y: number; // percentage
      width: number; // percentage
      height: number; // percentage
    };
}

export type CanvasElement = ShapeElement | TextElement | ImageElement;

export interface Template {
    name: string;
    description: string;
    category: string;
    tags: string[];
    status?: 'novo' | 'premium';
    canvasSize: { width: number; height: number };
    elements: CanvasElement[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string; // e.g., Fundo, Ícone, Imagem
  tags: string[];
  status: 'pro' | 'free';
  src: string; // image source for the gallery item
  elementData: Partial<CanvasElement>; // data to create the element on canvas
}

export interface HistoryItem {
    id: string;
    savedAt: string;
    previewImage: string; // base64 data URL
    state: {
        elements: CanvasElement[];
        canvasSize: { width: number; height: number };
        selectedSizePreset: string;
    };
}

// FIX: Omit on a union type can break discriminated union checking for object literals.
// By distributing Omit over each member of the CanvasElement union, we help TypeScript
// correctly infer types and avoid errors for properties like 'fill', 'text', and 'src'.
export type VisualEffectElement =
  | Omit<ShapeElement, 'id'>
  | Omit<TextElement, 'id'>
  | Omit<ImageElement, 'id'>;

export interface VisualEffect {
    name: string;
    category: string;
    thumbnail: string; // URL or data URI for preview
    elements: VisualEffectElement[];
}

export type MainTab = 'Editor' | 'Templates' | 'Gallery' | 'History' | 'Adjustments' | 'VisualEffects';