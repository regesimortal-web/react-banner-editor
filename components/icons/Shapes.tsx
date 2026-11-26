import React from 'react';

const shapeProps = {
    preserveAspectRatio: "none",
    vectorEffect: "non-scaling-stroke",
    shapeRendering: "geometricPrecision" as const,
};

interface ShapeIconProps extends React.SVGProps<SVGSVGElement> {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export const RectangleIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps} >
        <rect x="0" y="0" width="100" height="100" 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    </svg>
);
export const CircleIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <circle cx="50" cy="50" r="50"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    </svg>
);
export const TriangleIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <polygon points="50,0 100,100 0,100" 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    </svg>
);
export const PentagonIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <polygon points="50,0 95.1,34.5 77.6,90.5 22.4,90.5 4.9,34.5" 
            fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
);
export const HexagonIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" 
            fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
);
export const OctagonIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <polygon points="29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3"
            fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
);
export const CrossIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <polygon points="30,0 70,0 70,30 100,30 100,70 70,70 70,100 30,100 30,70 0,70 0,30 30,30" 
            fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
);
export const LineIcon: React.FC<ShapeIconProps> = ({ stroke = '#d1d5db', strokeWidth = 8, ...props }) => (
     <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <line x1="0" y1="100" x2="100" y2="0" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
);
export const DashedLineIcon: React.FC<ShapeIconProps> = ({ stroke = '#d1d5db', strokeWidth = 8, ...props }) => (
     <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <line x1="0" y1="100" x2="100" y2="0" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeDasharray="10" />
    </svg>
);
export const CurvedArrowIcon: React.FC<ShapeIconProps> = ({ stroke = '#d1d5db', strokeWidth = 8, ...props }) => {
    const strokeColor = stroke;
    const markerId = `curved-arrowhead-${strokeColor.replace(/[^a-zA-Z0-9]/g, '')}`;

    return (
        <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
            <defs>
                <marker id={markerId} viewBox="0 0 10 10" refX="10" refY="5" markerUnits="strokeWidth" markerWidth="5" markerHeight="4" orient="auto-start-reverse" fill={strokeColor}>
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
            </defs>
            <path d="M 0,50 Q 50,0 100,50" markerEnd={`url(#${markerId})`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
        </svg>
    )
};
export const ArrowIcon: React.FC<ShapeIconProps> = ({ stroke = '#d1d5db', strokeWidth = 8, ...props }) => {
    const strokeColor = stroke;
    const markerId = `arrowhead-${strokeColor.replace(/[^a-zA-Z0-9]/g, '')}`;

    return (
        <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
            <defs>
                <marker 
                    id={markerId} 
                    viewBox="0 0 10 10" 
                    refX="10" 
                    refY="5"
                    markerUnits="strokeWidth"
                    markerWidth="5" 
                    markerHeight="4"
                    orient="auto-start-reverse"
                    fill={strokeColor}
                >
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
            </defs>
            <line 
                x1="0" y1="50" 
                x2="100" y2="50"
                markerEnd={`url(#${markerId})`} 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth={strokeWidth} 
            />
        </svg>
    )
};
export const StarIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <polygon points="50,0 61.2,35.5 98.8,35.5 68.8,57.4 79.9,92.7 50,70.8 20.1,92.7 31.2,57.4 1.2,35.5 38.8,35.5" 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    </svg>
);
export const HeartIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <path d="M 90,40 C 90,20 70,0 50,25 C 30,0 10,20 10,40 C 10,60 50,90 50,90 C 50,90 90,60 90,40 Z" 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    </svg>
);
export const LightningIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <polygon points="40,0 20,50 45,50 30,100 80,40 55,40" 
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    </svg>
);
export const RocketIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <g transform="rotate(45 50 50)"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
        >
            <path d="M 50,0 C 60,10 60,30 50,50 C 40,30 40,10 50,0 Z" />
            <rect x="40" y="40" width="20" height="40" />
            <path d="M 40,80 L 60,80 L 50,100 Z" />
            <path d="M 30,60 L 20,80 L 40,80 Z" />
            <path d="M 70,60 L 80,80 L 60,80 Z" />
        </g>
    </svg>
);
export const SpeechBubbleIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <path d="M 0,0 H 100 V 75 H 70 L 50,100 L 30,75 H 0 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
);
export const CloudIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <path d="M 15,65 A 20 20 0 1 1 15,25 H 75 A 25 25 0 1 1 75,75 H 30 A 15 15 0 1 1 15,65 Z" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
);
export const CheckmarkIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <path d="M 10,50 L 40,80 L 90,10" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
);
export const CogIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <path d="M 50,25 A 25 25 0 1 1 50,75 A 25 25 0 1 1 50,25 Z M 50,35 A 15 15 0 1 0 50,65 A 15 15 0 1 0 50,35 Z" fillRule="evenodd" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        <path d="M 50,0 L 50,15 M 50,85 L 50,100 M 0,50 L 15,50 M 85,50 L 100,50 M 15,15 L 25,25 M 75,75 L 85,85 M 15,85 L 25,75 M 75,25 L 85,15" stroke={stroke} strokeWidth={strokeWidth * 1.5} strokeLinecap="round" />
    </svg>
);
export const ShieldIcon: React.FC<ShapeIconProps> = ({ fill, stroke, strokeWidth, ...props }) => (
    <svg viewBox="0 0 100 100" {...props} {...shapeProps}>
        <path d="M 10,0 L 90,0 L 90,50 C 90,80 50,100 50,100 C 50,100 10,80 10,50 L 10,0 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
        />
    </svg>
);