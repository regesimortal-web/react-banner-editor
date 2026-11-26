import React, { useState, useRef, useCallback } from 'react';
import { ImageElement } from '../types';

interface WatermarkRemovalModalProps {
    element: ImageElement;
    onConfirm: (id: string, selection: { x: number; y: number; width: number; height: number; }) => void;
    onCancel: () => void;
}

type SelectionRect = { x: number; y: number; width: number; height: number };

const WatermarkRemovalModal: React.FC<WatermarkRemovalModalProps> = ({ element, onConfirm, onCancel }) => {
    const [selection, setSelection] = useState<SelectionRect | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const interaction = useRef<{ startX: number; startY: number; } | null>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!imgRef.current) return;
        e.stopPropagation();
        e.preventDefault();

        const rect = imgRef.current.getBoundingClientRect();
        const startX = e.clientX - rect.left;
        const startY = e.clientY - rect.top;

        interaction.current = { startX, startY };
        setSelection({ x: startX, y: startY, width: 0, height: 0 });

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!interaction.current || !imgRef.current) return;
        const { startX, startY } = interaction.current;
        const rect = imgRef.current.getBoundingClientRect();
        
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const x = Math.min(startX, currentX);
        const y = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        setSelection({ 
            x: Math.max(0, x), 
            y: Math.max(0, y), 
            width: Math.min(width, rect.width - Math.max(0, x)), 
            height: Math.min(height, rect.height - Math.max(0, y)),
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        interaction.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);
    
    const handleConfirm = () => {
        if (!selection || !imgRef.current) return;

        const rect = imgRef.current.getBoundingClientRect();
        const naturalWidth = element.naturalWidth || rect.width;
        const naturalHeight = element.naturalHeight || rect.height;

        const scaleX = naturalWidth / rect.width;
        const scaleY = naturalHeight / rect.height;
        
        const finalSelection = {
            x: selection.x * scaleX,
            y: selection.y * scaleY,
            width: selection.width * scaleX,
            height: selection.height * scaleY,
        };

        onConfirm(element.id, finalSelection);
    };

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onMouseDown={onCancel}>
            <div className="bg-sidebar rounded-lg shadow-xl w-full max-w-4xl flex flex-col" onMouseDown={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border-color">
                    <h3 className="text-lg font-semibold text-foreground">Select Watermark</h3>
                    <p className="text-sm text-text-secondary">Click and drag on the image to select the area of the watermark you want to remove.</p>
                </div>
                <div className="flex-grow p-4 overflow-hidden flex items-center justify-center">
                    <div className="relative select-none cursor-crosshair" onMouseDown={handleMouseDown}>
                        <img ref={imgRef} src={element.src} alt="Watermark selection" className="max-w-full max-h-full block" style={{ maxHeight: '70vh' }} />
                        
                        {selection && (
                            <div
                                className="absolute border-2 border-dashed border-primary-blue bg-primary-blue/20"
                                style={{
                                    left: selection.x,
                                    top: selection.y,
                                    width: selection.width,
                                    height: selection.height,
                                }}
                            />
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-border-color flex justify-end items-center">
                    <div className="flex gap-2">
                         <button onClick={onCancel} className="px-4 py-2 text-sm bg-item-bg hover:bg-item-hover rounded-md">Cancel</button>
                         <button onClick={handleConfirm} disabled={!selection || selection.width < 5 || selection.height < 5} className="px-4 py-2 text-sm bg-primary-blue text-white hover:bg-primary-blue-hover rounded-md disabled:bg-item-bg disabled:cursor-not-allowed">Remove Watermark</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatermarkRemovalModal;