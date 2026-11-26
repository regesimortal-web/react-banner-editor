import React, { ChangeEvent } from 'react';
import { CanvasElement, Effects, TextElement, EffectPreset } from '../types';
import { DEFAULT_EFFECTS, EFFECT_PRESETS } from '../constants';

interface EffectsPanelProps {
  selectedElement: CanvasElement | undefined;
  onUpdateElement: (id: string, updatedProps: Partial<CanvasElement>) => void;
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

// FIX: Made children optional to fix TypeScript errors.
const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div>
        <h3 className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">{title}</h3>
        <div className="space-y-4 bg-background p-3 rounded-md">{children}</div>
    </div>
);

const SliderInput = ({ label, name, value, onChange, min, max, step, unit }: { label: string, name: keyof Effects, value: number, onChange: (name: keyof Effects, value: number) => void, min: number, max: number, step: number, unit?: string }) => {
    const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(name, parseFloat(e.target.value));
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
                <label className="text-text-secondary">{label}</label>
                <span>{value}{unit}</span>
            </div>
            <input 
                type="range" 
                name={name} 
                value={value}
                onChange={handleSliderChange}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 bg-item-bg rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );
};

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => {
     return (
        <div className="flex items-center justify-between">
            <label className="text-xs text-text-secondary">{label}</label>
            <div className="flex items-center gap-2 bg-input-bg border border-border-color rounded px-2">
                <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent w-16 p-1 text-xs focus:outline-none" />
                <div className="relative w-5 h-5">
                     <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                     <div className="w-5 h-5 rounded border border-border-color" style={{ backgroundColor: value }}></div>
                </div>
            </div>
        </div>
    )
}

// FIX: Correctly typed the `PresetCard` component using `React.FC` to resolve a TypeScript error where the `key` prop was not recognized on the component's props type when used in a loop.
interface PresetCardProps {
    preset: EffectPreset;
    onApply: () => void;
    type: 'image' | 'text';
}

const PresetCard: React.FC<PresetCardProps> = ({ preset, onApply, type }) => {
    const filterStyle = { filter: generateCssFilter(preset.effects) };
    const textStrokeStyle: React.CSSProperties = {};
    if (preset.effects.textStroke?.enabled) {
        textStrokeStyle.WebkitTextStroke = `${preset.effects.textStroke.width}px ${preset.effects.textStroke.color}`;
        // @ts-ignore
        textStrokeStyle.textStroke = `${preset.effects.textStroke.width}px ${preset.effects.textStroke.color}`;
    }

    const isGolden = preset.name === 'Dourado';

    return (
        <button
            onClick={onApply}
            className="w-full flex flex-col items-center justify-center p-1 bg-item-bg hover:bg-item-hover rounded-md aspect-square transition-colors text-center"
            title={`Aplicar preset: ${preset.name}`}
        >
            <div className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center bg-canvas">
                {type === 'image' ? (
                     <img 
                        src="https://picsum.photos/seed/preset-preview/50/50" 
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        style={filterStyle}
                    />
                ) : (
                    <span 
                        className="font-bold text-lg"
                        style={{
                             ...filterStyle, 
                             ...textStrokeStyle,
                             color: isGolden ? '#f59e0b' : 'var(--color-foreground)',
                             opacity: preset.effects.opacity ? preset.effects.opacity / 100 : 1
                        }}
                    >
                        ABC
                    </span>
                )}
            </div>
            <span className="text-xs mt-1 text-text-secondary truncate">{preset.name}</span>
        </button>
    );
};

const EffectsPanel: React.FC<EffectsPanelProps> = ({ selectedElement, onUpdateElement }) => {
    
    if (!selectedElement) {
        return <div className="text-center text-text-secondary mt-10 p-4">Select an element to apply effects.</div>;
    }

    const { effects } = selectedElement;
    
    const handleEffectChange = (name: keyof Effects | 'dropShadow' | 'textStroke', value: any) => {
        if (!selectedElement) return;

        let updatedEffects: Partial<Effects> = {};

        if (name === 'dropShadow' || name === 'textStroke') {
            updatedEffects = { [name]: { ...effects?.[name], ...value }};
        } else {
            updatedEffects = { [name]: value };
        }
        
        onUpdateElement(selectedElement.id, { effects: updatedEffects });
    };

    const resetAllEffects = () => {
        onUpdateElement(selectedElement.id, { effects: DEFAULT_EFFECTS });
    }
    
    const handleApplyPreset = (presetEffects: Partial<Effects>) => {
        if (!selectedElement) return;
        const newEffects = { ...DEFAULT_EFFECTS, ...presetEffects };
        // Deep merge for nested objects
        if (presetEffects.dropShadow) {
            newEffects.dropShadow = { ...DEFAULT_EFFECTS.dropShadow, ...presetEffects.dropShadow };
        }
        if (presetEffects.textStroke) {
            newEffects.textStroke = { ...DEFAULT_EFFECTS.textStroke, ...presetEffects.textStroke };
        }
        onUpdateElement(selectedElement.id, { effects: newEffects });
    };

    const applicablePresets = EFFECT_PRESETS.filter(p => p.type === 'all' || p.type === selectedElement.type);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-lg font-semibold text-foreground">Effects</h2>
                 <button onClick={resetAllEffects} className="px-3 py-1 text-xs bg-item-bg hover:bg-item-hover rounded-md">Reset All</button>
            </div>
            
            {applicablePresets.length > 0 && (
                 <Section title="Presets">
                     <div className="grid grid-cols-3 gap-2">
                        {applicablePresets.map(preset => (
                            <PresetCard 
                                key={preset.name} 
                                preset={preset}
                                onApply={() => handleApplyPreset(preset.effects)}
                                type={selectedElement.type as 'image' | 'text'}
                            />
                        ))}
                    </div>
                </Section>
            )}

            <Section title="Appearance">
                <SliderInput label="Opacity" name="opacity" value={effects?.opacity ?? 100} onChange={handleEffectChange} min={0} max={100} step={1} unit="%" />
            </Section>

            <Section title="Adjustments">
                <SliderInput label="Brightness" name="brightness" value={effects?.brightness ?? 100} onChange={handleEffectChange} min={0} max={200} step={1} unit="%" />
                <SliderInput label="Contrast" name="contrast" value={effects?.contrast ?? 100} onChange={handleEffectChange} min={0} max={200} step={1} unit="%" />
                <SliderInput label="Saturation" name="saturate" value={effects?.saturate ?? 100} onChange={handleEffectChange} min={0} max={200} step={1} unit="%" />
            </Section>
            
            <Section title="Color Filters">
                <SliderInput label="Grayscale" name="grayscale" value={effects?.grayscale ?? 0} onChange={handleEffectChange} min={0} max={100} step={1} unit="%" />
                <SliderInput label="Sepia" name="sepia" value={effects?.sepia ?? 0} onChange={handleEffectChange} min={0} max={100} step={1} unit="%" />
                <SliderInput label="Invert" name="invert" value={effects?.invert ?? 0} onChange={handleEffectChange} min={0} max={100} step={1} unit="%" />
                <SliderInput label="Hue" name="hueRotate" value={effects?.hueRotate ?? 0} onChange={handleEffectChange} min={0} max={360} step={1} unit="°" />
            </Section>

            <Section title="Details">
                <SliderInput label="Blur" name="blur" value={effects?.blur ?? 0} onChange={handleEffectChange} min={0} max={20} step={0.5} unit="px" />
            </Section>

            <Section title="Shadow">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-text-secondary">Drop Shadow</label>
                    <input 
                        type="checkbox" 
                        checked={effects?.dropShadow?.enabled ?? false}
                        onChange={(e) => handleEffectChange('dropShadow', { enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                    />
                </div>
                {effects?.dropShadow?.enabled && (
                    <div className="space-y-4 pt-2 border-t border-border-color">
                        <SliderInput label="Offset X" name="dropShadow" value={effects?.dropShadow?.offsetX ?? 0} onChange={(_, val) => handleEffectChange('dropShadow', { offsetX: val })} min={-20} max={20} step={1} unit="px" />
                        <SliderInput label="Offset Y" name="dropShadow" value={effects?.dropShadow?.offsetY ?? 0} onChange={(_, val) => handleEffectChange('dropShadow', { offsetY: val })} min={-20} max={20} step={1} unit="px" />
                        <SliderInput label="Blur" name="dropShadow" value={effects?.dropShadow?.blur ?? 0} onChange={(_, val) => handleEffectChange('dropShadow', { blur: val })} min={0} max={40} step={1} unit="px" />
                        <ColorInput label="Color" value={effects?.dropShadow?.color ?? '#000000'} onChange={(val) => handleEffectChange('dropShadow', { color: val })} />
                    </div>
                )}
            </Section>
        </div>
    );
};

export default EffectsPanel;