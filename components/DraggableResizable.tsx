import React, { useRef, useCallback, useState } from 'react';
import { CanvasElement, Effects } from '../types';

interface DraggableResizableProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, props: Partial<CanvasElement>) => void;
  children: React.ReactNode;
  zoom: number;
  isPlaying: boolean;
  animationSeekTime: number | null;
  isEditing: boolean;
  onDoubleClick: (id: string) => void;
  processingElementId: string | null;
}

type Point = { x: number; y: number };

// Vector math helpers
const rotateVector = (vec: Point, angleRad: number): Point => {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
        x: vec.x * cos - vec.y * sin,
        y: vec.x * sin + vec.y * cos,
    };
};
const addVectors = (v1: Point, v2: Point): Point => ({ x: v1.x + v2.x, y: v1.y + v2.y });
const subtractVectors = (v1: Point, v2: Point): Point => ({ x: v1.x - v2.x, y: v1.y - v2.y });


// Defines the position of each handle relative to the element's center
const handlePoints: { [key: string]: (w: number, h: number) => Point } = {
    tl: (w, h) => ({ x: -w / 2, y: -h / 2 }),
    t:  (w, h) => ({ x: 0,      y: -h / 2 }),
    tr: (w, h) => ({ x: w / 2,  y: -h / 2 }),
    l:  (w, h) => ({ x: -w / 2, y: 0 }),
    r:  (w, h) => ({ x: w / 2,  y: 0 }),
    bl: (w, h) => ({ x: -w / 2, y: h / 2 }),
    b:  (w, h) => ({ x: 0,      y: h / 2 }),
    br: (w, h) => ({ x: w / 2,  y: h / 2 }),
};

// Maps each handle to its opposite, which acts as the anchor during resize
const oppositeHandles: { [key: string]: string } = {
    tl: 'br', t: 'b', tr: 'bl', l: 'r', r: 'l', bl: 'tr', b: 't', br: 'tl',
};

// State for the current interaction (drag, resize, rotate)
interface InteractionState {
  type: 'drag' | 'resize' | 'rotate';
  startX: number;
  startY: number;
  handle?: string;
  initialElement?: CanvasElement;
  anchorPoint?: Point;
  rad?: number;
  startAngle?: number;
  centerX?: number;
  centerY?: number;
}

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


const DraggableResizable: React.FC<DraggableResizableProps> = ({ element, isSelected, onSelect, onUpdate, children, zoom, isPlaying, animationSeekTime, isEditing, onDoubleClick, processingElementId }) => {
  const ref = useRef<HTMLDivElement>(null);
  const interaction = useRef<InteractionState>({ type: 'drag', startX: 0, startY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, type: 'drag' | 'resize' | 'rotate', handle?: string) => {
    e.stopPropagation();
    if (isPlaying || animationSeekTime !== null || isEditing) return;
    onSelect(element.id);
    
    if (element.locked) return;

    const startX = e.clientX / zoom;
    const startY = e.clientY / zoom;
    const { x, y, width, height, rotation } = element;
    
    const baseInteraction = { type, startX, startY, handle };

    if (type === 'resize' && handle) {
        const rad = rotation * (Math.PI / 180);
        const center = { x: x + width / 2, y: y + height / 2 };

        const oppositeHandle = oppositeHandles[handle];
        const oppositePointLocal = handlePoints[oppositeHandle](width, height);
        const oppositePointOffset = rotateVector(oppositePointLocal, rad);
        const anchorPoint = addVectors(center, oppositePointOffset);

        interaction.current = { ...baseInteraction, initialElement: { ...element }, anchorPoint, rad };

    } else if (type === 'rotate') {
        if(ref.current){
            const rect = ref.current.getBoundingClientRect();
            const centerX = (rect.left + rect.right) / 2 / zoom;
            const centerY = (rect.top + rect.bottom) / 2 / zoom;
            const startAngle = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI) - rotation;
            interaction.current = { ...baseInteraction, centerX, centerY, startAngle };
        }
    } else { // Drag
         interaction.current = { ...baseInteraction };
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentX = moveEvent.clientX / zoom;
        const currentY = moveEvent.clientY / zoom;
        const dx = currentX - interaction.current.startX;
        const dy = currentY - interaction.current.startY;
        
        if (interaction.current.type === 'drag') {
            onUpdate(element.id, { x: x + dx, y: y + dy });
        } else if (interaction.current.type === 'resize' && interaction.current.handle && interaction.current.anchorPoint && interaction.current.rad !== undefined) {
             const { handle, anchorPoint, rad, initialElement } = interaction.current;
             if(!initialElement) return;

             const currentMouse = { x: currentX, y: currentY };
             
             if (['tl', 'tr', 'bl', 'br'].includes(handle)) { // Corner resize
                const diagonalVec = subtractVectors(currentMouse, anchorPoint);
                const unrotatedDiagonal = rotateVector(diagonalVec, -rad);
                
                const newWidth = Math.abs(unrotatedDiagonal.x);
                const newHeight = Math.abs(unrotatedDiagonal.y);

                const newCenter = addVectors(anchorPoint, { x: diagonalVec.x / 2, y: diagonalVec.y / 2 });
                const newX = newCenter.x - newWidth / 2;
                const newY = newCenter.y - newHeight / 2;
                
                onUpdate(element.id, { width: newWidth, height: newHeight, x: newX, y: newY });
             } else { // Edge resize
                const vec = subtractVectors(currentMouse, anchorPoint);
                const unrotatedVec = rotateVector(vec, -rad);

                let newWidth = initialElement.width;
                let newHeight = initialElement.height;
                let centerOffset: Point = { x: 0, y: 0 };
                
                if (handle === 'l') {
                    newWidth = initialElement.width - unrotatedVec.x;
                    centerOffset = { x: unrotatedVec.x / 2, y: 0 };
                } else if (handle === 'r') {
                    newWidth = initialElement.width + unrotatedVec.x;
                    centerOffset = { x: unrotatedVec.x / 2, y: 0 };
                } else if (handle === 't') {
                    newHeight = initialElement.height - unrotatedVec.y;
                    centerOffset = { x: 0, y: unrotatedVec.y / 2 };
                } else if (handle === 'b') {
                    newHeight = initialElement.height + unrotatedVec.y;
                    centerOffset = { x: 0, y: unrotatedVec.y / 2 };
                }
                
                newWidth = Math.max(10, newWidth);
                newHeight = Math.max(10, newHeight);

                const initialCenter = { x: initialElement.x + initialElement.width / 2, y: initialElement.y + initialElement.height / 2 };
                const rotatedCenterOffset = rotateVector(centerOffset, rad);
                const newCenter = addVectors(initialCenter, rotatedCenterOffset);
                
                const newX = newCenter.x - newWidth / 2;
                const newY = newCenter.y - newHeight / 2;

                onUpdate(element.id, { width: newWidth, height: newHeight, x: newX, y: newY });
             }

        } else if(interaction.current.type === 'rotate' && interaction.current.centerX && interaction.current.centerY && interaction.current.startAngle !== undefined) {
            const angle = Math.atan2(currentY - interaction.current.centerY, currentX - interaction.current.centerX) * (180 / Math.PI);
            onUpdate(element.id, { rotation: angle - interaction.current.startAngle });
        }
    };
    
    const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

  }, [onSelect, element, onUpdate, zoom, isPlaying, animationSeekTime, isEditing]);
  
  const handleDoubleClick = () => {
    if (element.type === 'text' && !element.locked) {
        onDoubleClick(element.id);
    }
  };
  
  const resizeHandles: string[] = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];

  const { animation, effects } = element;

  const animationStyle: React.CSSProperties = {};
    if (animation && animation.type !== 'none') {
        const { type, duration, delay, direction, iteration, trigger } = animation;
        const animationName = type.includes('slide') ? `${type}-${direction}` : type;
        
        const isOnLoadTrigger = trigger === 'onLoad' || trigger === 'onLoadAndHover';
        const isOnHoverTrigger = trigger === 'onHover' || trigger === 'onLoadAndHover';

        animationStyle.animationDuration = `${duration}s`;
        animationStyle.animationFillMode = 'both';

        if (animationSeekTime !== null && isOnLoadTrigger) {
            // This block is for video/GIF export seeking
            animationStyle.animationName = animationName;
            const effectiveSeekTime = animationSeekTime - delay;
            animationStyle.animationDelay = `${-effectiveSeekTime}s`;
            animationStyle.animationPlayState = 'paused';
            animationStyle.animationIterationCount = iteration === 'infinite' ? 'infinite' : '1';
        } else {
            // This block is for live preview in the editor
            const shouldAnimateForPlay = isOnLoadTrigger && isPlaying;
            const shouldAnimateForHover = isOnHoverTrigger && isHovered;
            const shouldAnimate = shouldAnimateForPlay || shouldAnimateForHover;

            animationStyle.animationName = shouldAnimate ? animationName : 'none';
            animationStyle.animationDelay = `${delay}s`;
            animationStyle.animationIterationCount = iteration === 'infinite' ? 'infinite' : '1';
            animationStyle.animationPlayState = 'running';
        }
    }

    const effectsStyle: React.CSSProperties = {
        opacity: (effects?.opacity ?? 100) / 100,
        filter: generateCssFilter(effects),
    };
    
  const showHandles = isSelected && !element.locked && !isPlaying && animationSeekTime === null && !isEditing;
  const isProcessing = processingElementId === element.id;

  const borderRadiusStyle: React.CSSProperties = {};
  if (typeof element.borderRadius === 'number') {
    borderRadiusStyle.borderRadius = `${element.borderRadius}px`;
  } else if (typeof element.borderRadius === 'object' && element.borderRadius !== null) {
    borderRadiusStyle.borderTopLeftRadius = `${element.borderRadius.tl || 0}px`;
    borderRadiusStyle.borderTopRightRadius = `${element.borderRadius.tr || 0}px`;
    borderRadiusStyle.borderBottomRightRadius = `${element.borderRadius.br || 0}px`;
    borderRadiusStyle.borderBottomLeftRadius = `${element.borderRadius.bl || 0}px`;
  }


  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        cursor: element.locked ? 'default' : (isEditing ? 'text' : (showHandles ? 'move' : 'pointer')),
        outline: showHandles ? `2px solid #4299e1` : (isEditing ? '2px solid #4299e1' : 'none'),
        outlineOffset: '2px',
        pointerEvents: isProcessing ? 'none' : 'auto',
        ...borderRadiusStyle,
        overflow: 'hidden',
      }}
      onMouseDown={!isEditing ? (e) => handleMouseDown(e, 'drag') : undefined}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <div style={{ width: '100%', height: '100%', ...animationStyle, ...effectsStyle }}>
            {children}
        </div>
        {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )}
        {showHandles && (
            <>
                <div className="absolute -top-6 left-1/2 -ml-2 w-4 h-4 rounded-full bg-background border-2 border-primary-blue cursor-alias" 
                    onMouseDown={(e) => handleMouseDown(e, 'rotate')}>
                </div>
                <div className="absolute -top-1 left-1/2 w-0.5 h-5 bg-primary-blue -translate-x-1/2"></div>
                {resizeHandles.map(handle => {
                    const cursorMap: { [key: string]: string } = {
                        tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize',
                        t: 'ns-resize', b: 'ns-resize', l: 'ew-resize', r: 'ew-resize'
                    }
                    return (
                        <div
                            key={handle}
                            onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
                            className="absolute w-2.5 h-2.5 bg-background border border-primary-blue -m-1.5"
                            style={{ 
                                cursor: cursorMap[handle],
                                top: handle.includes('t') ? '0' : handle.includes('b') ? '100%' : '50%',
                                left: handle.includes('l') ? '0' : handle.includes('r') ? '100%' : '50%',
                                transform: `translate(${handle.includes('l') ? '-50%' : handle.includes('r') ? '-50%' : '-50%'}, ${handle.includes('t') ? '-50%' : handle.includes('b') ? '-50%' : '-50%'})`
                            }}
                        />
                    );
                })}
            </>
        )}
    </div>
  );
};

export default DraggableResizable;