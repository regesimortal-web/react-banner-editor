import React, { useState } from 'react';
import { Template } from '../types';
import { TEMPLATES } from '../constants';

interface TemplatesPageProps {
  onLoadTemplate: (template: Template) => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const TemplateCard: React.FC<{ template: Template; onSelect: () => void }> = ({ template, onSelect }) => {
    const statusTag = (template: Template) => {
        if (!template.status) return null;

        let text = template.status.toUpperCase();
        let color = '';

        switch (template.name) {
            case 'Banner Moderno':    color = 'bg-blue-500'; text = 'PREMIUM'; break;
            case 'Instagram Post':    color = 'bg-red-500'; text = 'NOVO'; break;
            case 'Facebook Cover':    color = 'bg-green-500'; text = 'NOVO'; break;
            case 'Anúncio Profissional': color = 'bg-purple-500'; text = 'PREMIUM'; break;
            case 'Banner Criativo':   color = 'bg-pink-500'; text = 'NOVO'; break;
            case 'Banner de Vendas':  color = 'bg-red-600'; text = 'NOVO'; break;
            default:                  color = 'bg-gray-500'; break;
        }

        return (
             <span className={`absolute top-2 right-2 text-xs font-bold px-3 py-1 rounded-sm text-white ${color}`}>
                {text}
            </span>
        );
    };

    return (
        <div className="bg-sidebar rounded-lg overflow-hidden group flex flex-col">
            <div className="relative">
                <div className={`w-full h-40 flex items-center justify-center font-black text-4xl text-foreground/50`} style={{backgroundColor: (template.elements[0] as any).fill || 'var(--color-item-bg)'}}>
                     BANNER
                </div>
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <button onClick={onSelect} className="bg-primary-blue hover:bg-primary-blue-hover text-white px-6 py-2 rounded-md font-semibold">
                        Usar Template
                    </button>
                </div>
                {statusTag(template)}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-foreground">{template.name}</h3>
                <p className="text-sm text-text-secondary mt-1 mb-3 flex-grow">{template.description}</p>
                <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                        <span key={tag} className="text-xs bg-item-bg text-text-secondary px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
                 <button onClick={onSelect} className="w-full bg-primary-blue hover:bg-primary-blue-hover text-white text-sm font-semibold mt-4 py-2 rounded-md lg:hidden">
                    Usar Template
                </button>
            </div>
        </div>
    );
};


const TemplatesPanel: React.FC<TemplatesPageProps> = ({ onLoadTemplate }) => {
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['Todos', 'Heros', 'Web Banners', 'Banners Verticais', 'Posts Sociais', 'Cards', 'Anúncios'];
    
    const filteredTemplates = TEMPLATES.filter(template => {
        const matchesCategory = activeCategory === 'Todos' || template.category === activeCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="flex-1 bg-background p-8 overflow-y-auto text-foreground">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-foreground">Templates Profissionais</h1>
                <p className="text-text-secondary">Escolha um template e comece a criar seu banner perfeito.</p>
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
                        placeholder="Pesquisar templates..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-sidebar border border-border-color rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 text-sm focus:ring-2 focus:ring-primary-blue focus:outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map(template => (
                    <TemplateCard key={template.name} template={template} onSelect={() => onLoadTemplate(template)} />
                ))}
            </div>
             {filteredTemplates.length === 0 && (
                <div className="text-center py-16 text-text-secondary">
                    <h3 className="text-xl font-semibold">Nenhum template encontrado</h3>
                    <p>Tente ajustar seus filtros ou busca.</p>
                </div>
            )}
        </div>
    );
};

export default TemplatesPanel;