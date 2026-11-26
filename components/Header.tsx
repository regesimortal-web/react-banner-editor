
import React, { useState } from 'react';
import { EditorIcon, TemplatesIcon, GalleryIcon, UndoIcon, RedoIcon, SaveIcon, ExportIcon, DeviceIcon, RefreshIcon, MoreIcon, ReactLogoIcon, ChevronDownIcon, CompressIcon, HistoryIcon, SunIcon, MoonIcon, MagicWandIcon, SlidersIcon } from './icons/Icons';
import { MainTab } from '../types';

type ExportResolution = 'current' | 'hd' | 'fhd' | '2k';

interface HeaderProps {
    mainTab: MainTab;
    onSetMainTab: (tab: MainTab) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onSave: () => void;
    saveStatus: 'idle' | 'saving' | 'saved';
    onExportMp4: () => void;
    onGenerateGifPreview: () => void;
    onExportAnimatedSvg: () => void;
    onExportPng: () => void;
    onExportJpg: () => void;
    onExportHtml: () => void;
    onExportWebProject: () => void;
    isExporting: boolean;
    onToggleMobilePreview: () => void;
    onSwapOrientation: () => void;
    onToggleFullscreen: () => void;
    isPreviewingMobile: boolean;
    isFullscreen: boolean;
    exportResolution: ExportResolution;
    onSetExportResolution: (resolution: ExportResolution) => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    mainTab, onSetMainTab,
    onUndo, onRedo, canUndo, canRedo, onSave, saveStatus, onExportMp4, onGenerateGifPreview, onExportAnimatedSvg, onExportPng, onExportJpg, onExportHtml, onExportWebProject, isExporting,
    onToggleMobilePreview, onSwapOrientation, onToggleFullscreen, isPreviewingMobile, isFullscreen,
    exportResolution, onSetExportResolution,
    theme, onToggleTheme,
}) => {
  const [showExport, setShowExport] = useState(false);
  
  const NavButton = ({ tab, icon, label }: { tab: MainTab, icon: React.ReactNode, label: string }) => (
     <button 
        onClick={() => onSetMainTab(tab)}
        className={`px-3 py-1 text-sm flex items-center gap-2 rounded-md ${mainTab === tab ? 'bg-primary-blue text-white' : 'text-text-secondary hover:text-foreground hover:bg-item-hover'}`}
    >
        {icon}
        {label}
    </button>
  );

  const ResolutionButton = ({ label, value, description }: { label: string, value: ExportResolution, description: string }) => (
    <button 
        onClick={() => onSetExportResolution(value)}
        className={`w-full text-left px-3 py-2 text-sm rounded ${exportResolution === value ? 'bg-primary-blue text-white' : 'hover:bg-item-hover'}`}
    >
        {label}
        <span className="text-xs text-text-secondary ml-2">{description}</span>
    </button>
  );

  return (
    <header className="bg-header flex items-center justify-between px-4 py-2 border-b border-border-color flex-shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <ReactLogoIcon className="w-6 h-6 text-cyan-400" />
            <h1 className="text-lg font-semibold">React Banner Editor</h1>
        </div>
        {!isPreviewingMobile && (
          <nav className="flex items-center bg-background rounded-md p-1">
            <NavButton tab="Editor" icon={<EditorIcon className="w-4 h-4" />} label="Editor" />
            <NavButton tab="Templates" icon={<TemplatesIcon className="w-4 h-4" />} label="Templates" />
            <NavButton tab="Gallery" icon={<GalleryIcon className="w-4 h-4" />} label="Gallery" />
            <NavButton tab="History" icon={<HistoryIcon className="w-4 h-4" />} label="History" />
            <NavButton tab="Adjustments" icon={<SlidersIcon className="w-4 h-4" />} label="Ajustes" />
            <NavButton tab="VisualEffects" icon={<MagicWandIcon className="w-4 h-4" />} label="Efeitos" />
          </nav>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleMobilePreview}
          className={`p-2 hover:bg-item-hover rounded-md ${isPreviewingMobile ? 'bg-primary-blue text-white' : 'text-text-secondary'}`}
          title="Toggle Mobile Preview"
        >
            <DeviceIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={onSwapOrientation}
          className="p-2 hover:bg-item-hover rounded-md text-text-secondary"
          title="Swap Orientation"
        >
            <RefreshIcon className="w-5 h-5" />
        </button>
         <button 
            onClick={onToggleFullscreen}
            className="p-2 hover:bg-item-hover rounded-md text-text-secondary"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <CompressIcon className="w-5 h-5" /> : <MoreIcon className="w-5 h-5" />}
        </button>
        <button
            onClick={onToggleTheme}
            className="p-2 hover:bg-item-hover rounded-md text-text-secondary"
            title="Toggle Theme"
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
        <div className="w-px h-6 bg-border-color mx-2"></div>
        <button onClick={onUndo} disabled={!canUndo} className="p-2 hover:bg-item-hover rounded-md text-text-secondary disabled:text-text-secondary/50 disabled:cursor-not-allowed">
            <UndoIcon className="w-5 h-5" />
        </button>
         <button onClick={onRedo} disabled={!canRedo} className="p-2 hover:bg-item-hover rounded-md text-text-secondary disabled:text-text-secondary/50 disabled:cursor-not-allowed">
            <RedoIcon className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-border-color mx-2"></div>
        {!isPreviewingMobile && (
          <>
            <button 
                onClick={onSave}
                disabled={saveStatus !== 'idle'}
                className="px-4 py-2 text-sm flex items-center gap-2 bg-item-hover hover:bg-border-color rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
                <SaveIcon className="w-4 h-4" />
                {saveStatus === 'idle' && 'Save'}
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved!'}
            </button>
            <div className="relative">
                <button 
                    onClick={() => setShowExport(prev => !prev)} 
                    className="px-4 py-2 text-sm flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white rounded-md disabled:bg-green-800 disabled:cursor-wait"
                    disabled={isExporting}
                >
                    <ExportIcon className="w-4 h-4" />
                    {isExporting ? 'Exporting...' : 'Export'}
                    {!isExporting && <ChevronDownIcon className="w-4 h-4" />}
                </button>
                {showExport && !isExporting && (
                    <div 
                        onMouseLeave={() => setShowExport(false)}
                        className="absolute right-0 top-full mt-2 w-64 bg-sidebar rounded-md shadow-lg z-10 border border-border-color"
                    >
                        <div className="px-3 pt-2 pb-1 text-xs text-text-secondary font-semibold">Web Export</div>
                        <button onClick={() => { onExportHtml(); setShowExport(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-item-hover">Export as single HTML</button>
                        <button onClick={() => { onExportWebProject(); setShowExport(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-item-hover">Export as Web Project (.zip)</button>
                        <div className="h-px bg-border-color my-1"></div>
                        <div className="px-3 pt-2 pb-1 text-xs text-text-secondary font-semibold">Animated Export</div>
                        <button onClick={() => { onExportAnimatedSvg(); setShowExport(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-item-hover">Export as Animated SVG</button>
                        <button onClick={() => { onGenerateGifPreview(); setShowExport(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-item-hover">Generate GIF Preview</button>
                        <button onClick={() => { onExportMp4(); setShowExport(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-item-hover">Export as MP4</button>
                        <div className="h-px bg-border-color my-1"></div>
                        <div className="px-3 pt-2 pb-1 text-xs text-text-secondary font-semibold">Static Export</div>
                        <button onClick={() => { onExportPng(); setShowExport(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-item-hover">Export as PNG</button>
                        <button onClick={() => { onExportJpg(); setShowExport(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-item-hover">Export as JPG</button>
                        <div className="h-px bg-border-color my-1"></div>
                        <div className="px-3 pt-2 pb-1 text-xs text-text-secondary font-semibold">Resolution</div>
                        <div className="p-1 space-y-1">
                            <ResolutionButton label="Current Size" value="current" description="" />
                            <ResolutionButton label="HD" value="hd" description="1280x720" />
                            <ResolutionButton label="Full HD" value="fhd" description="1920x1080" />
                            <ResolutionButton label="2K" value="2k" description="2560x1440" />
                        </div>
                    </div>
                )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;