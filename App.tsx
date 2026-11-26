
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { CanvasElement, ElementType, TextElement, ImageElement, ShapeElement, Animation, Template, HistoryItem, Selection, Effects, MainTab, VisualEffect } from './types';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Canvas from './components/Canvas';
import { initialElements, BANNER_SIZES } from './constants';
import { useHistory } from './hooks/useHistory';
import GifPreviewModal from './components/GifPreviewModal';
import TemplatesPanel from './components/TemplatesPanel';
import GalleryPanel from './components/GalleryPanel';
import CropModal from './components/CropModal';
import WatermarkRemovalModal from './components/WatermarkRemovalModal';
import HistoryPanel from './components/HistoryPanel';
import { ChevronLeftIcon, ChevronRightIcon } from './components/icons/Icons';
import EffectsPanel from './components/EffectsPanel';
import BackgroundChangeModal from './components/BackgroundChangeModal';
import VisualEffectsPanel from './components/VisualEffectsPanel';

declare const html2canvas: any;
declare const GIF: any;
declare const JSZip: any;

// Helper to fetch and Base64 encode images for SVG embedding
const toBase64 = async (url: string) => {
    try {
        // Use a proxy for picsum.photos to avoid tainted canvas issues if possible
        const proxyUrl = url.includes('picsum.photos') ? `https://cors-anywhere.herokuapp.com/${url}` : url;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error converting image to Base64:", error);
        // Fallback or alert the user
        return url; 
    }
};

const urlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
    // If it's already a data URL
    if (url.startsWith('data:')) {
        const parts = url.split(',');
        const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        return { base64: parts[1], mimeType };
    }
    // If it's a web URL
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: blob.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const urlToBlob = async (url: string): Promise<{ blob: Blob; extension: string }> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/png';
    const extension = mimeType.split('/')[1]?.split('+')[0] || 'png'; // Handle things like image/svg+xml
    return { blob, extension: extension === 'jpeg' ? 'jpg' : extension };
};


const loadInitialState = () => {
    try {
        const savedStateJSON = localStorage.getItem('react-banner-editor-state');
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            if (savedState && Array.isArray(savedState.elements) && savedState.canvasSize) {
                return savedState;
            }
        }
    // FIX: Renamed 'error' to 'err' to avoid a potential naming conflict or toolchain issue.
    } catch (err) {
        console.error("Failed to load saved state:", err);
        localStorage.removeItem('react-banner-editor-state');
    }
    return {
        elements: initialElements,
        canvasSize: { width: 1200, height: 400 },
        selectedSizePreset: '1200x400'
    };
};

const generateCssFilter = (effects: Partial<Effects> = {}): string => {
  const filters: string[] = [];
  if (effects.brightness !== undefined && effects.brightness !== 100) filters.push(`brightness(${effects.brightness}%)`);
  if (effects.contrast !== undefined && effects.contrast !== 100) filters.push(`contrast(${effects.contrast}%)`);
  if (effects.saturate !== undefined && effects.saturate !== 100) filters.push(`saturate(${effects.saturate}%)`);
  if (effects.grayscale !== undefined && effects.grayscale > 0) filters.push(`grayscale(${effects.grayscale}%)`);
  if (effects.sepia !== undefined && effects.sepia > 0) filters.push(`sepia(${effects.sepia}%)`);
  if (effects.invert !== undefined && effects.invert > 0) filters.push(`invert(${effects.invert}%)`);
  if (effects.hueRotate !== undefined && effects.hueRotate > 0) filters.push(`hue-rotate(${effects.hueRotate}deg)`);
  if (effects.blur !== undefined && effects.blur > 0) filters.push(`blur(${effects.blur}px)`);
  if (effects.dropShadow?.enabled) {
    const { offsetX, offsetY, blur, color } = effects.dropShadow;
    filters.push(`drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${color})`);
  }
  return filters.join(' ');
};


const App: React.FC = () => {
  const [initialState] = useState(loadInitialState);
  const [elements, setElements, undo, redo, canUndo, canRedo] = useHistory<CanvasElement[]>(initialState.elements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, initialPan: { x: 0, y: 0 } });
  
  const [canvasSize, setCanvasSize] = useState(initialState.canvasSize);
  const [selectedSizePreset, setSelectedSizePreset] = useState(initialState.selectedSizePreset);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState<false | 'mp4'>(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [isPreviewingGif, setIsPreviewingGif] = useState(false);
  const [gifPreviewUrl, setGifPreviewUrl] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState('');
  const [animationSeekTime, setAnimationSeekTime] = useState<number | null>(null);
  const cancelExportRef = useRef<() => void>(() => {});
  
  const [isPreviewingMobile, setIsPreviewingMobile] = useState(false);
  const originalSizeRef = useRef({ width: canvasSize.width, height: canvasSize.height, preset: selectedSizePreset });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [mainTab, setMainTab] = useState<MainTab>('Templates');
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [croppingElementId, setCroppingElementId] = useState<string | null>(null);
  const [watermarkRemovalElementId, setWatermarkRemovalElementId] = useState<string | null>(null);
  const [backgroundChangeElementId, setBackgroundChangeElementId] = useState<string | null>(null);
  const [processingElementId, setProcessingElementId] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [exportResolution, setExportResolution] = useState<'current' | 'hd' | 'fhd' | '2k'>('current');
  
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(256); // w-64
  const [rightSidebarWidth, setRightSidebarWidth] = useState(288); // w-72
  const isResizingRef = useRef<null | 'left' | 'right'>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
    }
    return 'light';
  });

  const [canvasBgStyle, setCanvasBgStyle] = useState({});

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
     // Delay to ensure CSS variables are applied
    setTimeout(() => {
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--color-canvas-grid').trim();
        if (gridColor) {
            setCanvasBgStyle({
                backgroundSize: '15px 15px',
                backgroundImage: `radial-gradient(${gridColor} 1px, transparent 0)`,
            });
        }
    }, 50);

  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };


  const MIN_SIDEBAR_WIDTH = 200;
  const MAX_SIDEBAR_WIDTH = 500;

  // FIX: Renamed handleMouseMove to handleResizeMouseMove to avoid redeclaration.
  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
      if (!isResizingRef.current) return;
      
      const dx = e.clientX - startXRef.current;
      
      if (isResizingRef.current === 'left') {
          const newWidth = startWidthRef.current + dx;
          setLeftSidebarWidth(Math.max(MIN_SIDEBAR_WIDTH, Math.min(newWidth, MAX_SIDEBAR_WIDTH)));
      } else { // 'right'
          const newWidth = startWidthRef.current - dx;
          setRightSidebarWidth(Math.max(MIN_SIDEBAR_WIDTH, Math.min(newWidth, MAX_SIDEBAR_WIDTH)));
      }
  }, []);

  // FIX: Renamed handleMouseUp to handleResizeMouseUp to avoid redeclaration.
  const handleResizeMouseUp = useCallback(() => {
      isResizingRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleResizeMouseMove);
      window.removeEventListener('mouseup', handleResizeMouseUp);
  }, [handleResizeMouseMove]);

  const handleMouseDownOnResizer = useCallback((e: React.MouseEvent, sidebar: 'left' | 'right') => {
      e.preventDefault();
      isResizingRef.current = sidebar;
      startXRef.current = e.clientX;
      startWidthRef.current = sidebar === 'left' ? leftSidebarWidth : rightSidebarWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);
  }, [leftSidebarWidth, rightSidebarWidth, handleResizeMouseMove, handleResizeMouseUp]);
  
  useEffect(() => {
    return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [handleResizeMouseMove, handleResizeMouseUp]);


  const getExportDimensions = () => {
    const targetSizes = {
        hd: { width: 1280, height: 720 },
        fhd: { width: 1920, height: 1080 },
        '2k': { width: 2560, height: 1440 }
    };

    if (exportResolution === 'current') {
        return {
            width: canvasSize.width,
            height: canvasSize.height,
            scale: 1,
            outerWidth: canvasSize.width,
            outerHeight: canvasSize.height,
        };
    }

    const target = targetSizes[exportResolution];
    const canvasAspectRatio = canvasSize.width / canvasSize.height;
    const targetAspectRatio = target.width / target.height;

    let outputWidth, outputHeight;

    if (canvasAspectRatio > targetAspectRatio) {
        // Canvas is wider than target, fit to width
        outputWidth = target.width;
        outputHeight = target.width / canvasAspectRatio;
    } else {
        // Canvas is taller or same aspect ratio, fit to height
        outputHeight = target.height;
        outputWidth = target.height * canvasAspectRatio;
    }

    return {
        width: Math.round(outputWidth),
        height: Math.round(outputHeight),
        scale: outputWidth / canvasSize.width,
        outerWidth: target.width,
        outerHeight: target.height,
    };
  };

  useEffect(() => {
    try {
        const savedHistoryJSON = localStorage.getItem('react-banner-editor-history');
        if (savedHistoryJSON) {
            const savedHistory = JSON.parse(savedHistoryJSON);
            if (Array.isArray(savedHistory)) {
                setHistoryItems(savedHistory);
            }
        }
    } catch (err) {
        console.error("Failed to load history:", err);
    }
  }, []);

  const addElement = useCallback((type: ElementType, options: Partial<CanvasElement> = {}) => {
    const { effects: optionsEffects, ...restOfOptions } = options;

    const baseElement = {
      id: `${type}-${Date.now()}`,
      x: 150,
      y: 100,
      rotation: 0,
      locked: false,
      animation: {
        type: 'none' as const,
        duration: 1,
        delay: 0,
        direction: 'left' as const,
        iteration: '1' as const,
        trigger: 'onLoad' as const,
      },
      effects: {
        opacity: 100,
        brightness: 100,
        contrast: 100,
        saturate: 100,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        hueRotate: 0,
        blur: 0,
        dropShadow: {
          offsetX: 0,
          offsetY: 2,
          blur: 4,
          color: '#00000080',
          enabled: false,
        },
        textStroke: {
          width: 0,
          color: '#000000',
          enabled: false,
        },
        ...optionsEffects
      }
    };

    let newElement: CanvasElement;

    if (type === 'text') {
      const textDefaults: Omit<TextElement, keyof typeof baseElement | 'id' | 'effects'> = {
            type: 'text',
            width: 200,
            height: 50,
            text: 'Double Click to Edit',
            fontSize: 24,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            color: theme === 'dark' ? '#ffffff' : '#1e293b',
            textAlign: 'center',
      };
      const textOptions = restOfOptions as Partial<TextElement>;
      newElement = { ...baseElement, ...textDefaults, ...textOptions };
      if (textOptions.fontSize) {
          newElement.height = textOptions.fontSize * 1.5;
      }
      if (textOptions.text && textOptions.fontSize) {
          newElement.width = textOptions.text.length * (textOptions.fontSize) * 0.6;
      }

    } else if (type === 'image') {
        const imageOptions = restOfOptions as Partial<ImageElement>;
        const placeholderSrc = `https://picsum.photos/seed/${Date.now()}/200/150`;

        newElement = {
            ...baseElement,
            type: 'image',
            width: 200,
            height: 150,
            src: placeholderSrc,
            naturalWidth: imageOptions.naturalWidth || 200,
            naturalHeight: imageOptions.naturalHeight || 150,
            ...imageOptions
        };
    } 
    else {
      const shapeDefaults = {
        width: type === 'circle' ? 100 : 150,
        height: 100,
        stroke: theme === 'dark' ? '#ffffff' : '#1e293b',
        strokeWidth: 2,
      };
      
      const lineTypes: ElementType[] = ['line', 'arrow', 'dashed-line', 'curved-arrow'];

      newElement = {
        ...baseElement,
        type: type,
        ...shapeDefaults,
        ...(!lineTypes.includes(type) && { fill: '#3b82f6' }),
        ...(restOfOptions as Partial<ShapeElement>)
      };
    }
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, [setElements, theme]);

  const handleAddVisualEffect = useCallback((effect: VisualEffect) => {
      const newElements: CanvasElement[] = effect.elements.map((el, index) => {
          const baseId = `${el.type}-${Date.now()}`;
          return {
              ...el,
              id: `${baseId}-${index}`,
          } as CanvasElement;
      });
      setElements(prev => [...prev, ...newElements]);
      setMainTab('Editor');
  }, [setElements]);

  const updateElement = useCallback((id: string, updatedProps: Partial<CanvasElement>) => {
    setElements((prevElements) =>
      prevElements.map((el) => {
        if (el.id === id) {
          // Deep merge effects to avoid overwriting nested objects
          const newEffects = { ...el.effects, ...updatedProps.effects };
          if (updatedProps.effects?.dropShadow) {
            newEffects.dropShadow = { ...el.effects?.dropShadow, ...updatedProps.effects.dropShadow };
          }
          if (updatedProps.effects?.textStroke) {
            newEffects.textStroke = { ...el.effects?.textStroke, ...updatedProps.effects.textStroke };
          }
          return { ...el, ...updatedProps, effects: newEffects } as CanvasElement;
        }
        return el;
      })
    );
  }, [setElements]);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) {
        setSelectedElementId(null);
    }
  }, [setElements, selectedElementId]);

  const duplicateElement = useCallback((id: string) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (elementToDuplicate) {
        const newElement = {
            ...elementToDuplicate,
            id: `${elementToDuplicate.type}-${Date.now()}`,
            x: elementToDuplicate.x + 20,
            y: elementToDuplicate.y + 20,
        };
        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
    }
  }, [elements, setElements]);
  
  const handleReorderElements = useCallback((reorderedElements: CanvasElement[]) => {
    setElements(reorderedElements);
  }, [setElements]);

  const handleLoadTemplate = useCallback((template: Template) => {
      setCanvasSize(template.canvasSize);
      setElements(template.elements);
      const { width, height } = template.canvasSize;
      const matchingPreset = BANNER_SIZES.find(s => s.width === width && s.height === height);
      setSelectedSizePreset(matchingPreset ? `${width}x${height}` : 'custom');
      setSelectedElementId(null);
      setMainTab('Editor');
  }, [setElements, setCanvasSize, setSelectedSizePreset, setSelectedElementId, setMainTab]);
  
    const handleSelectElement = (id: string | null) => {
        if (id !== selectedElementId) {
            setSelectedElementId(id);
        }
        // Stop editing if we select another element or deselect all
        if (editingElementId && id !== editingElementId) {
            setEditingElementId(null);
        }
    };
  
  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const croppingElement = elements.find(el => el.id === croppingElementId) as ImageElement | undefined;
  const watermarkRemovalElement = elements.find(el => el.id === watermarkRemovalElementId) as ImageElement | undefined;
  const backgroundChangeElement = elements.find(el => el.id === backgroundChangeElementId) as ImageElement | undefined;

  const handleCropCancel = () => {
    setCroppingElementId(null);
  };
  
  const handleCropConfirm = (id: string, cropData: ImageElement['crop']) => {
    updateElement(id, { crop: cropData });
    setCroppingElementId(null);
  };

  const handleFitImageToCanvas = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element || element.type !== 'image') return;

    updateElement(elementId, {
      x: 0,
      y: 0,
      width: canvasSize.width,
      height: canvasSize.height,
      rotation: 0,
    });
  };
  
  const handleRemoveBackground = async (elementId: string) => {
    const element = elements.find(el => el.id === elementId) as ImageElement | undefined;
    if (!element) return;

    // Handle restore
    if (element.originalSrc) {
        const img = new Image();
        img.onload = () => {
             const newHeight = (img.naturalHeight / img.naturalWidth) * element.width;
             updateElement(elementId, { 
                src: element.originalSrc, 
                originalSrc: undefined,
                height: newHeight,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
            });
        };
        img.src = element.originalSrc;
        return;
    }

    setProcessingElementId(elementId);
    try {
        const { base64, mimeType } = await urlToBase64(element.src);
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: 'Analyze the image to identify the primary subject. Create a new image where the background is completely transparent, leaving only the main subject intact. Ensure the edges of the subject are clean and precise.',
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let newBase64Data: string | undefined;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                newBase64Data = part.inlineData.data;
                break;
            }
        }

        if (newBase64Data) {
            const newSrc = `data:image/png;base64,${newBase64Data}`;
            const img = new Image();
            img.onload = () => {
                const newHeight = (img.naturalHeight / img.naturalWidth) * element.width;
                 updateElement(elementId, {
                    src: newSrc,
                    originalSrc: element.src, // Save the original
                    height: newHeight,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    crop: undefined, // Reset crop as dimensions might change implicitly
                });
            }
            img.src = newSrc;
        } else {
            throw new Error("API did not return an image.");
        }

    } catch (error) {
        console.error("Failed to remove background:", error);
        alert("Sorry, the background could not be removed. Please try again.");
    } finally {
        setProcessingElementId(null);
    }
  };

  const handleRemoveWatermark = (elementId: string) => {
    const element = elements.find(el => el.id === elementId) as ImageElement | undefined;
    if (element && !element.originalSrc) {
        setWatermarkRemovalElementId(elementId);
    }
  };

  const handleCancelWatermarkRemoval = () => {
    setWatermarkRemovalElementId(null);
  };

  const handleConfirmWatermarkRemoval = async (elementId: string, selection: { x: number; y: number; width: number; height: number; }) => {
    const element = elements.find(el => el.id === elementId) as ImageElement | undefined;
    if (!element) return;

    setWatermarkRemovalElementId(null);
    setProcessingElementId(elementId);
    try {
        const { base64, mimeType } = await urlToBase64(element.src);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const prompt = `Analyze the image. A watermark has been identified within a specific bounding box. Your task is to meticulously remove this watermark. The bounding box is defined by these coordinates (in pixels, from the top-left corner): x=${Math.round(selection.x)}, y=${Math.round(selection.y)}, width=${Math.round(selection.width)}, height=${Math.round(selection.height)}. You must reconstruct the area behind the watermark so that it blends seamlessly with the surrounding content. Ensure the final image is clean and shows no trace of the original watermark.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });


        let newBase64Data: string | undefined;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                newBase64Data = part.inlineData.data;
                break;
            }
        }

        if (newBase64Data) {
            const newSrc = `data:image/png;base64,${newBase64Data}`;
            const img = new Image();
            img.onload = () => {
                const newHeight = (img.naturalHeight / img.naturalWidth) * element.width;
                 updateElement(elementId, {
                    src: newSrc,
                    originalSrc: element.src, // Save the original
                    height: newHeight,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    crop: undefined,
                });
            }
            img.src = newSrc;
        } else {
            throw new Error("API did not return an image.");
        }

    } catch (error) {
        console.error("Failed to remove watermark:", error);
        alert("Sorry, the watermark could not be removed. Please try again.");
    } finally {
        setProcessingElementId(null);
    }
  };

  const handleConfirmBackgroundChange = async (
    elementId: string,
    selections: Selection[],
    newBackground: { type: 'color'; value: string; } | { type: 'image'; value: string; }
) => {
    const element = elements.find(el => el.id === elementId) as ImageElement | undefined;
    if (!element) return;

    setBackgroundChangeElementId(null);
    setProcessingElementId(elementId);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const mainImage = await urlToBase64(element.src);
        
        let prompt: string;
        const parts: any[] = [{
            inlineData: { data: mainImage.base64, mimeType: mainImage.mimeType }
        }];

        const keepSelections = selections.filter(s => s.type === 'keep');
        const removeSelections = selections.filter(s => s.type === 'remove');

        const formatBox = (s: Selection) => `{x: ${Math.round(s.x)}, y: ${Math.round(s.y)}, width: ${Math.round(s.width)}, height: ${Math.round(s.height)}}`;
        const keepText = keepSelections.length > 0 ? `Subjects to KEEP are in boxes: ${keepSelections.map(formatBox).join(', ')}.` : '';
        const removeText = removeSelections.length > 0 ? `Areas to REMOVE are in boxes: ${removeSelections.map(formatBox).join(', ')}.` : '';

        const basePrompt = `You are an expert image editor. The user has provided an image and specified areas to keep and/or remove. Your task is to isolate the subjects defined by the 'KEEP' boxes and remove any areas defined by the 'REMOVE' boxes to create a clean foreground layer. ${keepText} ${removeText}`;

        if (newBackground.type === 'color') {
            prompt = `${basePrompt} Then, place this foreground layer onto a new background of a solid color: ${newBackground.value}. The final output must be a single, perfectly composited image.`;
            parts.push({ text: prompt });
        } else { // 'image'
            const bgImage = await urlToBase64(newBackground.value);
            prompt = `${basePrompt} Then, place this foreground layer onto the second image provided (the new background). Ensure the subjects are blended naturally. The final output must be a single, perfectly composited image.`;
            parts.push({
                inlineData: { data: bgImage.base64, mimeType: bgImage.mimeType }
            });
            parts.push({ text: prompt });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let newBase64Data: string | undefined;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                newBase64Data = part.inlineData.data;
                break;
            }
        }

        if (newBase64Data) {
            const newSrc = `data:image/png;base64,${newBase64Data}`;
            const img = new Image();
            img.onload = () => {
                const newHeight = (img.naturalHeight / img.naturalWidth) * element.width;
                updateElement(elementId, {
                    src: newSrc,
                    originalSrc: element.originalSrc || element.src, // Preserve the very first original
                    height: newHeight,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    crop: undefined,
                });
            }
            img.src = newSrc;
        } else {
            throw new Error("API did not return an image.");
        }

    } catch (error) {
        console.error("Failed to change background:", error);
        alert("Sorry, the background could not be changed. Please try again.");
    } finally {
        setProcessingElementId(null);
    }
};


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPanning(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const handleGenerateGifPreview = async () => {
        setIsPreviewingGif(true);
        setExportProgress(0);
        setGifPreviewUrl(null);
        setSelectedElementId(null);
        
        const isExportCancelled = useRef(false);
        cancelExportRef.current = () => {
            isExportCancelled.current = true;
            setAnimationSeekTime(null);
        };

        const canvasToCapture = canvasRef.current;
        if (!canvasToCapture) {
            setIsPreviewingGif(false);
            return;
        }

        const { width, height, scale, outerWidth, outerHeight } = getExportDimensions();

        const maxDuration = elements.reduce((max, el) => {
            const anim = el.animation;
            if (anim && anim.type !== 'none' && anim.iteration !== 'infinite' && (anim.trigger === 'onLoad' || anim.trigger === 'onLoadAndHover')) {
                return Math.max(max, (anim.delay + anim.duration) * 1000);
            }
            return max;
        }, 3000);

        const frameRate = 20;
        const frameDelay = 1000 / frameRate;
        const totalFrames = Math.ceil(maxDuration / frameDelay);
        const html2canvasOptions = { scale, useCORS: true, backgroundColor: '#ffffff', width: canvasSize.width, height: canvasSize.height };

        const capturedFrames: HTMLCanvasElement[] = [];
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = outerWidth;
        finalCanvas.height = outerHeight;
        const ctx = finalCanvas.getContext('2d');


        setExportStatusText("Capturing frames...");
        for (let i = 0; i < totalFrames; i++) {
             if (isExportCancelled.current) return;
             
             const currentTime = i * frameDelay;
             setAnimationSeekTime(currentTime / 1000);
             
             await new Promise(resolve => requestAnimationFrame(resolve));
             await new Promise(resolve => requestAnimationFrame(resolve));

             try {
                const canvasFrame = await html2canvas(canvasToCapture, html2canvasOptions);
                
                if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, outerWidth, outerHeight);
                    const offsetX = (outerWidth - width) / 2;
                    const offsetY = (outerHeight - height) / 2;
                    ctx.drawImage(canvasFrame, offsetX, offsetY, width, height);
                    
                    const finalFrameCanvas = document.createElement('canvas');
                    finalFrameCanvas.width = outerWidth;
                    finalFrameCanvas.height = outerHeight;
                    finalFrameCanvas.getContext('2d')?.drawImage(finalCanvas, 0, 0);
                    capturedFrames.push(finalFrameCanvas);
                } else {
                    capturedFrames.push(canvasFrame);
                }

                setExportProgress(((i + 1) / totalFrames) * 50);
             } catch (error) {
                 alert("An error occurred while capturing animation frames.");
                 closePreview();
                 return;
             }
        }
        
        setAnimationSeekTime(null);
        if (isExportCancelled.current) return;

        setExportStatusText("Encoding GIF, please wait...");
        const gif = new GIF({
            workers: 4,
            quality: 10,
            width: outerWidth,
            height: outerHeight,
        });

        gif.on('progress', (p: number) => {
            if (!isExportCancelled.current) {
                setExportProgress(50 + p * 50);
            }
        });

        gif.on('finished', (blob: Blob) => {
            if (!isExportCancelled.current) {
                const url = URL.createObjectURL(blob);
                setGifPreviewUrl(url);
                setExportProgress(100);
            }
        });
        
        for (const frame of capturedFrames) {
            gif.addFrame(frame, { copy: true, delay: frameDelay });
        }
        gif.render();
    };


    const handleExportMp4 = async () => {
        setIsExporting('mp4');
        setSelectedElementId(null);
        setIsPlaying(true);
        
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));


        const canvasToCapture = canvasRef.current;
        if (!canvasToCapture) {
            setIsExporting(false);
            setIsPlaying(false);
            return;
        }

        const { width, height, scale, outerWidth, outerHeight } = getExportDimensions();

        const maxDuration = elements.reduce((max, el) => {
            const anim = el.animation;
            if (anim && anim.type !== 'none' && anim.iteration !== 'infinite' && (anim.trigger === 'onLoad' || anim.trigger === 'onLoadAndHover')) {
                return Math.max(max, (anim.delay + anim.duration) * 1000);
            }
            return max;
        }, 3000);

        if (maxDuration === 0) {
            alert("No animations to export.");
            setIsExporting(false);
            setIsPlaying(false);
            return;
        }
        
        const frameRate = 30;
        const frameDelay = 1000 / frameRate;
        const html2canvasOptions = { scale, useCORS: true, backgroundColor: '#ffffff', width: canvasSize.width, height: canvasSize.height };

        const chunks: Blob[] = [];
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = outerWidth;
        offscreenCanvas.height = outerHeight;
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) {
            alert("Could not create canvas context for MP4 export.");
            setIsExporting(false);
            setIsPlaying(false);
            return;
        }

        const stream = offscreenCanvas.captureStream(frameRate);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'banner.mp4';
            a.click();
            URL.revokeObjectURL(url);
            setIsExporting(false);
            setIsPlaying(false);
        };

        recorder.start();

        const startTime = Date.now();
        const captureFrame = async () => {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < maxDuration && ctx) {
                const frame = await html2canvas(canvasToCapture, html2canvasOptions);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, outerWidth, outerHeight);
                const offsetX = (outerWidth - width) / 2;
                const offsetY = (outerHeight - height) / 2;
                ctx.drawImage(frame, offsetX, offsetY, width, height);
                setTimeout(captureFrame, frameDelay);
            } else {
                recorder.stop();
            }
        };
        captureFrame();
    };
    
    const handleExportAnimatedSvg = async () => {
        const { outerWidth, outerHeight } = getExportDimensions();
        let styles = `
            .animatable { transform-box: fill-box; transform-origin: center; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-10px);} 60% {transform: translateY(-5px);} }
            @keyframes slideIn-left { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideIn-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideIn-top { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideIn-bottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        
        const elementPromises = elements.map(async (el) => {
            const { animation, id, rotation, width, height, x, y, effects } = el;
            
            if (animation && animation.type !== 'none') {
                const { type, duration, delay, direction, iteration, trigger } = animation;
                const animationName = type.includes('slide') ? `${type}-${direction}` : type;
                const animationProps = `${animationName} ${duration}s ${delay}s ${iteration === 'infinite' ? 'infinite' : '1'} both`;
                
                if (trigger === 'onLoad' || trigger === 'onLoadAndHover') {
                    styles += `#group-${id} > .animatable { animation: ${animationProps}; }`;
                }
                if (trigger === 'onHover' || trigger === 'onLoadAndHover') {
                    styles += `#group-${id}:hover > .animatable { animation: ${animationProps}; }`;
                }
            }
            
            // The group handles positioning and rotation. Rotation is around the element's local center.
            const groupTransform = `translate(${x} ${y}) rotate(${rotation} ${width / 2} ${height / 2})`;

            let innerElementSvg = '';
            const commonProps = `class="animatable" opacity="${(effects?.opacity ?? 100)/100}"`;
            
            switch (el.type) {
                case 'rectangle':
                    innerElementSvg = `<rect ${commonProps} width="${width}" height="${height}" fill="${el.fill || 'transparent'}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" />`;
                    break;
                case 'circle':
                    innerElementSvg = `<circle ${commonProps} cx="${width/2}" cy="${height/2}" r="${width/2}" fill="${el.fill || 'transparent'}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" />`;
                    break;
                case 'text':
                     const textAnchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
                     const textX = el.textAlign === 'center' ? width / 2 : el.textAlign === 'right' ? width : 0;
                     const textContent = el.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                     const hoverRect = `<rect x="0" y="0" width="${width}" height="${height}" fill="transparent" />`;
                     const textSvg = `<text ${commonProps} x="${textX}" y="${height/2}" dominant-baseline="middle" text-anchor="${textAnchor}" fill="${el.color}" font-family="${el.fontFamily}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" style="pointer-events: none;">${textContent}</text>`;
                     innerElementSvg = hoverRect + textSvg;
                     break;
                case 'image':
                    const base64Src = await toBase64(el.src);
                    innerElementSvg = `<image ${commonProps} href="${base64Src}" width="${width}" height="${height}" preserveAspectRatio="none" />`;
                    break;
                default:
                    return ''; // Should handle all shapes eventually
            }
            
            return `<g id="group-${id}" transform="${groupTransform}">${innerElementSvg}</g>`;
        });

        const elementSvgs = await Promise.all(elementPromises);

        const finalSvg = `
            <svg width="${outerWidth}" height="${outerHeight}" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <style>${styles}</style>
                <rect width="100%" height="100%" fill="white" />
                ${elementSvgs.join('\n')}
            </svg>
        `;
        
        const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'banner.svg';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportStatic = async (format: 'png' | 'jpeg') => {
        setSelectedElementId(null);
        setIsPlaying(false);
    
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const canvasContainer = canvasRef.current;
        if (!canvasContainer) { return; }
    
        const canvasToCapture = canvasContainer.querySelector('#canvas') as HTMLElement;
        if (!canvasToCapture) { return; }
    
        const originalTransform = canvasContainer.style.transform;
        const wasShadowApplied = canvasToCapture.classList.contains('shadow-lg');
    
        canvasContainer.style.transform = '';
        if (wasShadowApplied) {
            canvasToCapture.classList.remove('shadow-lg');
        }
        
        await new Promise(resolve => requestAnimationFrame(resolve));
    
        try {
            const { width, height, scale, outerWidth, outerHeight } = getExportDimensions();

            const canvas = await html2canvas(canvasToCapture, { 
                scale,
                useCORS: true, 
                backgroundColor: '#ffffff',
                width: canvasSize.width,
                height: canvasSize.height,
                x: 0, y: 0, scrollX: 0, scrollY: 0,
            });

            // Create a new canvas to handle letterboxing if aspect ratios differ
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = outerWidth;
            finalCanvas.height = outerHeight;
            const ctx = finalCanvas.getContext('2d');

            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, outerWidth, outerHeight);
                const offsetX = (outerWidth - width) / 2;
                const offsetY = (outerHeight - height) / 2;
                ctx.drawImage(canvas, offsetX, offsetY, width, height);
            }
            
            const image = finalCanvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : 1.0);
            const link = document.createElement('a');
            link.download = `banner.${format === 'jpeg' ? 'jpg' : 'png'}`;
            link.href = image;
            link.click();
        } catch (err) {
            console.error('Failed to export static image:', err);
            alert('Could not export image. See console for details.');
        } finally {
            canvasContainer.style.transform = originalTransform;
            if (wasShadowApplied) {
                canvasToCapture.classList.add('shadow-lg');
            }
        }
    };
    
      const handleExportPng = () => handleExportStatic('png');
      const handleExportJpg = () => handleExportStatic('jpeg');

      const handleExportHtml = async () => {
        let htmlElements = '';
        let cssRules = '';
        const keyframes = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                40% {transform: translateY(-30px);}
                60% {transform: translateY(-15px);}
            }
            @keyframes slideIn-left { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideIn-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideIn-top { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideIn-bottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideOut-left { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
            @keyframes slideOut-right { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
            @keyframes slideOut-top { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
            @keyframes slideOut-bottom { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
            @keyframes zoomIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes zoomOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0); opacity: 0; } }
            @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            @keyframes jello {
                from, 11.1%, to { transform: none; }
                22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); }
                33.3% { transform: skewX(6.25deg) skewY(6.25deg); }
                44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); }
                55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); }
                66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); }
                77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); }
                88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); }
            }
        `;
    
        for (const el of elements) {
            const id = `el-${el.id.replace(/[^a-zA-Z0-9]/g, '')}`;
            let styles = `
                position: absolute;
                left: ${el.x}px;
                top: ${el.y}px;
                width: ${el.width}px;
                height: ${el.height}px;
                transform: rotate(${el.rotation}deg);
                box-sizing: border-box;
            `;
            
            const filter = generateCssFilter(el.effects);
            if (filter) styles += `filter: ${filter};`;
            if (el.effects?.opacity !== undefined) styles += `opacity: ${el.effects.opacity / 100};`;
            
            if (typeof el.borderRadius === 'number') {
                styles += `border-radius: ${el.borderRadius}px;`;
            } else if (typeof el.borderRadius === 'object' && el.borderRadius !== null) {
                styles += `
                    border-top-left-radius: ${el.borderRadius.tl || 0}px;
                    border-top-right-radius: ${el.borderRadius.tr || 0}px;
                    border-bottom-right-radius: ${el.borderRadius.br || 0}px;
                    border-bottom-left-radius: ${el.borderRadius.bl || 0}px;
                `;
            }
    
            if (el.animation && el.animation.type !== 'none') {
                const { type, duration, delay, direction, iteration, trigger } = el.animation;
                const animationName = type.includes('slide') ? `${type}-${direction}` : type;
                const animationProps = `${animationName} ${duration}s ${delay}s ${iteration === 'infinite' ? 'infinite' : '1'} both`;
                
                if (trigger === 'onLoad' || trigger === 'onLoadAndHover') {
                    styles += `animation: ${animationProps};`;
                }
                if (trigger === 'onHover' || trigger === 'onLoadAndHover') {
                    cssRules += `#${id}:hover { animation: ${animationProps}; }\n`;
                }
            }
    
            let innerHtml = '';
            
            if (el.type === 'rectangle' || el.type === 'circle') {
                styles += `background-color: ${el.fill || 'transparent'};`;
                styles += `border: ${el.strokeWidth}px solid ${el.stroke};`;
                if (el.type === 'circle') styles += `border-radius: 50%;`;
            } else if (el.type === 'text') {
                const textEl = el as TextElement;
                styles += `
                    color: ${textEl.color};
                    font-family: "${textEl.fontFamily}", sans-serif;
                    font-size: ${textEl.fontSize}px;
                    font-weight: ${textEl.fontWeight};
                    text-align: ${textEl.textAlign};
                    display: flex;
                    align-items: center;
                    justify-content: ${textEl.textAlign === 'center' ? 'center' : textEl.textAlign === 'right' ? 'flex-end' : 'flex-start'};
                    padding: 2px;
                    white-space: pre-wrap;
                    line-height: 1.2;
                `;
                if (textEl.effects?.textStroke?.enabled && textEl.effects.textStroke.width > 0) {
                    styles += `-webkit-text-stroke: ${textEl.effects.textStroke.width}px ${textEl.effects.textStroke.color};`;
                }
                innerHtml = textEl.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
            } else if (el.type === 'image') {
                const imgEl = el as ImageElement;
                const { base64: imgBase64, mimeType } = await urlToBase64(imgEl.src);
                const dataUrl = `data:${mimeType};base64,${imgBase64}`;
                styles += `
                    background-image: url("${dataUrl}");
                    background-repeat: no-repeat;
                `;
                if (imgEl.crop) {
                    const { x, y, width, height } = imgEl.crop;
                    const bgWidth = (100 / width) * 100;
                    const bgHeight = (100 / height) * 100;
                    const bgPosX = width === 100 ? 0 : (-x / (100 - width)) * 100;
                    const bgPosY = height === 100 ? 0 : (-y / (100 - height)) * 100;
                    styles += `
                        background-size: ${bgWidth}% ${bgHeight}%;
                        background-position: ${bgPosX}% ${bgPosY}%;
                    `;
                } else {
                    styles += `background-size: 100% 100%;`;
                }
            }
    
            cssRules += `#${id} { ${styles} }\n`;
            htmlElements += `<div id="${id}">${innerHtml}</div>\n`;
        }
    
        const fonts = new Set(elements.filter(e => e.type === 'text').map(e => (e as TextElement).fontFamily));
        let fontLink = '';
        if (fonts.size > 0) {
            const fontQuery = Array.from(fonts).map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&');
            fontLink = `<link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?${fontQuery}&display=swap" rel="stylesheet">`;
        }
    
        const finalHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Exported Banner</title>
                ${fontLink}
                <style>
                    body { margin: 0; }
                    #canvas {
                        width: ${canvasSize.width}px;
                        height: ${canvasSize.height}px;
                        position: relative;
                        overflow: hidden;
                        background-color: #ffffff;
                    }
                    ${keyframes}
                    ${cssRules}
                </style>
            </head>
            <body>
                <div id="canvas">
                    ${htmlElements}
                </div>
            </body>
            </html>
        `;
        
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'banner.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

    const handleExportWebProject = async () => {
        if (typeof JSZip === 'undefined') {
            alert('JSZip library not found. Please check your internet connection and try again.');
            return;
        }
        const zip = new JSZip();
        const imgFolder = zip.folder("images");

        let htmlElements = '';
        let cssRules = '';
        let imageCounter = 0;
        const imagePromises: Promise<void>[] = [];

        const keyframes = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                40% {transform: translateY(-30px);}
                60% {transform: translateY(-15px);}
            }
            @keyframes slideIn-left { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideIn-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideIn-top { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideIn-bottom { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            @keyframes slideOut-left { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
            @keyframes slideOut-right { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
            @keyframes slideOut-top { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
            @keyframes slideOut-bottom { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }
            @keyframes zoomIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes zoomOut { from { transform: scale(1); opacity: 1; } to { transform: scale(0); opacity: 0; } }
            @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            @keyframes jello {
                from, 11.1%, to { transform: none; }
                22.2% { transform: skewX(-12.5deg) skewY(-12.5deg); }
                33.3% { transform: skewX(6.25deg) skewY(6.25deg); }
                44.4% { transform: skewX(-3.125deg) skewY(-3.125deg); }
                55.5% { transform: skewX(1.5625deg) skewY(1.5625deg); }
                66.6% { transform: skewX(-0.78125deg) skewY(-0.78125deg); }
                77.7% { transform: skewX(0.390625deg) skewY(0.390625deg); }
                88.8% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); }
            }
        `;

        for (const el of elements) {
            const id = `el-${el.id.replace(/[^a-zA-Z0-9]/g, '')}`;
            let styles = `
                position: absolute;
                left: ${el.x}px;
                top: ${el.y}px;
                width: ${el.width}px;
                height: ${el.height}px;
                transform: rotate(${el.rotation}deg);
                box-sizing: border-box;
            `;
            
            const filter = generateCssFilter(el.effects);
            if (filter) styles += `filter: ${filter};`;
            if (el.effects?.opacity !== undefined) styles += `opacity: ${el.effects.opacity / 100};`;
            
            if (typeof el.borderRadius === 'number') {
                styles += `border-radius: ${el.borderRadius}px;`;
            } else if (typeof el.borderRadius === 'object' && el.borderRadius !== null) {
                styles += `
                    border-top-left-radius: ${el.borderRadius.tl || 0}px;
                    border-top-right-radius: ${el.borderRadius.tr || 0}px;
                    border-bottom-right-radius: ${el.borderRadius.br || 0}px;
                    border-bottom-left-radius: ${el.borderRadius.bl || 0}px;
                `;
            }

            if (el.animation && el.animation.type !== 'none') {
                const { type, duration, delay, direction, iteration, trigger } = el.animation;
                const animationName = type.includes('slide') ? `${type}-${direction}` : type;
                const animationProps = `${animationName} ${duration}s ${delay}s ${iteration === 'infinite' ? 'infinite' : '1'} both`;
                if (trigger === 'onLoad' || trigger === 'onLoadAndHover') {
                    styles += `animation: ${animationProps};`;
                }
                if (trigger === 'onHover' || trigger === 'onLoadAndHover') {
                    // This rule will be added to cssRules at the end of the element processing
                }
            }

            let innerHtml = '';
            
            if (el.type === 'rectangle' || el.type === 'circle') {
                styles += `background-color: ${el.fill || 'transparent'};`;
                styles += `border: ${el.strokeWidth}px solid ${el.stroke};`;
                if (el.type === 'circle') styles += `border-radius: 50%;`;
            } else if (el.type === 'text') {
                const textEl = el as TextElement;
                styles += `
                    color: ${textEl.color};
                    font-family: "${textEl.fontFamily}", sans-serif;
                    font-size: ${textEl.fontSize}px;
                    font-weight: ${textEl.fontWeight};
                    text-align: ${textEl.textAlign};
                    display: flex;
                    align-items: center;
                    justify-content: ${textEl.textAlign === 'center' ? 'center' : textEl.textAlign === 'right' ? 'flex-end' : 'flex-start'};
                    padding: 2px;
                    white-space: pre-wrap;
                    line-height: 1.2;
                `;
                if (textEl.effects?.textStroke?.enabled && textEl.effects.textStroke.width > 0) {
                    styles += `-webkit-text-stroke: ${textEl.effects.textStroke.width}px ${textEl.effects.textStroke.color};`;
                }
                innerHtml = textEl.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
            } else if (el.type === 'image') {
                const imgEl = el as ImageElement;
                const promise = urlToBlob(imgEl.src).then(({ blob, extension }) => {
                    const filename = `image_${imageCounter++}.${extension}`;
                    imgFolder?.file(filename, blob);
                    let imageStyles = styles; // Create a new scope for styles
                    imageStyles += `
                        background-image: url("images/${filename}");
                        background-repeat: no-repeat;
                    `;
                    if (imgEl.crop) {
                        const { x, y, width, height } = imgEl.crop;
                        const bgWidth = (100 / width) * 100;
                        const bgHeight = (100 / height) * 100;
                        const bgPosX = width === 100 ? 0 : (-x / (100 - width)) * 100;
                        const bgPosY = height === 100 ? 0 : (-y / (100 - height)) * 100;
                        imageStyles += `
                            background-size: ${bgWidth}% ${bgHeight}%;
                            background-position: ${bgPosX}% ${bgPosY}%;
                        `;
                    } else {
                        imageStyles += `background-size: 100% 100%;`;
                    }
                    cssRules += `#${id} { ${imageStyles} }\n`;
                    if (imgEl.animation && imgEl.animation.type !== 'none' && (imgEl.animation.trigger === 'onHover' || imgEl.animation.trigger === 'onLoadAndHover')) {
                        const { type, duration, delay, direction, iteration } = imgEl.animation;
                        const animationName = type.includes('slide') ? `${type}-${direction}` : type;
                        const animationProps = `${animationName} ${duration}s ${delay}s ${iteration === 'infinite' ? 'infinite' : '1'} both`;
                        cssRules += `#${id}:hover { animation: ${animationProps}; }\n`;
                    }
                }).catch(err => {
                    console.error(`Failed to process image ${imgEl.src}:`, err);
                    let fallbackStyles = styles;
                    fallbackStyles += `background-color: #ccc; border: 1px solid #999;`;
                    cssRules += `#${id} { ${fallbackStyles} }\n`;
                });
                imagePromises.push(promise);
                htmlElements += `<div id="${id}">${innerHtml}</div>\n`;
                continue;
            }

            cssRules += `#${id} { ${styles} }\n`;
            if (el.animation && el.animation.type !== 'none' && (el.animation.trigger === 'onHover' || el.animation.trigger === 'onLoadAndHover')) {
                const { type, duration, delay, direction, iteration } = el.animation;
                const animationName = type.includes('slide') ? `${type}-${direction}` : type;
                const animationProps = `${animationName} ${duration}s ${delay}s ${iteration === 'infinite' ? 'infinite' : '1'} both`;
                cssRules += `#${id}:hover { animation: ${animationProps}; }\n`;
            }
            htmlElements += `<div id="${id}">${innerHtml}</div>\n`;
        }

        await Promise.all(imagePromises);

        const fonts = new Set(elements.filter(e => e.type === 'text').map(e => (e as TextElement).fontFamily));
        let fontLink = '';
        if (fonts.size > 0) {
            const fontQuery = Array.from(fonts).map(f => `family=${f.replace(/ /g, '+')}:wght@400;700`).join('&');
            fontLink = `<link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?${fontQuery}&display=swap" rel="stylesheet">`;
        }
        
        const finalCss = `
body { margin: 0; }
#canvas {
    width: ${canvasSize.width}px;
    height: ${canvasSize.height}px;
    position: relative;
    overflow: hidden;
    background-color: #ffffff;
}
${keyframes}
${cssRules}`;

        const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Banner</title>
    ${fontLink}
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="canvas">
        ${htmlElements}
    </div>
</body>
</html>`;
        
        zip.file("index.html", finalHtml);
        zip.file("style.css", finalCss);

        zip.generateAsync({ type: "blob" }).then(function(content: Blob) {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'banner-project.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };


  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.1, z + delta));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsDraggingPan(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, initialPan: pan };
    }
  };

  // FIX: Renamed handleMouseMove to handlePanMouseMove to avoid redeclaration.
  const handlePanMouseMove = (e: React.MouseEvent) => {
    if (isDraggingPan) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.initialPan.x + dx,
        y: panStartRef.current.initialPan.y + dy,
      });
    }
  };

  // FIX: Renamed handleMouseUp to handlePanMouseUp to avoid redeclaration.
  const handlePanMouseUp = () => {
    setIsDraggingPan(false);
  };
  
  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSizePreset(value);
    if (value !== 'custom') {
        const [width, height] = value.split('x').map(Number);
        setCanvasSize({ width, height });
    }
  };

  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCanvasSize(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };
  
  const closePreview = () => {
      if (cancelExportRef.current) {
          cancelExportRef.current();
      }
      if(gifPreviewUrl) {
          URL.revokeObjectURL(gifPreviewUrl);
      }
      setIsPreviewingGif(false);
      setGifPreviewUrl(null);
      setExportProgress(0);
      setExportStatusText('');
  }

  const handleToggleMobilePreview = () => {
    setIsPreviewingMobile(prev => {
        if (!prev) { // Entering preview
            originalSizeRef.current = { width: canvasSize.width, height: canvasSize.height, preset: selectedSizePreset };
            setCanvasSize({ width: 375, height: 812 });
        } else { // Exiting preview
            setCanvasSize({ width: originalSizeRef.current.width, height: originalSizeRef.current.height });
            setSelectedSizePreset(originalSizeRef.current.preset);
        }
        return !prev;
    });
  };

  const handleSwapOrientation = () => {
    setCanvasSize(prev => ({ width: prev.height, height: prev.width }));
    setSelectedSizePreset('custom');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSelectedElementId(null);
    await new Promise(resolve => setTimeout(resolve, 50));

    const canvasContainer = canvasRef.current;
    if (!canvasContainer) {
        alert("Could not find canvas to generate preview.");
        setSaveStatus('idle');
        return;
    }

    const canvasToCapture = canvasContainer.querySelector('#canvas') as HTMLElement;
    if (!canvasToCapture) {
        alert("Could not find canvas to generate preview.");
        setSaveStatus('idle');
        return;
    }

    const originalTransform = canvasContainer.style.transform;
    canvasContainer.style.transform = '';

    try {
        const canvas = await html2canvas(canvasToCapture, {
            scale: 0.5,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: canvasSize.width,
            height: canvasSize.height,
            x: 0, y: 0, scrollX: 0, scrollY: 0,
        });
        const previewImage = canvas.toDataURL('image/jpeg', 0.8);

        const currentState = {
            elements,
            canvasSize,
            selectedSizePreset
        };

        const newHistoryItem: HistoryItem = {
            id: Date.now().toString(),
            savedAt: new Date().toLocaleString(),
            previewImage,
            state: currentState
        };

        localStorage.setItem('react-banner-editor-state', JSON.stringify(currentState));

        const updatedHistory = [newHistoryItem, ...historyItems].slice(0, 20); // Max 20 items
        localStorage.setItem('react-banner-editor-history', JSON.stringify(updatedHistory));
        setHistoryItems(updatedHistory);

        setTimeout(() => setSaveStatus('saved'), 100);
        setTimeout(() => setSaveStatus('idle'), 1500);

    } catch (error) {
        console.error("Failed to save state with preview:", error);
        setSaveStatus('idle');
        alert("Could not save your work. See console for details.");
    } finally {
        canvasContainer.style.transform = originalTransform;
    }
  };

  const handleLoadFromHistory = useCallback((state: HistoryItem['state']) => {
    setCanvasSize(state.canvasSize);
    setElements(state.elements);
    setSelectedSizePreset(state.selectedSizePreset);
    setSelectedElementId(null);
    setMainTab('Editor');
  }, [setElements]);

  const handleDeleteHistoryItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this saved project? This action cannot be undone.")) {
        const updatedHistory = historyItems.filter(item => item.id !== id);
        setHistoryItems(updatedHistory);
        localStorage.setItem('react-banner-editor-history', JSON.stringify(updatedHistory));
    }
  };

  const isEditorView = ['Editor', 'Adjustments'].includes(mainTab);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
       {croppingElement && (
            <CropModal 
                element={croppingElement}
                onConfirm={handleCropConfirm}
                onCancel={handleCropCancel}
            />
        )}
        {watermarkRemovalElement && (
            <WatermarkRemovalModal
                element={watermarkRemovalElement}
                onConfirm={handleConfirmWatermarkRemoval}
                onCancel={handleCancelWatermarkRemoval}
            />
        )}
        {backgroundChangeElement && (
            <BackgroundChangeModal
                element={backgroundChangeElement}
                onConfirm={handleConfirmBackgroundChange}
                onCancel={() => setBackgroundChangeElementId(null)}
            />
        )}
       {isPreviewingGif && (
            <GifPreviewModal 
                progress={exportProgress}
                gifUrl={gifPreviewUrl}
                onClose={closePreview}
                statusText={exportStatusText}
            />
        )}
       {isExporting && (
            <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center z-50">
                <div className="text-foreground text-lg mb-4">Exporting as {isExporting.toUpperCase()}...</div>
                <div className="text-foreground text-sm">This may take a few moments. Please wait.</div>
            </div>
        )}
      <Header 
        mainTab={mainTab}
        onSetMainTab={setMainTab}
        onUndo={undo} 
        onRedo={redo} 
        canUndo={canUndo} 
        canRedo={canRedo} 
        // FIX: Replaced undefined `onSave` with the `handleSave` function.
        onSave={handleSave}
        saveStatus={saveStatus}
        onExportMp4={handleExportMp4}
        onGenerateGifPreview={handleGenerateGifPreview}
        onExportAnimatedSvg={handleExportAnimatedSvg}
        onExportPng={handleExportPng}
        onExportJpg={handleExportJpg}
        onExportHtml={handleExportHtml}
        onExportWebProject={handleExportWebProject}
        isExporting={!!isExporting || isPreviewingGif} 
        onToggleMobilePreview={handleToggleMobilePreview}
        onSwapOrientation={handleSwapOrientation}
        onToggleFullscreen={handleToggleFullscreen}
        isPreviewingMobile={isPreviewingMobile}
        isFullscreen={isFullscreen}
        exportResolution={exportResolution}
        onSetExportResolution={setExportResolution}
        theme={theme}
        onToggleTheme={toggleTheme}
       />
      <div className="relative flex flex-1 overflow-hidden">
        {isEditorView ? (
            <>
                {!isPreviewingMobile && (
                    <>
                        {!isLeftSidebarCollapsed ? (
                            <>
                                <aside 
                                    style={{ width: `${leftSidebarWidth}px` }} 
                                    className="bg-sidebar p-4 flex flex-col flex-shrink-0 overflow-y-auto relative"
                                >
                                     <button
                                        onClick={() => setIsLeftSidebarCollapsed(true)}
                                        className="absolute top-2 right-2 p-1 text-text-secondary hover:text-foreground hover:bg-item-hover rounded-full z-10 transition-colors"
                                        title="Collapse Sidebar"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <LeftSidebar 
                                      onAddElement={addElement} 
                                      mainTab={mainTab}
                                      selectedElement={selectedElement}
                                      onUpdateElement={updateElement}
                                    />
                                </aside>
                                <div 
                                    className="w-1.5 cursor-col-resize bg-border-color hover:bg-primary-blue transition-colors flex-shrink-0"
                                    onMouseDown={(e) => handleMouseDownOnResizer(e, 'left')} 
                                />
                            </>
                        ) : (
                            <button
                                onClick={() => setIsLeftSidebarCollapsed(false)}
                                className="absolute top-1/2 left-2 -translate-y-1/2 p-1 text-foreground bg-sidebar hover:bg-item-hover rounded-full z-20 shadow-lg"
                                title="Expand Sidebar"
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        )}
                    </>
                )}
                <main className="flex-1 flex flex-col bg-background overflow-hidden">
                    {!isPreviewingMobile &&
                    <div className="flex-shrink-0 bg-header/80 backdrop-blur-sm px-4 py-2 flex items-center gap-4 text-sm border-b border-border-color">
                        <div>
                            <span>Size:</span>
                            <select 
                                value={selectedSizePreset}
                                onChange={handleSizeChange}
                                className="ml-2 bg-input-bg border border-border-color rounded px-2 py-1 text-xs"
                            >
                                {BANNER_SIZES.map(size => (
                                    <option key={`${size.width}x${size.height}`} value={`${size.width}x${size.height}`}>{size.name}</option>
                                ))}
                                <option value="custom">Custom Size</option>
                            </select>
                             {selectedSizePreset === 'custom' && (
                                <div className="inline-flex items-center gap-2 ml-2">
                                     <input 
                                        type="number"
                                        name="width"
                                        value={canvasSize.width}
                                        onChange={handleCustomSizeChange}
                                        className="bg-input-bg border border-border-color rounded px-2 py-1 text-xs w-16"
                                        placeholder="W"
                                    />
                                    <span className="text-text-secondary">x</span>
                                     <input 
                                        type="number"
                                        name="height"
                                        value={canvasSize.height}
                                        onChange={handleCustomSizeChange}
                                        className="bg-input-bg border border-border-color rounded px-2 py-1 text-xs w-16"
                                        placeholder="H"
                                    />
                                </div>
                            )}
                        </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-1 rounded hover:bg-item-hover">-</button>
                            <span>Zoom: {Math.round(zoom * 100)}%</span>
                             <button onClick={() => setZoom(z => z + 0.1)} className="p-1 rounded hover:bg-item-hover">+</button>
                        </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => setIsPlaying(!isPlaying)} className={`px-3 py-1 text-xs rounded ${isPlaying ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{isPlaying ? 'Stop' : 'Play'}</button>
                        </div>
                    </div>
                    }
                    <div 
                      className={`flex-1 overflow-auto ${isPreviewingMobile ? 'flex items-center justify-center p-4' : 'p-8'}`}
                      style={{ 
                        ...canvasBgStyle,
                        cursor: isPanning ? (isDraggingPan ? 'grabbing' : 'grab') : 'default'
                      }}
                      onWheel={handleWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handlePanMouseMove}
                      onMouseUp={handlePanMouseUp}
                      onMouseLeave={handlePanMouseUp}
                    >
                         <Canvas
                            ref={canvasRef}
                            elements={elements}
                            selectedElementId={selectedElementId}
                            onSelectElement={handleSelectElement}
                            onUpdateElement={updateElement}
                            zoom={zoom}
                            pan={pan}
                            width={canvasSize.width}
                            height={canvasSize.height}
                            isPlaying={isPlaying}
                            animationSeekTime={animationSeekTime}
                            editingElementId={editingElementId}
                            onSetEditingId={setEditingElementId}
                            processingElementId={processingElementId}
                        />
                    </div>
                </main>
                {!isPreviewingMobile && (
                    <>
                         {!isRightSidebarCollapsed ? (
                            <>
                                <div 
                                    className="w-1.5 cursor-col-resize bg-border-color hover:bg-primary-blue transition-colors flex-shrink-0"
                                    onMouseDown={(e) => handleMouseDownOnResizer(e, 'right')}
                                />
                                <aside 
                                    style={{ width: `${rightSidebarWidth}px` }} 
                                    className="bg-sidebar p-4 flex flex-col flex-shrink-0 overflow-y-auto relative"
                                >
                                    <button
                                        onClick={() => setIsRightSidebarCollapsed(true)}
                                        className="absolute top-2 left-2 p-1 text-text-secondary hover:text-foreground hover:bg-item-hover rounded-full z-10 transition-colors"
                                        title="Collapse Sidebar"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                    <RightSidebar
                                        elements={elements}
                                        selectedElement={selectedElement}
                                        onUpdateElement={updateElement}
                                        onDeleteElement={deleteElement}
                                        onDuplicateElement={duplicateElement}
                                        onSelectElement={handleSelectElement}
                                        onReorderElements={handleReorderElements}
                                        onCropElement={setCroppingElementId}
                                        onRemoveBackground={handleRemoveBackground}
                                        onRemoveWatermark={handleRemoveWatermark}
                                        onChangeBackground={setBackgroundChangeElementId}
                                        onFitImageToCanvas={handleFitImageToCanvas}
                                        processingElementId={processingElementId}
                                    />
                                </aside>
                            </>
                         ) : (
                            <button
                                onClick={() => setIsRightSidebarCollapsed(false)}
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-foreground bg-sidebar hover:bg-item-hover rounded-full z-20 shadow-lg"
                                title="Expand Sidebar"
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                         )}
                    </>
                )}
            </>
        ) : mainTab === 'Templates' ? (
            <TemplatesPanel onLoadTemplate={handleLoadTemplate} />
        ) : mainTab === 'History' ? (
            <HistoryPanel 
                history={historyItems}
                onLoad={handleLoadFromHistory}
                onDelete={handleDeleteHistoryItem}
            />
        ) : mainTab === 'VisualEffects' ? (
            <VisualEffectsPanel onAddEffect={handleAddVisualEffect} />
        ) : ( // Gallery
            <GalleryPanel onAddElement={addElement} />
        )}
      </div>
    </div>
  );
};

export default App;