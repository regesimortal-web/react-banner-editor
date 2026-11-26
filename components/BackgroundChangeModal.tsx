import React, { useState, useRef, useCallback, ChangeEvent, useLayoutEffect, useEffect } from 'react';
import { ImageElement, Selection } from '../types';
import { COLOR_PALETTE } from '../constants';

interface BackgroundChangeModalProps {
    element: ImageElement;
    onConfirm: (id: string, selections: Selection[], newBackground: { type: 'color', value: string } | { type: 'image', value: string }) => void;
    onCancel: () => void;
}

type BgType = 'color' | 'image';
type SelectionMode = 'keep' | 'remove';

const TabButton = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            active ? 'bg-primary-blue text-white' : 'bg-item-bg hover:bg-item-hover text-text-secondary'
        }`}
    >
        {label}
    </button>
);

const ModeButton = ({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) => (
     <button
        onClick={onClick}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
            active ? `${color} text-white` : 'bg-item-bg hover:bg-item-hover text-text-secondary'
        }`}
    >
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        {label}
    </button>
);

const BackgroundChangeModal: React.FC<BackgroundChangeModalProps> = ({ element, onConfirm, onCancel }) => {
    const [selections, setSelections] = useState<Selection[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [bgType, setBgType] = useState<BgType>('color');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>('keep');

    const imgRef = useRef<HTMLImageElement>(null);
    const bgImageInputRef = useRef<HTMLInputElement>(null);
    const interaction = useRef<{ startX: number; startY: number; } | null>(null);
    const [imageGeometry, setImageGeometry] = useState({ x: 0, y: 0, width: 1, height: 1 });

    useLayoutEffect(() => {
        const calculateGeometry = () => {
            if (!imgRef.current) return;
            const img = imgRef.current;
            const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;

            if (naturalWidth === 0 || naturalHeight === 0 || clientWidth === 0 || clientHeight === 0) return;

            const naturalAspectRatio = naturalWidth / naturalHeight;
            const clientAspectRatio = clientWidth / clientHeight;

            let renderedWidth, renderedHeight, xOffset, yOffset;

            if (naturalAspectRatio > clientAspectRatio) {
                renderedWidth = clientWidth;
                renderedHeight = clientWidth / naturalAspectRatio;
                xOffset = 0;
                yOffset = (clientHeight - renderedHeight) / 2;
            } else {
                renderedHeight = clientHeight;
                renderedWidth = clientHeight * naturalAspectRatio;
                yOffset = 0;
                xOffset = (clientWidth - renderedWidth) / 2;
            }
            setImageGeometry({ x: xOffset, y: yOffset, width: renderedWidth, height: renderedHeight });
        };

        const imgElement = imgRef.current;
        let resizeObserver: ResizeObserver;
        if (imgElement) {
             resizeObserver = new ResizeObserver(calculateGeometry);
             resizeObserver.observe(imgElement);
        }

        if (imgElement?.complete) {
            calculateGeometry();
        } else if (imgElement) {
            imgElement.onload = calculateGeometry;
        }
        
        return () => {
            if(imgElement) {
                imgElement.onload = null;
                if(resizeObserver) resizeObserver.unobserve(imgElement);
            }
        };
    }, [element.src]);

    const getMousePosOnImage = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!imgRef.current) return { x: 0, y: 0 };
        const rect = imgRef.current.getBoundingClientRect();
        const geo = imageGeometry;
        
        let x = e.clientX - rect.left - geo.x;
        let y = e.clientY - rect.top - geo.y;

        x = Math.max(0, Math.min(x, geo.width));
        y = Math.max(0, Math.min(y, geo.height));

        return { x, y };
    }, [imageGeometry]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!interaction.current || !isDrawing) return;

        const { startX, startY } = interaction.current;
        const { x: currentX, y: currentY } = getMousePosOnImage(e);
        
        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        setSelections(prev => {
            const newSelections = [...prev];
            const lastSelection = newSelections[newSelections.length - 1];
            if (lastSelection) {
                newSelections[newSelections.length - 1] = { ...lastSelection, x, y, width, height };
            }
            return newSelections;
        });
    }, [isDrawing, getMousePosOnImage]);

    const handleMouseUp = useCallback(() => {
        setIsDrawing(false);
        interaction.current = null;
        // Check the last selection and remove it if it's too small (likely a click)
        setSelections(prev => {
            if (prev.length === 0) return prev;
            const lastSelection = prev[prev.length - 1];
            // If the selection is tiny, it was probably a click, so remove it.
            if (lastSelection && (lastSelection.width < 5 || lastSelection.height < 5)) {
                return prev.slice(0, -1); // Return the array without the last element
            }
            return prev; // Otherwise, keep the valid selection
        });
    }, []);

    useEffect(() => {
        if (isDrawing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDrawing, handleMouseMove, handleMouseUp]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const { x, y } = getMousePosOnImage(e);
        interaction.current = { startX: x, startY: y };
        setIsDrawing(true);
        setSelections(prev => [...prev, { x, y, width: 0, height: 0, type: selectionMode }]);
    };

    const handleDeleteSelection = (index: number) => {
        setSelections(prev => prev.filter((_, i) => i !== index));
    };

    const handleClearSelections = () => {
        setSelections([]);
    };
    
    const handleConfirm = () => {
        if (selections.length === 0 || !imgRef.current) return;

        const { naturalWidth = 1, naturalHeight = 1 } = element;
        const { width: renderedWidth, height: renderedHeight } = imageGeometry;

        const scaleX = renderedWidth > 0 ? naturalWidth / renderedWidth : 1;
        const scaleY = renderedHeight > 0 ? naturalHeight / renderedHeight : 1;
        
        const finalSelections = selections.map(s => ({
            ...s,
            x: s.x * scaleX,
            y: s.y * scaleY,
            width: s.width * scaleX,
            height: s.height * scaleY,
        }));

        const newBackground = bgType === 'color' 
            ? { type: 'color' as const, value: bgColor }
            : { type: 'image' as const, value: bgImage! };

        onConfirm(element.id, finalSelections, newBackground);
    };

    const handleBgImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setBgImage(event.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isConfirmDisabled = selections.length === 0 || selections.some(s => s.width < 5 || s.height < 5) || (bgType === 'image' && !bgImage);

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onMouseDown={onCancel}>
            <div className="bg-sidebar rounded-lg shadow-xl w-full max-w-5xl flex flex-col" style={{ height: '90vh' }} onMouseDown={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border-color">
                    <h3 className="text-lg font-semibold text-foreground">Mudar Fundo da Imagem</h3>
                    <p className="text-sm text-text-secondary">Use Manter (verde) para selecionar objetos e Remover (vermelho) para áreas do fundo.</p>
                </div>
                <div className="flex-grow flex p-4 overflow-hidden gap-4">
                    <div className="flex-grow flex items-center justify-center bg-background rounded-md min-w-0">
                        <div className="relative select-none cursor-crosshair" onMouseDown={handleMouseDown} style={{ width: '100%', height: '100%' }}>
                            <img ref={imgRef} src={element.src} alt="Seleção de fundo" className="block object-contain" style={{ width: '100%', height: '100%' }} />
                            <div className="absolute top-0 left-0 pointer-events-none" style={{
                                top: imageGeometry.y,
                                left: imageGeometry.x,
                                width: imageGeometry.width,
                                height: imageGeometry.height,
                            }}>
                                {selections.map((selection, index) => {
                                    const borderColor = selection.type === 'keep' ? 'border-green-500' : 'border-red-500';
                                    const bgColor = selection.type === 'keep' ? 'bg-green-500/20' : 'bg-red-500/20';
                                    return (
                                    <div
                                        key={index}
                                        className={`absolute border-2 border-dashed ${borderColor} ${bgColor}`}
                                        style={{
                                            left: selection.x,
                                            top: selection.y,
                                            width: selection.width,
                                            height: selection.height,
                                        }}
                                    >
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSelection(index); }}
                                            className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold pointer-events-auto"
                                            title="Remover seleção"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )})}
                            </div>
                        </div>
                    </div>
                    <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                        <div className="flex flex-col gap-3 p-3 bg-background rounded-md">
                            <label className="text-sm font-medium">Ferramenta de Seleção</label>
                            <div className="flex bg-item-hover p-1 rounded-lg gap-1">
                                <ModeButton label="Manter" active={selectionMode === 'keep'} onClick={() => setSelectionMode('keep')} color="bg-green-500" />
                                <ModeButton label="Remover" active={selectionMode === 'remove'} onClick={() => setSelectionMode('remove')} color="bg-red-500" />
                            </div>
                        </div>

                        <div className="flex bg-item-hover p-1 rounded-lg">
                            <TabButton label="Cor" active={bgType === 'color'} onClick={() => setBgType('color')} />
                            <TabButton label="Imagem" active={bgType === 'image'} onClick={() => setBgType('image')} />
                        </div>
                        {bgType === 'color' ? (
                            <div className="flex flex-col gap-3 p-3 bg-background rounded-md">
                                <label className="text-sm font-medium">Cor de Fundo</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-8 h-8 flex-shrink-0">
                                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className="w-8 h-8 rounded-md border border-border-color" style={{ backgroundColor: bgColor }}></div>
                                    </div>
                                    <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="bg-input-bg border border-border-color rounded px-2 py-1 text-sm w-full" />
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {COLOR_PALETTE.map(color => (
                                        <button key={color} onClick={() => setBgColor(color)} className={`w-6 h-6 rounded-full border border-border-color ${bgColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary-blue' : ''}`} style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col gap-3 p-3 bg-background rounded-md">
                                <label className="text-sm font-medium">Imagem de Fundo</label>
                                <input type="file" ref={bgImageInputRef} onChange={handleBgImageUpload} accept="image/*" className="hidden" />
                                <button onClick={() => bgImageInputRef.current?.click()} className="w-full text-center p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm transition-colors">
                                    Carregar Imagem
                                </button>
                                {bgImage && (
                                    <div className="w-full h-24 rounded-md overflow-hidden">
                                        <img src={bgImage} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="p-3 bg-background rounded-md">
                           <button onClick={handleClearSelections} disabled={selections.length === 0} className="w-full text-center p-2 bg-item-bg hover:bg-item-hover rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Limpar Seleções ({selections.length})
                           </button>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-border-color flex justify-end items-center">
                    <div className="flex gap-2">
                         <button onClick={onCancel} className="px-4 py-2 text-sm bg-item-bg hover:bg-item-hover rounded-md">Cancelar</button>
                         <button onClick={handleConfirm} disabled={isConfirmDisabled} className="px-4 py-2 text-sm bg-primary-blue text-white hover:bg-primary-blue-hover rounded-md disabled:bg-item-bg disabled:text-text-secondary/50 disabled:cursor-not-allowed">Aplicar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackgroundChangeModal;