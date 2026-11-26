import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoad: (state: HistoryItem['state']) => void;
  onDelete: (id: string) => void;
}

const HistoryCard: React.FC<{ item: HistoryItem; onLoad: () => void; onDelete: () => void }> = ({ item, onLoad, onDelete }) => {
    return (
        <div className="bg-sidebar rounded-lg overflow-hidden group flex flex-col">
            <div className="relative">
                <img src={item.previewImage} alt="Project preview" className="w-full h-40 object-cover bg-item-bg" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 gap-2">
                    <button onClick={onLoad} className="bg-primary-blue hover:bg-primary-blue-hover text-white px-6 py-2 rounded-md font-semibold text-sm">
                        Load
                    </button>
                    <button onClick={onDelete} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md font-semibold text-sm">
                        Delete
                    </button>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-foreground text-base">Saved Project</h3>
                <p className="text-sm text-text-secondary mt-1">{item.savedAt}</p>
            </div>
        </div>
    );
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onLoad, onDelete }) => {
    return (
        <div className="flex-1 bg-background p-8 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2 text-foreground">Project History</h1>
                <p className="text-text-secondary">Load or delete your previously saved projects.</p>
            </header>
            
            {history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {history.map(item => (
                        <HistoryCard 
                            key={item.id} 
                            item={item} 
                            onLoad={() => onLoad(item.state)} 
                            onDelete={() => onDelete(item.id)} 
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-text-secondary">
                    <h3 className="text-xl font-semibold">No Saved Projects</h3>
                    <p>Your saved projects will appear here after you save them.</p>
                </div>
            )}
        </div>
    );
};

export default HistoryPanel;