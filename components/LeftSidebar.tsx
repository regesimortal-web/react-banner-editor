



import React from 'react';
import { CanvasElement, ElementType, MainTab } from '../types';
import EditorPanel from './EditorPanel';
import EffectsPanel from './EffectsPanel';

interface LeftSidebarProps {
  onAddElement: (type: ElementType, options?: Partial<CanvasElement>) => void;
  mainTab: MainTab;
  selectedElement: CanvasElement | undefined;
  onUpdateElement: (id: string, updatedProps: Partial<CanvasElement>) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ onAddElement, mainTab, selectedElement, onUpdateElement }) => {
  return (
    <>
        {mainTab === 'Editor' && <EditorPanel onAddElement={onAddElement} />}
        {mainTab === 'Adjustments' && <EffectsPanel selectedElement={selectedElement} onUpdateElement={onUpdateElement} />}
    </>
  );
};

export default LeftSidebar;