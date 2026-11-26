import React, { useState } from 'react';
import { GalleryItem, CanvasElement, ElementType } from '../types';
import { GALLERY_ITEMS } from '../constants';

interface GalleryPageProps {
  onAddElement: (type: ElementType, options?: Partial<CanvasElement>) => void;
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const AddIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const GalleryCard: React.FC<{ item: GalleryItem; onAdd: () => void }> = ({ item, onAdd }) => {
     const statusTag = (status: 'pro' | 'free') => {
        const text = status === 'pro' ? 'PRO' : 'FREE';
        const color = status === 'pro' ? 'bg-purple-600' : 'bg-green-600';

        return (
             <span className={`absolute top-2 right-2 text-xs font-bold px-3 py-1 rounded-sm text-white ${color}`}>
                {text.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="bg-sidebar rounded-lg overflow-hidden group relative flex flex-col">
            <div className="w-full h-40 bg-item-bg">
                <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 flex-grow flex flex-col">
                <h3 className="font-bold text-foreground text-sm truncate">{item.title}</h3>
                <p className="text-xs text-text-secondary mt-0.5 mb-2 flex-grow">{item.category}</p>
                <div className="flex flex-wrap gap-1.5">
                    {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-item-bg text-text-secondary px-2 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
            </div>
            {statusTag(item.status)}
             <button onClick={onAdd} className="absolute bottom-3 right-3 w-8 h-8 bg-primary-blue hover:bg-primary-blue-hover text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 scale-90">
                <AddIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

const GalleryPanel: React.FC<GalleryPageProps> = ({ onAddElement }) => {
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['Todos', 'Imagens', 'Ícones', 'Fundos', 'Formas', 'Adesivos'];
    
    const filteredItems = GALLERY_ITEMS.filter(item => {
        const categoryMap: {[key: string]: string} = {
            'Imagens': 'Imagem',
            'Ícones': 'Ícone',
            'Fundos': 'Fundo',
            'Formas': 'Forma',
            'Adesivos': 'Adesivo'
        };
        const mappedCategory = categoryMap[activeCategory] || '';
        const matchesCategory = activeCategory === 'Todos' || item.category === mappedCategory || (activeCategory === 'Imagens' && item.category === 'Fundo'); // Fundos are also images
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleAddItem = (item: GalleryItem) => {
        onAddElement(item.elementData.type!, item.elementData);
    };

    return (
        <div className="flex-1 bg-background p-8 overflow-y-auto text-foreground">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-foreground">Galeria de Elementos</h1>
                <p className="text-text-secondary">Encontre imagens, ícones e elementos para seus banners.</p>
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
                 <div className="flex items-center gap-4">
                     <div className="relative w-full sm:w-auto">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input 
                            type="text"
                            placeholder="Pesquisar elementos..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-sidebar border border-border-color rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 text-sm focus:ring-2 focus:ring-primary-blue focus:outline-none"
                        />
                    </div>
                    <select className="bg-sidebar border border-border-color rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-blue focus:outline-none">
                        <option>Mais Recentes</option>
                        <option>Populares</option>
                    </select>
                 </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredItems.map(item => (
                    <GalleryCard key={item.id} item={item} onAdd={() => handleAddItem(item)} />
                ))}
            </div>
             {filteredItems.length === 0 && (
                <div className="text-center py-16 text-text-secondary">
                    <h3 className="text-xl font-semibold">Nenhum elemento encontrado</h3>
                    <p>Tente ajustar seus filtros ou busca.</p>
                </div>
            )}
        </div>
    );
};

export default GalleryPanel;