import React from 'react';

interface GifPreviewModalProps {
    progress: number;
    gifUrl: string | null;
    onClose: () => void;
    statusText: string;
}

const GifPreviewModal: React.FC<GifPreviewModalProps> = ({ progress, gifUrl, onClose, statusText }) => {

    const handleDownload = () => {
        if (!gifUrl) return;
        const a = document.createElement('a');
        a.href = gifUrl;
        a.download = 'banner.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-50">
            <div className="bg-sidebar rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">GIF Preview & Export</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-foreground">&times;</button>
                </div>
                
                {gifUrl ? (
                    <div className="space-y-4">
                        <img src={gifUrl} alt="GIF Preview" className="w-full h-auto rounded-md border border-border-color" />
                        <div className="flex justify-end gap-2">
                             <button onClick={onClose} className="px-4 py-2 text-sm bg-item-bg hover:bg-item-hover rounded-md">
                                Close
                            </button>
                             <button onClick={handleDownload} className="px-4 py-2 text-sm bg-primary-blue text-white hover:bg-primary-blue-hover rounded-md">
                                Download GIF
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-text-secondary">{statusText || 'Generating GIF, please wait...'}</p>
                        <div className="w-full bg-background rounded-full h-2.5">
                            <div 
                                className="bg-primary-blue h-2.5 rounded-full transition-all duration-150" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-xs text-text-secondary">{Math.round(progress)}%</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GifPreviewModal;