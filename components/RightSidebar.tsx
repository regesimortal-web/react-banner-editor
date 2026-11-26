import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import { CanvasElement, ShapeElement, TextElement, ImageElement, Animation } from '../types';
import LayersPanel from './LayersPanel';
import { FONT_FAMILIES, COLOR_PALETTE } from '../constants';
import { 
    TextAlignLeftIcon, TextAlignCenterIcon, TextAlignRightIcon, TextAlignJustifyIcon, 
    LockClosedIcon, LockOpenIcon, DuplicateIcon, DeleteIcon, CropIcon, RemoveBgIcon, 
    UndoIcon, SparklesIcon, FitToScreenIcon, ChangeBgIcon, LinkIcon, UnlinkIcon,
    CornerTopLeftIcon, CornerTopRightIcon, CornerBottomRightIcon, CornerBottomLeftIcon
} from './icons/Icons';

interface RightSidebarProps {
  elements: CanvasElement[];
  selectedElement: CanvasElement | undefined;
  onUpdateElement: (id: string, updatedProps: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onSelectElement: (id: string | null) => void;
  onReorderElements: (elements: CanvasElement[]) => void;
  onCropElement: (id: string) => void;
  onRemoveBackground: (id: string) => void;
  onRemoveWatermark: (id: string) => void;
  onChangeBackground: (id: string) => void;
  onFitImageToCanvas: (id: string) => void;
  processingElementId: string | null;
}

type ActiveTab = 'Properties' | 'Layers';

const TabButton = ({ label, activeTab, onClick }: { label: ActiveTab, activeTab: ActiveTab, onClick: () => void}) => (
     <button 
        onClick={onClick}
        className={`flex-1 text-center py-1 text-sm rounded ${activeTab === label ? 'bg-item-bg' : 'text-text-secondary'}`}>
        {label}
    </button>
);

const PropertyInput = ({ label, name, value, onChange, type = 'text', unit, min, max, step }: { label: string, name: string, value: string | number, onChange: (e: ChangeEvent<HTMLInputElement>) => void, type?: string, unit?: string, min?: number, max?: number, step?: number }) => (
    <div className="flex items-center justify-between">
        <label className="text-xs text-text-secondary">{label}</label>
        <div className="flex items-center gap-1 bg-input-bg border border-border-color rounded w-24">
            <input type={type} name={name} value={value} onChange={onChange} min={min} max={max} step={step} className="bg-transparent w-full p-1 text-xs text-right focus:outline-none" />
            {unit && <span className="text-xs text-text-secondary/70 pr-1">{unit}</span>}
        </div>
    </div>
);

const SliderInput = ({ label, value, onChange, min, max, step, unit }: { label: string, value: number, onChange: (e: ChangeEvent<HTMLInputElement>) => void, min: number, max: number, step: number, unit?: string }) => (
    <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-xs">
            <label className="text-text-secondary">{label}</label>
            <span>{value}{unit}</span>
        </div>
        <input
            type="range"
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 bg-item-bg rounded-lg appearance-none cursor-pointer accent-primary-blue"
        />
    </div>
);

const BorderRadiusControl = ({ value, onChange }: { value: CanvasElement['borderRadius'], onChange: (value: number | object) => void }) => {
    const isObject = typeof value === 'object' && value !== null;
    const [isLinked, setIsLinked] = useState(!isObject);

    const getRadii = () => {
        if (isObject) {
            return value as { tl: number; tr: number; br: number; bl: number; };
        }
        const numValue = typeof value === 'number' ? value : 0;
        return { tl: numValue, tr: numValue, br: numValue, bl: numValue };
    };

    const radii = getRadii();

    const handleInputChange = (corner: 'tl' | 'tr' | 'br' | 'bl', inputValue: string) => {
        const numValue = parseInt(inputValue, 10) || 0;
        if (isLinked) {
            onChange(numValue);
        } else {
            const newRadii = { ...radii, [corner]: numValue };
            onChange(newRadii);
        }
    };
    
    const toggleLink = () => {
        const newLinkState = !isLinked;
        setIsLinked(newLinkState);
        if (newLinkState) {
            // When linking, average the values or take the first one. Let's take tl.
            onChange(radii.tl);
        }
    };

    return (
         <div>
            <label className="text-xs text-text-secondary mb-1 block">Raio da Borda</label>
            <div className="grid grid-cols-3 grid-rows-2 gap-1 items-center justify-center">
                <CornerInput icon={<CornerTopLeftIcon className="w-4 h-4" />} value={radii.tl} onChange={(e) => handleInputChange('tl', e.target.value)} />
                <div />
                <CornerInput icon={<CornerTopRightIcon className="w-4 h-4" />} value={radii.tr} onChange={(e) => handleInputChange('tr', e.target.value)} />
                
                <div />
                <button onClick={toggleLink} className="p-1 rounded hover:bg-item-hover flex items-center justify-center h-full">
                    {isLinked ? <LinkIcon className="w-4 h-4 text-primary-blue" /> : <UnlinkIcon className="w-4 h-4 text-text-secondary" />}
                </button>
                <div />

                <CornerInput icon={<CornerBottomLeftIcon className="w-4 h-4" />} value={radii.bl} onChange={(e) => handleInputChange('bl', e.target.value)} />
                <div />
                <CornerInput icon={<CornerBottomRightIcon className="w-4 h-4" />} value={radii.br} onChange={(e) => handleInputChange('br', e.target.value)} />
            </div>
        </div>
    );
};

const CornerInput = ({ icon, value, onChange }: { icon: React.ReactNode, value: number, onChange: (e: ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="flex items-center gap-1 bg-input-bg border border-border-color rounded w-full">
        <span className="pl-1.5 text-text-secondary">{icon}</span>
        <input type="number" min={0} value={value} onChange={onChange} className="bg-transparent w-full p-1 text-xs text-right focus:outline-none" />
    </div>
);


const ColorInput = ({ label, name, value, onChange }: { label: string, name: string, value: string | undefined, onChange: (name: string, value: string) => void }) => {
     const safeValue = value || '#000000';
     const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.name, e.target.value);
     };

     const handleSwatchClick = (color: string) => {
        onChange(name, color);
     };

     return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-xs text-text-secondary">{label}</label>
                <div className="flex items-center gap-2 bg-input-bg border border-border-color rounded px-2">
                    <input type="text" name={name} value={safeValue} onChange={handleInputChange} className="bg-transparent w-16 p-1 text-xs focus:outline-none" />
                    <div className="relative w-5 h-5">
                         <input type="color" name={name} value={safeValue} onChange={handleInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                         <div className="w-5 h-5 rounded border border-border-color" style={{ backgroundColor: safeValue }}></div>
                    </div>
                </div>
            </div>
             <div className="flex flex-wrap gap-1.5">
                {COLOR_PALETTE.map(color => (
                    <button 
                        key={color}
                        onClick={() => handleSwatchClick(color)}
                        className={`w-5 h-5 rounded-full border border-border-color focus:outline-none focus:ring-2 focus:ring-primary-blue ${safeValue.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary-blue ring-offset-2 ring-offset-sidebar' : ''}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                    />
                ))}
            </div>
        </div>
    )
}

interface SectionProps {
  title: string;
  children?: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
    <div>
        <h3 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">{title}</h3>
        <div className="space-y-4 bg-background p-3 rounded-md">{children}</div>
    </div>
);

const PropertiesPanel: React.FC<Pick<RightSidebarProps, 'selectedElement' | 'onUpdateElement' | 'onDeleteElement' | 'onDuplicateElement' | 'onCropElement' | 'onRemoveBackground' | 'onRemoveWatermark' | 'onChangeBackground' | 'onFitImageToCanvas' | 'processingElementId'>> = ({ selectedElement, onUpdateElement, onDeleteElement, onDuplicateElement, onCropElement, onRemoveBackground, onRemoveWatermark, onChangeBackground, onFitImageToCanvas, processingElementId }) => {
    
  const imageReplaceInputRef = useRef<HTMLInputElement>(null);
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(true);
    
  useEffect(() => {
    if (selectedElement?.type === 'image') {
        setIsAspectRatioLocked(true);
    } else {
        setIsAspectRatioLocked(false);
    }
  }, [selectedElement?.id]);

  const handlePropertyChange = (name: string, value: any) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, { [name]: value });
  };
    
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!selectedElement) return;
    const { name, value, type } = e.target;
    
    let parsedValue: string | number = value;
    if (type === 'number' || e.target.dataset.type === 'number') {
        parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) parsedValue = 0;
    }

    if (
        selectedElement.type === 'image' &&
        isAspectRatioLocked &&
        (name === 'width' || name === 'height') &&
        typeof parsedValue === 'number' &&
        parsedValue > 0
    ) {
        const img = selectedElement as ImageElement;
        const aspectRatio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);

        if (isNaN(aspectRatio) || aspectRatio <= 0) {
            handlePropertyChange(name, parsedValue);
            return;
        }

        if (name === 'width') {
            const newWidth = parsedValue;
            const newHeight = newWidth / aspectRatio;
            onUpdateElement(selectedElement.id, { width: newWidth, height: newHeight });
        } else { // name === 'height'
            const newHeight = parsedValue;
            const newWidth = newHeight * aspectRatio;
            onUpdateElement(selectedElement.id, { width: newWidth, height: newHeight });
        }
    } else {
        handlePropertyChange(name, parsedValue);
    }
  };
  
  const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    if (!selectedElement || !selectedElement.animation) return;
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? parseFloat(value) : value;

    const updatedAnimation = {
        ...selectedElement.animation,
        [name]: parsedValue,
    };
    onUpdateElement(selectedElement.id, { animation: updatedAnimation });
  };

    const handleEffectChange = (effectName: 'textStroke', value: any) => {
        if (!selectedElement) return;

        const updatedPartialEffects = {
            [effectName]: {
                ...selectedElement.effects?.[effectName],
                ...value
            }
        };
        onUpdateElement(selectedElement.id, { effects: updatedPartialEffects });
    };
  
  const handleReplaceImageClick = () => {
    imageReplaceInputRef.current?.click();
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        if (src) {
            const img = new Image();
            img.onload = () => {
                const newHeight = (img.height / img.width) * selectedElement.width;
                onUpdateElement(selectedElement.id, { 
                    src, 
                    height: newHeight,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    crop: undefined, // Reset crop on image replace
                    originalSrc: undefined, // Reset background removal
                });
            }
            img.src = src;
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

    if (!selectedElement) {
        return <div className="text-center text-text-secondary mt-10">Select an element to edit its properties.</div>
    }

    const isShape = selectedElement.type !== 'text' && selectedElement.type !== 'image';
    const hasFill = isShape && 'fill' in selectedElement;
    const hasAiEdited = selectedElement.type === 'image' && !!(selectedElement as ImageElement).originalSrc;

    const isProcessing = processingElementId === selectedElement.id;

    return (
        <div className="space-y-6">
            <Section title="Status">
                <button 
                    onClick={() => handlePropertyChange('locked', !selectedElement.locked)}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm"
                >
                    {selectedElement.locked ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
                    {selectedElement.locked ? 'Unlock' : 'Lock'}
                </button>
            </Section>

            <Section title="Actions">
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onDuplicateElement(selectedElement.id)} className="flex items-center justify-center gap-2 p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm">
                        <DuplicateIcon className="w-4 h-4" />
                        Duplicate
                    </button>
                    <button onClick={() => onDeleteElement(selectedElement.id)} className="flex items-center justify-center gap-2 p-2 bg-red-800/50 text-red-300 hover:bg-red-800/80 rounded-md text-sm">
                        <DeleteIcon className="w-4 h-4" />
                        Delete
                    </button>
                 </div>
            </Section>

            <fieldset disabled={selectedElement.locked} className="space-y-6 disabled:opacity-50">
                <Section title="Position & Size">
                     <div className="grid grid-cols-2 gap-2">
                        <PropertyInput label="X" name="x" value={Math.round(selectedElement.x)} onChange={handleInputChange} type="number" />
                        <PropertyInput label="Y" name="y" value={Math.round(selectedElement.y)} onChange={handleInputChange} type="number"/>
                    </div>
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                             <PropertyInput label="W" name="width" value={Math.round(selectedElement.width)} onChange={handleInputChange} type="number" />
                        </div>
                        {selectedElement.type === 'image' ? (
                            <button
                                onClick={() => setIsAspectRatioLocked(prev => !prev)}
                                className={`p-2 mb-px rounded-md transition-colors ${isAspectRatioLocked ? 'bg-blue-500/20 text-primary-blue' : 'text-text-secondary hover:bg-item-hover'}`}
                                title="Lock Aspect Ratio"
                            >
                                {isAspectRatioLocked ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
                            </button>
                        ) : (
                            <div className="p-2 mb-px" title="Aspect ratio not applicable">
                               <LockOpenIcon className="w-4 h-4 text-text-secondary/20" />
                            </div>
                        )}
                        <div className="flex-1">
                            <PropertyInput label="H" name="height" value={Math.round(selectedElement.height)} onChange={handleInputChange} type="number" />
                        </div>
                    </div>
                    <PropertyInput label="Angle" name="rotation" value={selectedElement.rotation} onChange={handleInputChange} type="number" unit="°" />
                    <BorderRadiusControl 
                        value={selectedElement.borderRadius}
                        onChange={(newValue) => handlePropertyChange('borderRadius', newValue)}
                    />
                </Section>

                { selectedElement.type === 'text' && (
                    <>
                        <Section title="Text">
                            <textarea name="text" value={(selectedElement as TextElement).text} onChange={handleInputChange} className="w-full bg-input-bg border border-border-color rounded p-2 text-xs" rows={3}></textarea>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-text-secondary">Font</label>
                                    <select name="fontFamily" value={(selectedElement as TextElement).fontFamily} onChange={handleInputChange} className="bg-input-bg border border-border-color rounded p-1 text-xs w-40 focus:outline-none focus:border-primary-blue">
                                        {FONT_FAMILIES.map(font => (
                                            <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <PropertyInput label="Font Size" name="fontSize" value={(selectedElement as TextElement).fontSize} onChange={handleInputChange} type="number" min={1} />
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs text-text-secondary">Weight</label>
                                        <select name="fontWeight" value={(selectedElement as TextElement).fontWeight} onChange={handleInputChange} data-type="number" className="bg-input-bg border border-border-color rounded p-1 text-xs w-24 focus:outline-none focus:border-primary-blue">
                                            <option value="normal">Normal</option>
                                            <option value="bold">Bold</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs text-text-secondary">Align</label>
                                    <div className="flex bg-input-bg border border-border-color rounded p-0.5">
                                        {(['left', 'center', 'right', 'justify'] as const).map(align => {
                                            const icons = {
                                                left: <TextAlignLeftIcon className="w-4 h-4" />,
                                                center: <TextAlignCenterIcon className="w-4 h-4" />,
                                                right: <TextAlignRightIcon className="w-4 h-4" />,
                                                justify: <TextAlignJustifyIcon className="w-4 h-4" />,
                                            };
                                            return (
                                                <button
                                                    key={align}
                                                    onClick={() => handlePropertyChange('textAlign', align)}
                                                    className={`p-1 rounded ${(selectedElement as TextElement).textAlign === align ? 'bg-primary-blue text-white' : 'hover:bg-item-hover'}`}
                                                    title={`Align ${align.charAt(0).toUpperCase() + align.slice(1)}`}
                                                >
                                                    {icons[align]}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                            <ColorInput label="Color" name="color" value={(selectedElement as TextElement).color} onChange={handlePropertyChange} />
                        </Section>
                        <Section title="Borda do Texto">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-text-secondary">Ativar Borda</label>
                                <input 
                                    type="checkbox" 
                                    checked={selectedElement.effects?.textStroke?.enabled ?? false}
                                    onChange={(e) => handleEffectChange('textStroke', { enabled: e.target.checked })}
                                    className="h-4 w-4 rounded border-border-color bg-input-bg text-primary-blue focus:ring-primary-blue focus:ring-offset-0"
                                />
                            </div>
                            {selectedElement.effects?.textStroke?.enabled && (
                                <div className="space-y-4 pt-4 mt-4 border-t border-border-color">
                                    <SliderInput 
                                        label="Espessura" 
                                        value={selectedElement.effects?.textStroke?.width ?? 1} 
                                        onChange={(e) => handleEffectChange('textStroke', { width: parseFloat(e.target.value) })}
                                        min={0} max={10} step={0.5} unit="px" 
                                    />
                                    <ColorInput 
                                        label="Cor da Borda" 
                                        name="textStrokeColor"
                                        value={selectedElement.effects?.textStroke?.color ?? '#000000'} 
                                        onChange={(_, val) => handleEffectChange('textStroke', { color: val })}
                                    />
                                </div>
                            )}
                        </Section>
                    </>
                )}

                { isShape && (
                    <Section title="Appearance">
                        {hasFill && <ColorInput label="Fill" name="fill" value={(selectedElement as ShapeElement).fill} onChange={handlePropertyChange} />}
                        <ColorInput label="Stroke" name="stroke" value={(selectedElement as ShapeElement).stroke} onChange={handlePropertyChange} />
                        <PropertyInput label="Stroke Width" name="strokeWidth" value={(selectedElement as ShapeElement).strokeWidth} onChange={handleInputChange} type="number" min={0} />
                    </Section>
                )}

                { selectedElement.type === 'image' && (
                     <Section title="Image">
                         <div className="flex items-center justify-between">
                             <label className="text-xs text-text-secondary">Source</label>
                             <input type="text" name="src" value={(selectedElement as ImageElement).src} onChange={handleInputChange} className="bg-input-bg border border-border-color rounded p-1 text-xs w-40" />
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            ref={imageReplaceInputRef}
                            onChange={handleImageFileChange}
                            accept="image/*"
                        />
                         <div className="flex flex-col gap-2">
                            <button onClick={handleReplaceImageClick} className="w-full text-center p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm transition-colors">
                                Replace Image
                            </button>
                             <button onClick={() => onCropElement(selectedElement.id)} className="flex items-center justify-center gap-2 p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm">
                                <CropIcon className="w-4 h-4" />
                                Crop Image
                            </button>
                             <button
                                onClick={() => onFitImageToCanvas(selectedElement.id)}
                                className="flex items-center justify-center gap-2 p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm"
                                >
                                <FitToScreenIcon className="w-4 h-4" />
                                <span>Fit to Canvas</span>
                            </button>
                            {isProcessing ? (
                                <div className="flex items-center justify-center gap-2 p-2 bg-item-bg rounded-md text-sm text-text-secondary">
                                    <svg className="animate-spin h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </div>
                            ) : hasAiEdited ? (
                                <button
                                    onClick={() => onRemoveBackground(selectedElement.id)} // This one has the restore logic
                                    className="flex items-center justify-center gap-2 p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm"
                                >
                                    <UndoIcon className="w-4 h-4" />
                                    <span>Restore Original</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => onChangeBackground(selectedElement.id)}
                                        className="flex items-center justify-center gap-2 p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm"
                                    >
                                        <ChangeBgIcon className="w-4 h-4" />
                                        <span>Mudar Fundo</span>
                                    </button>
                                    <button
                                        onClick={() => onRemoveBackground(selectedElement.id)}
                                        className="flex items-center justify-center gap-2 p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm"
                                    >
                                        <RemoveBgIcon className="w-4 h-4" />
                                        <span>Remove Background</span>
                                    </button>
                                    <button
                                        onClick={() => onRemoveWatermark(selectedElement.id)}
                                        className="flex items-center justify-center gap-2 p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm"
                                    >
                                        <SparklesIcon className="w-4 h-4" />
                                        <span>Remove Watermark</span>
                                    </button>
                                </>
                            )}
                         </div>
                    </Section>
                )}
                 <Section title="Animation">
                    <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <label className="text-xs text-text-secondary">Trigger</label>
                            <select name="trigger" value={selectedElement.animation?.trigger || 'onLoad'} onChange={handleAnimationChange} className="bg-input-bg border border-border-color rounded p-1 text-xs w-40 focus:outline-none focus:border-primary-blue">
                                <option value="onLoad">On Load</option>
                                <option value="onHover">On Hover</option>
                                <option value="onLoadAndHover">On Load &amp; Hover</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-text-secondary">Type</label>
                            <select name="type" value={selectedElement.animation?.type || 'none'} onChange={handleAnimationChange} className="bg-input-bg border border-border-color rounded p-1 text-xs w-40 focus:outline-none focus:border-primary-blue">
                                <option value="none">None</option>
                                <option value="fadeIn">Fade In</option>
                                <option value="fadeOut">Fade Out</option>
                                <option value="slideIn">Slide In</option>
                                <option value="slideOut">Slide Out</option>
                                <option value="pulse">Pulse</option>
                                <option value="bounce">Bounce</option>
                                <option value="zoomIn">Zoom In</option>
                                <option value="zoomOut">Zoom Out</option>
                                <option value="rotate">Rotate</option>
                                <option value="shake">Shake</option>
                                <option value="jello">Jello</option>
                            </select>
                        </div>
                        {selectedElement.animation?.type?.includes('slide') && (
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-text-secondary">Direction</label>
                                <select name="direction" value={selectedElement.animation?.direction || 'left'} onChange={handleAnimationChange} className="bg-input-bg border border-border-color rounded p-1 text-xs w-40 focus:outline-none focus:border-primary-blue">
                                    <option value="left">From Left</option>
                                    <option value="right">From Right</option>
                                    <option value="top">From Top</option>
                                    <option value="bottom">From Bottom</option>
                                </select>
                            </div>
                        )}
                        <PropertyInput label="Duration" name="duration" value={selectedElement.animation?.duration ?? 1} onChange={handleAnimationChange} type="number" step={0.1} min={0} unit="s" />
                        <PropertyInput label="Delay" name="delay" value={selectedElement.animation?.delay ?? 0} onChange={handleAnimationChange} type="number" step={0.1} min={0} unit="s" />
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-text-secondary">Iterations</label>
                            <select name="iteration" value={selectedElement.animation?.iteration || '1'} onChange={handleAnimationChange} className="bg-input-bg border border-border-color rounded p-1 text-xs w-40 focus:outline-none focus:border-primary-blue">
                                <option value="1">Once</option>
                                <option value="infinite">Infinite</option>
                            </select>
                        </div>
                    </div>
                </Section>
            </fieldset>
        </div>
    );
}

const RightSidebar: React.FC<RightSidebarProps> = (props) => {
  const { selectedElement, onUpdateElement, onDeleteElement, onDuplicateElement, onReorderElements, onCropElement, onRemoveBackground, onRemoveWatermark, onChangeBackground, onFitImageToCanvas, processingElementId } = props;
  const [activeTab, setActiveTab] = useState<ActiveTab>('Properties');
  
  return (
    <>
        <div className="flex bg-background rounded-md p-1 mb-4">
            <TabButton label="Properties" activeTab={activeTab} onClick={() => setActiveTab('Properties')} />
            <TabButton label="Layers" activeTab={activeTab} onClick={() => setActiveTab('Layers')} />
        </div>
        
        {activeTab === 'Properties' && <PropertiesPanel selectedElement={selectedElement} onUpdateElement={onUpdateElement} onDeleteElement={onDeleteElement} onDuplicateElement={onDuplicateElement} onCropElement={onCropElement} onRemoveBackground={onRemoveBackground} onRemoveWatermark={onRemoveWatermark} onChangeBackground={onChangeBackground} onFitImageToCanvas={onFitImageToCanvas} processingElementId={processingElementId} />}
        {activeTab === 'Layers' && <LayersPanel {...props} onReorderElements={onReorderElements} />}

    </>
  );
};

export default RightSidebar;