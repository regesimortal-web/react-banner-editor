import React, { useState } from 'react';
import { VisualEffect } from '../types';
import { VISUAL_EFFECTS } from '../constants';

interface VisualEffectsPanelProps {
  onAddEffect: (effect: VisualEffect) => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const EffectCard: React.FC<{ effect: VisualEffect; onSelect: () => void }> = ({ effect, onSelect }) => {
    return (
        <div className="bg-sidebar rounded-lg overflow-hidden group flex flex-col cursor-pointer" onClick={onSelect}>
            <div className="relative">
                <div className="w-full h-40 flex items-center justify-center font-black text-4xl text-foreground/50 bg-item-bg">
                     <img src={effect.thumbnail} alt={effect.name} className="w-full h-full object-cover" />
                </div>
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <button className="bg-primary-blue hover:bg-primary-blue-hover text-white px-6 py-2 rounded-md font-semibold">
                        Adicionar
                    </button>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-foreground">{effect.name}</h3>
                <p className="text-sm text-text-secondary mt-1 flex-grow">{effect.category}</p>
            </div>
        </div>
    );
};


const VisualEffectsPanel: React.FC<VisualEffectsPanelProps> = ({ onAddEffect }) => {
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['Todos', ...Array.from(new Set(VISUAL_EFFECTS.map(e => e.category)))];
    
    const filteredEffects = VISUAL_EFFECTS.filter(effect => {
        const matchesCategory = activeCategory === 'Todos' || effect.category === activeCategory;
        const matchesSearch = effect.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex-1 bg-background p-8 overflow-y-auto text-foreground">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-foreground">Efeitos Visuais</h1>
                <p className="text-text-secondary">Adicione animações e sobreposições prontas ao seu design com um clique.</p>
            </header>
            
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap gap-2 bg-header p-1 rounded-lg">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${activeCategory === cat ? 'bg-primary-blue text-white shadow' : 'text-text-secondary hover:text-foreground hover:bg-item-hover'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                 <div className="relative w-full sm:w-auto">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    <input 
                        type="text"
                        placeholder="Pesquisar efeitos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-sidebar border border-border-color rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 text-sm focus:ring-2 focus:ring-primary-blue focus:outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEffects.map(effect => (
                    <EffectCard key={effect.name} effect={effect} onSelect={() => onAddEffect(effect)} />
                ))}
            </div>
             {filteredEffects.length === 0 && (
                <div className="text-center py-16 text-text-secondary">
                    <h3 className="text-xl font-semibold">Nenhum efeito encontrado</h3>
                    <p>Tente ajustar seus filtros ou busca.</p>
                </div>
            )}
        </div>
    );
};

export default VisualEffectsPanel;