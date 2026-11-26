import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageElement } from '../types';

interface CropModalProps {
    element: ImageElement;
    onConfirm: (id: string, crop: ImageElement['crop']) => void;
    onCancel: () => void;
}

type CropRect = { x: number; y: number; width: number; height: number };
type AspectRatio = 'free' | '1:1' | '4:3' | '16:9';

const CropModal: React.FC<CropModalProps> = ({ element, onConfirm, onCancel }) => {
    const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 100, height: 100 });
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
    const imgRef = useRef<HTMLImageElement>(null);
    const interaction = useRef<{ type: string; handle: string; startX: number; startY: number; startCrop: CropRect } | null>(null);

    // Initialize crop rect from element's existing crop data
    useEffect(() => {
        if (element.crop) {
            setCrop(element.crop);
        } else {
            // Default to full image if no crop data exists
            setCrop({ x: 0, y: 0, width: 100, height: 100 });
        }
    }, [element]);

    const handleMouseDown = (e: React.MouseEvent, type: string, handle = '') => {
        e.stopPropagation();
        e.preventDefault();
        interaction.current = {
            type,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            startCrop: { ...crop }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!interaction.current || !imgRef.current) return;
        const { type, handle, startX, startY, startCrop } = interaction.current;

        const rect = imgRef.current.getBoundingClientRect();
        const dx = (e.clientX - startX) / rect.width * 100;
        const dy = (e.clientY - startY) / rect.height * 100;
        
        let newCrop = { ...startCrop };
        
        if (type === 'drag') {
            newCrop.x = Math.max(0, Math.min(startCrop.x + dx, 100 - startCrop.width));
            newCrop.y = Math.max(0, Math.min(startCrop.y + dy, 100 - startCrop.height));
        } else if (type === 'resize') {
            if (handle.includes('l')) {
                const newX = Math.max(0, startCrop.x + dx);
                newCrop.width = Math.min(startCrop.x + startCrop.width, startCrop.width - (newX - startCrop.x));
                newCrop.x = newX;
            }
            if (handle.includes('r')) {
                newCrop.width = Math.min(100 - startCrop.x, startCrop.width + dx);
            }
            if (handle.includes('t')) {
                const newY = Math.max(0, startCrop.y + dy);
                newCrop.height = Math.min(startCrop.y + startCrop.height, startCrop.height - (newY - startCrop.y));
                newCrop.y = newY;
            }
            if (handle.includes('b')) {
                newCrop.height = Math.min(100 - startCrop.y, startCrop.height + dy);
            }
            
            // Apply aspect ratio constraint
            if (aspectRatio !== 'free') {
                 const ratios = { '1:1': 1, '4:3': 4/3, '16:9': 16/9 };
                 const ratio = ratios[aspectRatio];
                 const naturalRatio = (element.naturalWidth || 1) / (element.naturalHeight || 1);

                 if (handle.includes('l') || handle.includes('r')) {
                    newCrop.height = (newCrop.width / ratio) * (rect.width / rect.height) * naturalRatio;
                 } else {
                    newCrop.width = (newCrop.height * ratio) / (rect.width / rect.height) / naturalRatio;
                 }
            }
        }
        
        // Prevent crop area from going out of bounds
        newCrop.width = Math.max(1, newCrop.width);
        newCrop.height = Math.max(1, newCrop.height);
        if (newCrop.x + newCrop.width > 100) { newCrop.width = 100 - newCrop.x; }
        if (newCrop.y + newCrop.height > 100) { newCrop.height = 100 - newCrop.y; }

        setCrop(newCrop);

    }, [aspectRatio, element.naturalWidth, element.naturalHeight]);

    const handleMouseUp = useCallback(() => {
        interaction.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);
    
    const handleSetAspectRatio = (newAspectRatio: AspectRatio) => {
        setAspectRatio(newAspectRatio);
        if (newAspectRatio !== 'free' && imgRef.current) {
            const rect = imgRef.current.getBoundingClientRect();
            const ratios = { '1:1': 1, '4:3': 4/3, '16:9': 16/9 };
            const ratio = ratios[newAspectRatio];
            const naturalRatio = (element.naturalWidth || 1) / (element.naturalHeight || 1);
            
            let newWidth = crop.width;
            let newHeight = (newWidth / ratio) * (rect.width / rect.height) * naturalRatio;

            if(crop.y + newHeight > 100){
                newHeight = 100 - crop.y;
                newWidth = (newHeight * ratio) / (rect.width / rect.height) / naturalRatio;
            }
            setCrop(c => ({...c, width: newWidth, height: newHeight}));
        }
    };


    const handleConfirm = () => {
        onConfirm(element.id, crop);
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onMouseDown={onCancel}>
            <div className="bg-sidebar rounded-lg shadow-xl w-full max-w-4xl flex flex-col" onMouseDown={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border-color">
                    <h3 className="text-lg font-semibold text-foreground">Crop Image</h3>
                </div>
                <div className="flex-grow p-4 overflow-hidden flex items-center justify-center">
                    <div className="relative select-none" style={{ maxWidth: '90vw', maxHeight: '70vh' }}>
                        <img ref={imgRef} src={element.src} alt="Crop preview" className="max-w-full max-h-full block" />
                        
                        {/* Dim overlay */}
                        <div className="absolute inset-0 bg-black/50" style={{
                            clipPath: `polygon(
                                0% 0%, 100% 0%, 100% 100%, 0% 100%,
                                ${crop.x}% ${crop.y}%,
                                ${crop.x}% ${crop.y + crop.height}%,
                                ${crop.x + crop.width}% ${crop.y + crop.height}%,
                                ${crop.x + crop.width}% ${crop.y}%
                            )`,
                        }}></div>

                        {/* Crop box */}
                        <div
                            className="absolute border-2 border-white cursor-move"
                            style={{
                                top: `${crop.y}%`,
                                left: `${crop.x}%`,
                                width: `${crop.width}%`,
                                height: `${crop.height}%`,
                            }}
                            onMouseDown={e => handleMouseDown(e, 'drag')}
                        >
                             <div className="absolute top-0 left-0 w-full h-full">
                                {['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'].map(handle => (
                                    <div
                                        key={handle}
                                        className="absolute w-3 h-3 bg-white -m-1.5"
                                        style={{
                                            top: handle.includes('t') ? '0' : handle.includes('b') ? '100%' : '50%',
                                            left: handle.includes('l') ? '0' : handle.includes('r') ? '100%' : '50%',
                                            cursor: `${handle.includes('t') ? 'n' : ''}${handle.includes('l') ? 'w' : ''}${handle.includes('b') ? 's' : ''}${handle.includes('r') ? 'e' : ''}-resize`,
                                            transform: `translate(${handle.includes('l') || handle.includes('r') ? '-50%' : '-50%'}, ${handle.includes('t') || handle.includes('b') ? '-50%' : '-50%'})`
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-border-color flex justify-between items-center">
                    <div className="flex gap-2">
                        {(['free', '1:1', '4:3', '16:9'] as AspectRatio[]).map(ar => (
                             <button key={ar} onClick={() => handleSetAspectRatio(ar)} className={`px-3 py-1 text-xs rounded ${aspectRatio === ar ? 'bg-primary-blue text-white' : 'bg-item-bg hover:bg-item-hover'}`}>{ar}</button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                         <button onClick={onCancel} className="px-4 py-2 text-sm bg-item-bg hover:bg-item-hover rounded-md">Cancel</button>
                         <button onClick={handleConfirm} className="px-4 py-2 text-sm text-white bg-primary-blue hover:bg-primary-blue-hover rounded-md">Apply Crop</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropModal;