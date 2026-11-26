
import React, { useRef, useEffect, useLayoutEffect, ChangeEvent, KeyboardEvent } from 'react';
import { TextElement } from '../types';

interface TextEditorProps {
    element: TextElement;
    onUpdateElement: (id: string, updatedProps: Partial<TextElement>) => void;
    onExit: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ element, onUpdateElement, onExit }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus and select text on mount
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, []);

    // Auto-resize textarea height
    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to calculate scrollHeight correctly
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
            
            // Update the element height in the main state if it has changed
            if (Math.abs(element.height - scrollHeight) > 1) {
                onUpdateElement(element.id, { height: scrollHeight });
            }
        }
    }, [element.text, element.width, onUpdateElement, element.id, element.height]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateElement(element.id, { text: e.target.value });
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            onExit();
        }
    };
    
    // Stop propagation to prevent DraggableResizable from handling these events
    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <textarea
            ref={textareaRef}
            value={element.text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={onExit}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}
            style={{
                width: '100%',
                height: '100%',
                background: 'transparent',
                border: 'none',
                resize: 'none',
                outline: 'none',
                padding: 0,
                color: element.color,
                fontSize: `${element.fontSize}px`,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                textAlign: element.textAlign,
                lineHeight: 1.2,
                overflow: 'hidden', // Hide scrollbar
                whiteSpace: 'pre-wrap',
            }}
        />
    );
};

export default TextEditor;
