import React, { useRef, ChangeEvent } from 'react';
import { CanvasElement, ElementType } from '../types';
import { RectangleIcon, CircleIcon, TriangleIcon, LineIcon, ArrowIcon, StarIcon, HeartIcon, LightningIcon, RocketIcon, PentagonIcon, HexagonIcon, OctagonIcon, CrossIcon, DashedLineIcon, CurvedArrowIcon, SpeechBubbleIcon, CloudIcon, CheckmarkIcon, CogIcon, ShieldIcon } from './icons/Shapes';
import { AddTextIcon, AddImageIcon } from './icons/Icons';
import { TEXT_PRESETS } from '../constants';

interface EditorPanelProps {
  onAddElement: (type: ElementType, options?: Partial<CanvasElement>) => void;
}

const ElementButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2 bg-item-bg hover:bg-item-hover rounded-md transition-colors text-left">
        <div className="w-8 h-8 flex items-center justify-center text-text-secondary flex-shrink-0">{icon}</div>
        <span className="text-sm text-foreground">{label}</span>
    </button>
);

const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-xs text-text-secondary font-bold uppercase tracking-wider mt-4 mb-2 px-1">{title}</h3>
);

const EditorPanel: React.FC<EditorPanelProps> = ({ onAddElement }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            if (dataUrl) {
                const img = new Image();
                img.onload = () => {
                    const maxWidth = 300; 
                    const scale = maxWidth / img.naturalWidth;
                    const width = img.naturalWidth > maxWidth ? maxWidth : img.naturalWidth;
                    const height = img.naturalWidth > maxWidth ? img.naturalHeight * scale : img.naturalHeight;
                    onAddElement('image', { 
                        src: dataUrl, 
                        width, 
                        height,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                    });
                };
                img.src = dataUrl;
            }
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

  return (
    <div className="space-y-2">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
        />
        <ElementButton icon={<AddTextIcon className="w-6 h-6" />} label="Adicionar Texto" onClick={() => onAddElement('text')} />
        <ElementButton icon={<AddImageIcon className="w-6 h-6" />} label="Adicionar Imagem" onClick={handleAddImageClick} />

        <SectionTitle title="Estilos de Texto" />
        <ElementButton icon={<div className="font-bold text-xl">Aa</div>} label="Adicionar Título" onClick={() => onAddElement('text', TEXT_PRESETS.HEADING)} />
        <ElementButton icon={<div className="font-semibold text-lg">Aa</div>} label="Adicionar Subtítulo" onClick={() => onAddElement('text', TEXT_PRESETS.SUBHEADING)} />
        <ElementButton icon={<div className="text-base">Aa</div>} label="Adicionar Corpo de Texto" onClick={() => onAddElement('text', TEXT_PRESETS.BODY)} />

        <SectionTitle title="Formas Básicas" />
        <div className="grid grid-cols-2 gap-2">
           <ElementButton icon={<RectangleIcon />} label="Retângulo" onClick={() => onAddElement('rectangle')} />
           <ElementButton icon={<CircleIcon />} label="Círculo" onClick={() => onAddElement('circle')} />
           <ElementButton icon={<TriangleIcon />} label="Triângulo" onClick={() => onAddElement('triangle')} />
           <ElementButton icon={<PentagonIcon />} label="Pentágono" onClick={() => onAddElement('pentagon')} />
           <ElementButton icon={<HexagonIcon />} label="Hexágono" onClick={() => onAddElement('hexagon')} />
           <ElementButton icon={<OctagonIcon />} label="Octógono" onClick={() => onAddElement('octagon')} />
           <ElementButton icon={<CrossIcon />} label="Cruz" onClick={() => onAddElement('cross')} />
        </div>
        
        <SectionTitle title="Linhas e Setas" />
         <div className="grid grid-cols-2 gap-2">
            <ElementButton icon={<LineIcon />} label="Linha" onClick={() => onAddElement('line')} />
            <ElementButton icon={<ArrowIcon />} label="Seta" onClick={() => onAddElement('arrow')} />
            <ElementButton icon={<DashedLineIcon />} label="Tracejada" onClick={() => onAddElement('dashed-line')} />
            <ElementButton icon={<CurvedArrowIcon />} label="Curva" onClick={() => onAddElement('curved-arrow')} />
        </div>

        <SectionTitle title="Ícones" />
         <div className="grid grid-cols-2 gap-2">
            <ElementButton icon={<StarIcon />} label="Estrela" onClick={() => onAddElement('star')} />
            <ElementButton icon={<HeartIcon />} label="Coração" onClick={() => onAddElement('heart')} />
            <ElementButton icon={<LightningIcon />} label="Raio" onClick={() => onAddElement('lightning')} />
            <ElementButton icon={<ShieldIcon />} label="Escudo" onClick={() => onAddElement('shield')} />
            <ElementButton icon={<RocketIcon />} label="Foguete" onClick={() => onAddElement('rocket')} />
            <ElementButton icon={<SpeechBubbleIcon />} label="Balão" onClick={() => onAddElement('speech-bubble')} />
            <ElementButton icon={<CloudIcon />} label="Nuvem" onClick={() => onAddElement('cloud')} />
            <ElementButton icon={<CheckmarkIcon />} label="Check" onClick={() => onAddElement('checkmark')} />
            <ElementButton icon={<CogIcon />} label="Engrenagem" onClick={() => onAddElement('cog')} />
        </div>
    </div>
  );
};

export default EditorPanel;