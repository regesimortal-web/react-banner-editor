import React, { forwardRef } from 'react';
import { CanvasElement, ImageElement, TextElement } from '../types';
import DraggableResizable from './DraggableResizable';
import { RectangleIcon, CircleIcon, TriangleIcon, LineIcon, ArrowIcon, StarIcon, HeartIcon, LightningIcon, RocketIcon, PentagonIcon, HexagonIcon, OctagonIcon, CrossIcon, DashedLineIcon, CurvedArrowIcon, SpeechBubbleIcon, CloudIcon, CheckmarkIcon, CogIcon } from './icons/Shapes';
import TextEditor from './TextEditor';

interface CanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id:string, props: Partial<CanvasElement>) => void;
  zoom: number;
  pan: { x: number, y: number };
  width: number;
  height: number;
  isPlaying: boolean;
  animationSeekTime: number | null;
  editingElementId: string | null;
  onSetEditingId: (id: string | null) => void;
  processingElementId: string | null;
}

const renderElement = (element: CanvasElement, onUpdateElement: (id:string, props: Partial<CanvasElement>) => void) => {
    switch(element.type){
        case 'text':
            const textStrokeStyle: React.CSSProperties = {};
            if (element.effects?.textStroke?.enabled && element.effects.textStroke.width > 0) {
                textStrokeStyle.WebkitTextStroke = `${element.effects.textStroke.width}px ${element.effects.textStroke.color}`;
                // @ts-ignore
                textStrokeStyle.textStroke = `${element.effects.textStroke.width}px ${element.effects.textStroke.color}`;
            }
            return (
                 <div
                    className="w-full h-full p-0 bg-transparent resize-none border-none focus:outline-none whitespace-pre-wrap"
                    style={{
                        color: element.color,
                        fontSize: `${element.fontSize}px`,
                        fontFamily: element.fontFamily,
                        fontWeight: element.fontWeight,
                        textAlign: element.textAlign,
                        lineHeight: 1.2,
                        cursor: element.locked ? 'default' : 'text',
                        display: 'flex',
                        alignItems: element.textAlign === 'center' ? 'center' : 'flex-start',
                        justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                        ...textStrokeStyle
                    }}
                >
                    {element.text}
                </div>
            )
        case 'image':
            const imgEl = element as ImageElement;

            const CroppedImage = ({ src, crop }: { src: string, crop: ImageElement['crop'] }) => {
                if (!crop) return <img src={src} alt="" className="w-full h-full object-fill" draggable="false" />;
                
                const { x, y, width, height } = crop;

                const backgroundWidth = (100 / width) * 100;
                const backgroundHeight = (100 / height) * 100;
                
                const backgroundPositionX = width === 100 ? 0 : (-x / (100 - width)) * 100;
                const backgroundPositionY = height === 100 ? 0 : (-y / (100 - height)) * 100;

                return (
                   <div className="w-full h-full" style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: `${backgroundWidth}% ${backgroundHeight}%`,
                        backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
                        backgroundRepeat: 'no-repeat',
                   }}></div>
               );
            };

            if (imgEl.crop) {
                return <CroppedImage src={imgEl.src} crop={imgEl.crop} />;
            }

            if (element.src.includes('picsum.photos')) {
                return (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                        <img src={element.src} alt="" className="w-full h-full object-fill opacity-50" draggable="false" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-gray-500 font-semibold bg-white/70 px-2 py-1 rounded">PLACEHOLDER</span>
                        </div>
                    </div>
                )
             }
            return <img src={element.src} alt="" className="w-full h-full object-fill" draggable="false" />
        default: // ShapeElement
            const props = {
                className:"w-full h-full",
                fill: element.fill,
                stroke: element.stroke,
                strokeWidth: element.strokeWidth,
            }
            switch(element.type){
                case 'rectangle': return <RectangleIcon {...props} />;
                case 'circle': return <CircleIcon {...props} />;
                case 'triangle': return <TriangleIcon {...props} />;
                case 'line': return <LineIcon {...props} />;
                case 'arrow': return <ArrowIcon {...props} />;
                case 'star': return <StarIcon {...props} />;
                case 'heart': return <HeartIcon {...props} />;
                case 'lightning': return <LightningIcon {...props} />;
                case 'rocket': return <RocketIcon {...props} />;
                case 'pentagon': return <PentagonIcon {...props} />;
                case 'hexagon': return <HexagonIcon {...props} />;
                case 'octagon': return <OctagonIcon {...props} />;
                case 'cross': return <CrossIcon {...props} />;
                case 'dashed-line': return <DashedLineIcon {...props} />;
                case 'curved-arrow': return <CurvedArrowIcon {...props} />;
                case 'speech-bubble': return <SpeechBubbleIcon {...props} />;
                case 'cloud': return <CloudIcon {...props} />;
                case 'checkmark': return <CheckmarkIcon {...props} />;
                case 'cog': return <CogIcon {...props} />;
                default: return null;
            }
    }
}

const Canvas: React.FC<CanvasProps> = forwardRef<HTMLDivElement, CanvasProps>(({ elements, selectedElementId, onSelectElement, onUpdateElement, zoom, pan, width, height, isPlaying, animationSeekTime, editingElementId, onSetEditingId, processingElementId }, ref) => {
    
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget.querySelector('#canvas')){
        onSelectElement(null);
    }
  };

  return (
    <div
      id="canvas-container"
      ref={ref}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: 'top left'
      }}
      onClick={handleCanvasClick}
    >
        <div id="canvas" className="bg-canvas shadow-lg relative w-full h-full overflow-hidden">
            {elements.map((element) => {
                const isEditing = element.id === editingElementId;
                return (
                    <DraggableResizable
                        key={element.id}
                        element={element}
                        isSelected={element.id === selectedElementId}
                        onSelect={onSelectElement}
                        onUpdate={onUpdateElement}
                        zoom={zoom}
                        isPlaying={isPlaying}
                        animationSeekTime={animationSeekTime}
                        isEditing={isEditing}
                        onDoubleClick={(id) => onSetEditingId(id)}
                        processingElementId={processingElementId}
                    >
                        {isEditing && element.type === 'text' ? (
                            <TextEditor 
                                element={element}
                                onUpdateElement={onUpdateElement}
                                onExit={() => onSetEditingId(null)}
                            />
                        ) : (
                            <div className="w-full h-full relative">
                                {renderElement(element, onUpdateElement)}
                            </div>
                        )}
                    </DraggableResizable>
                );
            })}
        </div>
    </div>
  );
});

export default Canvas;