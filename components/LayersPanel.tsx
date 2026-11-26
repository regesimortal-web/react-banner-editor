import React, { useState, useRef } from 'react';
import { CanvasElement } from '../types';
import { DuplicateIcon, DeleteIcon, LockClosedIcon, LockOpenIcon } from './icons/Icons';
import { RectangleIcon, CircleIcon, TriangleIcon, LineIcon, ArrowIcon, StarIcon, HeartIcon, LightningIcon, RocketIcon, PentagonIcon, HexagonIcon, OctagonIcon, CrossIcon, DashedLineIcon, CurvedArrowIcon, SpeechBubbleIcon, CloudIcon, CheckmarkIcon, CogIcon, ShieldIcon } from './icons/Shapes';
import { AddTextIcon, AddImageIcon } from './icons/Icons';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedElementId: string | undefined | null;
  onSelectElement: (id: string | null) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onUpdateElement: (id: string, updatedProps: Partial<CanvasElement>) => void;
  onReorderElements: (elements: CanvasElement[]) => void;
}

const getElementIcon = (element: CanvasElement) => {
    const props = { className: "w-4 h-4 text-text-secondary" };
    switch (element.type) {
        case 'rectangle': return <RectangleIcon {...props} fill={element.fill} />;
        case 'circle': return <CircleIcon {...props} fill={element.fill} />;
        case 'triangle': return <TriangleIcon {...props} fill={element.fill} />;
        case 'line': return <LineIcon {...props} stroke={element.stroke} strokeWidth={2} />;
        case 'arrow': return <ArrowIcon {...props} stroke={element.stroke} strokeWidth={2} />;
        case 'star': return <StarIcon {...props} fill={element.fill} />;
        case 'heart': return <HeartIcon {...props} fill={element.fill} />;
        case 'lightning': return <LightningIcon {...props} fill={element.fill} />;
        case 'rocket': return <RocketIcon {...props} fill={element.fill} />;
        case 'pentagon': return <PentagonIcon {...props} fill={element.fill} />;
        case 'hexagon': return <HexagonIcon {...props} fill={element.fill} />;
        case 'octagon': return <OctagonIcon {...props} fill={element.fill} />;
        case 'cross': return <CrossIcon {...props} fill={element.fill} />;
        case 'dashed-line': return <DashedLineIcon {...props} stroke={element.stroke} strokeWidth={2} />;
        case 'curved-arrow': return <CurvedArrowIcon {...props} stroke={element.stroke} strokeWidth={2} />;
        case 'speech-bubble': return <SpeechBubbleIcon {...props} fill={element.fill} />;
        case 'cloud': return <CloudIcon {...props} fill={element.fill} />;
        case 'checkmark': return <CheckmarkIcon {...props} fill={element.fill} />;
        case 'cog': return <CogIcon {...props} fill={element.fill} />;
        case 'shield': return <ShieldIcon {...props} fill={element.fill} />;
        case 'text': return <AddTextIcon {...props} />;
        case 'image': return <AddImageIcon {...props} />;
        default: return null;
    }
}


const LayersPanel: React.FC<LayersPanelProps> = ({ elements, selectedElementId, onSelectElement, onDeleteElement, onDuplicateElement, onUpdateElement, onReorderElements }) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => setDragActive(true), 0); // Allow time for browser to update drag image
    };
    
    const handleDragEnter = (index: number) => {
        dragOverItem.current = index;
    };
    
    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
            const reordered = [...elements].reverse();
            const draggedItemContent = reordered.splice(dragItem.current, 1)[0];
            reordered.splice(dragOverItem.current, 0, draggedItemContent);
            onReorderElements(reordered.reverse());
        }
        dragItem.current = null;
        dragOverItem.current = null;
        setDragActive(false);
    };


  return (
    <div className="space-y-2">
      <h3 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">Layers</h3>
      <div className="space-y-1">
        {[...elements].reverse().map((element, index) => (
          <div
            key={element.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => onSelectElement(element.id)}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer relative transition-all duration-150
              ${dragActive && dragItem.current === index ? 'opacity-50' : ''}
              ${selectedElementId === element.id ? 'bg-primary-blue text-white' : 'bg-background hover:bg-item-hover'}
            `}
          >
            {dragActive && dragOverItem.current === index && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-blue-hover" />
            )}
            <div className="flex items-center gap-2">
                {getElementIcon(element)}
                <span className="text-xs truncate">{element.type}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                  onClick={(e) => { e.stopPropagation(); onUpdateElement(element.id, { locked: !element.locked }); }}
                  className="p-1 hover:bg-primary-blue-hover/50 rounded"
                  title={element.locked ? "Unlock" : "Lock"}
                  aria-label={element.locked ? "Unlock element" : "Lock element"}
              >
                  {element.locked ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDuplicateElement(element.id); }}
                className="p-1 hover:bg-primary-blue-hover/50 rounded"
                title="Duplicate"
                aria-label="Duplicate element"
               >
                <DuplicateIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteElement(element.id); }}
                className="p-1 hover:bg-primary-blue-hover/50 rounded"
                title="Delete"
                aria-label="Delete element"
              >
                <DeleteIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {elements.length === 0 && <p className="text-xs text-text-secondary text-center p-4">The canvas is empty.</p>}
      </div>
    </div>
  );
};

export default LayersPanel;