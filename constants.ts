import { CanvasElement, GalleryItem, Template, TextElement, EffectPreset, Effects, VisualEffect, VisualEffectElement, ShapeElement, ImageElement } from './types';

export const FONT_FAMILIES = [
    'Arial',
    'Verdana',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Impact',
    'Comic Sans MS',
    'Trebuchet MS',
    'Lobster',
    'Roboto',
    'Montserrat',
    'Lato',
    'Poppins',
    'Oswald',
    'Playfair Display',
    'Merriweather',
    'Raleway',
    'Nunito',
    'Pacifico',
    'Bebas Neue',
];

export const COLOR_PALETTE = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'
];

export const TEXT_PRESETS: { [key: string]: Partial<TextElement> } = {
    HEADING: {
        text: 'Heading',
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'Roboto',
        color: '#1e293b',
    },
    SUBHEADING: {
        text: 'Subheading',
        fontSize: 32,
        fontWeight: 'normal',
        fontFamily: 'Roboto',
        color: '#2d3748',
    },
    BODY: {
        text: 'Body Text',
        fontSize: 16,
        fontWeight: 'normal',
        fontFamily: 'Roboto',
        color: '#4a5568',
    }
};

export const BANNER_SIZES = [
    { name: 'Web Banner (1200x400)', width: 1200, height: 400 },
    { name: 'Social Post (1080x1080)', width: 1080, height: 1080 },
    { name: 'Facebook Cover (820x312)', width: 820, height: 312 },
    { name: 'Twitter Header (1500x500)', width: 1500, height: 500 },
];

export const GALLERY_ITEMS: GalleryItem[] = [
    { id: 'g1', title: 'Cena Abstrata', category: 'Fundo', tags: ['abstrato', 'arte'], status: 'free', src: 'https://picsum.photos/seed/g1/300/300', elementData: { type: 'image', src: 'https://picsum.photos/seed/g1/1200/400' } },
    { id: 'g2', title: 'Padrão Geométrico', category: 'Fundo', tags: ['geométrico', 'moderno'], status: 'pro', src: 'https://picsum.photos/seed/g2/300/300', elementData: { type: 'image', src: 'https://picsum.photos/seed/g2/1200/400' } },
    { id: 'g3', title: 'Fundo Gradiente Azul', category: 'Fundo', tags: ['gradiente', 'azul'], status: 'free', src: 'https://picsum.photos/seed/g3/300/300', elementData: { type: 'image', src: 'https://picsum.photos/seed/g3/1200/400' } },
    { id: 'g4', title: 'Ícone Coração', category: 'Ícone', tags: ['coração', 'amor'], status: 'free', src: 'https://picsum.photos/seed/g4/300/300', elementData: { type: 'heart', fill: '#ef4444', stroke: '#ef4444', strokeWidth: 0, width: 100, height: 100 } },
    { id: 'g5', title: 'Textura Metálica', category: 'Fundo', tags: ['metal', 'textura'], status: 'pro', src: 'https://picsum.photos/seed/g5/300/300', elementData: { type: 'image', src: 'https://picsum.photos/seed/g5/1200/400' } },
    { id: 'g6', title: 'Nuvens Abstratas', category: 'Fundo', tags: ['nuvens', 'céu'], status: 'free', src: 'https://picsum.photos/seed/g6/300/300', elementData: { type: 'image', src: 'https://picsum.photos/seed/g6/1200/400' } },
    { id: 'g7', title: 'Ícone Foguete', category: 'Ícone', tags: ['foguete', 'espaço'], status: 'free', src: 'https://picsum.photos/seed/g7/300/300', elementData: { type: 'rocket', fill: '#3b82f6', stroke: '#3b82f6', strokeWidth: 0, width: 100, height: 100 } },
    { id: 'g8', title: 'Fundo Floral', category: 'Fundo', tags: ['flores', 'natureza'], status: 'pro', src: 'https://picsum.photos/seed/g8/300/300', elementData: { type: 'image', src: 'https://picsum.photos/seed/g8/1200/400' } },
    { id: 'g9', title: 'Padrão Orgânico', category: 'Fundo', tags: ['orgânico', 'padrão'], status: 'free', src: 'https://picsum.photos/seed/g9/300/300', elementData: { type: 'image', src: 'https://picsum.photos/seed/g9/1200/400' } },
];

export const DEFAULT_EFFECTS: Effects = {
  opacity: 100,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
  blur: 0,
  dropShadow: {
    offsetX: 0,
    offsetY: 2,
    blur: 4,
    color: '#00000080',
    enabled: false,
  },
  textStroke: {
    width: 0,
    color: '#000000',
    enabled: false,
  },
};

export const EFFECT_PRESETS: EffectPreset[] = [
  // Image & General Presets
  {
    name: 'Vibrante',
    type: 'image',
    effects: { saturate: 180, contrast: 110, brightness: 105 },
  },
  {
    name: 'Vintage',
    type: 'image',
    effects: { sepia: 75, contrast: 120, brightness: 90, saturate: 90 },
  },
  {
    name: 'Noir',
    type: 'image',
    effects: { grayscale: 100, contrast: 140, brightness: 95 },
  },
  {
    name: 'Cinemático',
    type: 'image',
    effects: { contrast: 125, saturate: 80, brightness: 95 },
  },
  {
    name: 'Sonhador',
    type: 'image',
    effects: { blur: 2, brightness: 110, saturate: 120, contrast: 90 },
  },
  {
    name: 'Frio',
    type: 'image',
    effects: { saturate: 90, contrast: 105, brightness: 105, hueRotate: -10 },
  },

  // Text Presets
  {
    name: 'Neon',
    type: 'text',
    effects: {
      dropShadow: { enabled: true, offsetX: 0, offsetY: 0, blur: 12, color: '#3b82f6' },
    },
  },
  {
    name: 'Sombra 3D',
    type: 'text',
    effects: {
      dropShadow: { enabled: true, offsetX: 3, offsetY: 3, blur: 2, color: '#00000080' },
    },
  },
  {
    name: 'Contornado',
    type: 'text',
    effects: {
      textStroke: { enabled: true, width: 2, color: '#ffffff' },
    },
  },
  {
    name: 'Dourado',
    type: 'text',
    effects: {
      dropShadow: { enabled: true, offsetX: 1, offsetY: 1, blur: 2, color: '#a16207' },
    },
  },
  {
    name: 'Fogo',
    type: 'text',
    effects: {
       dropShadow: { enabled: true, offsetX: 0, offsetY: 0, blur: 8, color: '#f97316' },
    }
  },
  {
    name: 'Submerso',
    type: 'text',
    effects: {
      blur: 1,
      dropShadow: { enabled: true, offsetX: 1, offsetY: 1, blur: 1, color: '#ffffff90' },
    }
  }
];

export const VISUAL_EFFECTS: VisualEffect[] = [
    {
        name: 'Botão Inscrever-se',
        category: 'Animações Sociais',
        thumbnail: 'https://picsum.photos/seed/subscribe/200/200',
        elements: [
            // FIX: Explicitly cast element to its corresponding `Omit<ElementType, 'id'>` type to resolve discriminated union error.
            { type: 'rectangle', x: 50, y: 50, width: 150, height: 40, fill: '#FF0000', stroke: 'transparent', strokeWidth: 0, rotation: 0, locked: false, borderRadius: 5 } as Omit<ShapeElement, 'id'>,
            // FIX: Explicitly cast element to its corresponding `Omit<ElementType, 'id'>` type to resolve discriminated union error.
            { type: 'text', text: 'INSCREVER-SE', fontSize: 16, fontFamily: 'Roboto', fontWeight: 'bold', color: '#FFFFFF', x: 50, y: 50, width: 150, height: 40, textAlign: 'center', rotation: 0, locked: false } as Omit<TextElement, 'id'>,
            // FIX: Explicitly cast element to its corresponding `Omit<ElementType, 'id'>` type to resolve discriminated union error.
            { type: 'heart', x: 25, y: 55, width: 30, height: 30, fill: '#FFFFFF', stroke: 'transparent', strokeWidth: 0, rotation: 0, locked: false, animation: { type: 'pulse', duration: 1, delay: 0.5, direction: 'left', iteration: 'infinite', trigger: 'onLoad' } } as Omit<ShapeElement, 'id'>,
        ]
    },
    {
        name: 'Like & Comente',
        category: 'Animações Sociais',
        thumbnail: 'https://picsum.photos/seed/likecomment/200/200',
        elements: [
            // FIX: Explicitly cast element to its corresponding `Omit<ElementType, 'id'>` type to resolve discriminated union error.
            { type: 'text', text: 'LIKE &', fontSize: 48, fontFamily: 'Impact', fontWeight: 'bold', color: '#3b82f6', x: 50, y: 50, width: 200, height: 50, textAlign: 'left', rotation: 0, locked: false, animation: { type: 'slideIn', duration: 0.5, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } } as Omit<TextElement, 'id'>,
            // FIX: Explicitly cast element to its corresponding `Omit<ElementType, 'id'>` type to resolve discriminated union error.
            { type: 'text', text: 'COMENTE', fontSize: 48, fontFamily: 'Impact', fontWeight: 'bold', color: '#10B981', x: 50, y: 100, width: 250, height: 50, textAlign: 'left', rotation: 0, locked: false, animation: { type: 'slideIn', duration: 0.5, delay: 0.2, direction: 'left', iteration: '1', trigger: 'onLoad' } } as Omit<TextElement, 'id'>,
        ]
    },
    {
        name: 'Vazamento de Luz (Light Leak)',
        category: 'Sobreposições',
        thumbnail: 'https://picsum.photos/seed/lightleak/200/200',
        elements: [
            // FIX: Explicitly cast element to its corresponding `Omit<ElementType, 'id'>` type to resolve discriminated union error.
            { type: 'image', src: 'https://picsum.photos/seed/overlay1/600/400', x: 0, y: 0, width: 300, height: 200, rotation: 0, locked: false, effects: { opacity: 40, brightness: 150, contrast: 120 } } as Omit<ImageElement, 'id'>,
        ]
    },
    {
        name: 'Sobreposição de Partículas',
        category: 'Sobreposições',
        thumbnail: 'https://picsum.photos/seed/particles/200/200',
        elements: [
            // FIX: Explicitly cast element to its corresponding `Omit<ElementType, 'id'>` type to resolve discriminated union error.
            { type: 'image', src: 'https://picsum.photos/seed/overlay2/600/400', x: 0, y: 0, width: 300, height: 200, rotation: 0, locked: false, effects: { opacity: 30, blur: 1 } } as Omit<ImageElement, 'id'>,
        ]
    }
];


export const TEMPLATES: Template[] = [
    {
        name: 'Promoção Esportiva',
        description: 'Hero banner vibrante para promoções de moda e esporte.',
        category: 'Heros',
        tags: ['venda', 'esporte', 'hero'],
        status: 'novo',
        canvasSize: { width: 1500, height: 500 },
        elements: [
            { id: 'bg-hero-1', type: 'rectangle', x: 0, y: 0, width: 1500, height: 500, fill: '#E933C4', stroke: 'transparent', strokeWidth: 0, rotation: 0, locked: false, effects: { opacity: 100 } } as CanvasElement,
            { id: 'img-hero-1', type: 'image', src: 'https://picsum.photos/seed/shoes1/400/400', x: 800, y: 100, width: 350, height: 350, rotation: -15, effects: { dropShadow: { enabled: true, offsetX: 10, offsetY: 10, blur: 15, color: '#00000080'}}} as CanvasElement,
            { id: 'img-hero-2', type: 'image', src: 'https://picsum.photos/seed/bag1/300/300', x: 1050, y: 50, width: 250, height: 250, rotation: 10, effects: { dropShadow: { enabled: true, offsetX: 10, offsetY: 10, blur: 15, color: '#00000080'}}} as CanvasElement,
            { id: 'text-hero-1-1', type: 'text', text: 'o melhor', fontSize: 60, fontFamily: 'Roboto', fontWeight: 'bold', color: '#ffffff', x: 100, y: 80, width: 400, height: 70, textAlign: 'left', rotation: 0 } as CanvasElement,
            { id: 'text-hero-1-2', type: 'text', text: 'de MARCA', fontSize: 80, fontFamily: 'Roboto', fontWeight: 'bold', color: '#ffffff', x: 100, y: 140, width: 500, height: 90, textAlign: 'left', rotation: 0 } as CanvasElement,
            { id: 'text-hero-1-3', type: 'text', text: 'com até', fontSize: 30, fontFamily: 'Roboto', fontWeight: 'normal', color: '#ffffff', x: 100, y: 250, width: 200, height: 40, textAlign: 'left', rotation: 0 } as CanvasElement,
            { id: 'text-hero-1-4', type: 'text', text: '60% OFF', fontSize: 120, fontFamily: 'Impact', fontWeight: 'bold', color: '#00FFD1', x: 100, y: 280, width: 600, height: 130, textAlign: 'left', rotation: 0 } as CanvasElement,
            { id: 'btn-rect-hero-1', type: 'rectangle', x: 100, y: 420, width: 200, height: 50, fill: '#00FFD1', stroke: 'transparent', strokeWidth: 0, rotation: 0 } as CanvasElement,
            { id: 'btn-text-hero-1', type: 'text', text: 'Ver ofertas', fontSize: 20, fontFamily: 'Roboto', fontWeight: 'bold', color: '#1a202c', x: 100, y: 420, width: 200, height: 50, textAlign: 'center', rotation: 0 } as CanvasElement,
        ]
    },
    {
        name: 'Banner Lateral Moderno',
        description: 'Banner vertical com design abstrato e moderno.',
        category: 'Banners Verticais',
        tags: ['abstrato', 'moderno', 'lateral'],
        canvasSize: { width: 300, height: 600 },
        elements: [
            { id: 'bg-vert-1', type: 'rectangle', x: 0, y: 0, width: 300, height: 600, fill: '#1A202C', stroke: 'transparent', strokeWidth: 0, rotation: 0, locked: false } as CanvasElement,
            { id: 'shape-vert-1', type: 'rectangle', x: -100, y: 50, width: 300, height: 200, fill: '#4299e1', stroke: 'transparent', strokeWidth: 0, rotation: -30, effects: { opacity: 80, blur: 10 } } as CanvasElement,
            { id: 'shape-vert-2', type: 'rectangle', x: 100, y: 350, width: 300, height: 200, fill: '#22c55e', stroke: 'transparent', strokeWidth: 0, rotation: -30, effects: { opacity: 70, blur: 15 } } as CanvasElement,
            { id: 'text-vert-1-1', type: 'text', text: 'DESIGN', fontSize: 50, fontFamily: 'Impact', fontWeight: 'bold', color: '#ffffff', x: 25, y: 200, width: 250, height: 60, textAlign: 'center' } as CanvasElement,
            { id: 'text-vert-1-2', type: 'text', text: 'INOVADOR', fontSize: 50, fontFamily: 'Impact', fontWeight: 'bold', color: '#ffffff', x: 25, y: 260, width: 250, height: 60, textAlign: 'center' } as CanvasElement,
            { id: 'text-vert-1-3', type: 'text', text: 'Confira as novas tendências para seu negócio.', fontSize: 18, fontFamily: 'Roboto', fontWeight: 'normal', color: '#a0aec0', x: 25, y: 350, width: 250, height: 80, textAlign: 'center' } as CanvasElement,
        ]
    },
    {
        name: 'Card de Coleção',
        description: 'Card quadrado para divulgação de coleções e produtos.',
        category: 'Cards',
        tags: ['produto', 'coleção', 'social'],
        status: 'premium',
        canvasSize: { width: 600, height: 600 },
        elements: [
            { id: 'bg-card-1', type: 'image', src: 'https://picsum.photos/seed/team1/600/600', x: 0, y: 0, width: 600, height: 600, rotation: 0, effects: { brightness: 80, contrast: 110 }, locked: false } as CanvasElement,
            { id: 'overlay-card-1', type: 'rectangle', x: 0, y: 350, width: 600, height: 250, fill: '#000000', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 50 } } as CanvasElement,
            { id: 'text-card-1-1', type: 'text', text: 'NOVA COLEÇÃO', fontSize: 50, fontFamily: 'Impact', fontWeight: 'bold', color: '#ffffff', x: 50, y: 400, width: 500, height: 60, textAlign: 'left' } as CanvasElement,
            { id: 'text-card-1-2', type: 'text', text: 'O estilo que define o jogo.', fontSize: 24, fontFamily: 'Roboto', fontWeight: 'normal', color: '#ffffff', x: 50, y: 460, width: 500, height: 30, textAlign: 'left' } as CanvasElement,
            { id: 'btn-rect-card-1', type: 'rectangle', x: 50, y: 510, width: 220, height: 50, fill: '#FFC700', stroke: 'transparent', strokeWidth: 0, rotation: 0 } as CanvasElement,
            { id: 'btn-text-card-1', type: 'text', text: 'CONFIRA A COLEÇÃO', fontSize: 16, fontFamily: 'Roboto', fontWeight: 'bold', color: '#1a202c', x: 50, y: 510, width: 220, height: 50, textAlign: 'center' } as CanvasElement,
        ]
    },
    {
        name: 'Card de Produto em Oferta',
        description: 'Card vertical para destacar um produto em oferta.',
        category: 'Cards',
        tags: ['produto', 'oferta', 'e-commerce'],
        canvasSize: { width: 400, height: 600 },
        elements: [
            { id: 'bg-pcard-1', type: 'rectangle', x: 0, y: 0, width: 400, height: 600, fill: '#ffffff', stroke: '#e2e8f0', strokeWidth: 1, rotation: 0, locked: false } as CanvasElement,
            { id: 'img-pcard-1', type: 'image', src: 'https://picsum.photos/seed/shoe2/400/400', x: 0, y: 0, width: 400, height: 400, rotation: 0 } as CanvasElement,
            { id: 'tag-pcard-1', type: 'rectangle', x: 20, y: 360, width: 100, height: 30, fill: '#fef08a', stroke: 'transparent', strokeWidth: 0, rotation: 0 } as CanvasElement,
            { id: 'tag-text-pcard-1', type: 'text', text: '-33% OFF', fontSize: 16, fontFamily: 'Roboto', fontWeight: 'bold', color: '#713f12', x: 20, y: 360, width: 100, height: 30, textAlign: 'center' } as CanvasElement,
            { id: 'title-pcard-1', type: 'text', text: 'Tênis New Balance 413V3 Masculino', fontSize: 22, fontFamily: 'Roboto', fontWeight: 'bold', color: '#1a202c', x: 20, y: 420, width: 360, height: 60, textAlign: 'left' } as CanvasElement,
            { id: 'oldprice-pcard-1', type: 'text', text: 'R$ 329,99', fontSize: 16, fontFamily: 'Roboto', fontWeight: 'normal', color: '#64748b', x: 20, y: 490, width: 360, height: 20, textAlign: 'left' } as CanvasElement,
            { id: 'price-pcard-1', type: 'text', text: 'R$ 208,99', fontSize: 32, fontFamily: 'Roboto', fontWeight: 'bold', color: '#1a202c', x: 20, y: 510, width: 360, height: 40, textAlign: 'left' } as CanvasElement,
            { id: 'instal-pcard-1', type: 'text', text: 'ou 3x de R$ 73,33', fontSize: 14, fontFamily: 'Roboto', fontWeight: 'normal', color: '#475569', x: 20, y: 550, width: 360, height: 20, textAlign: 'left' } as CanvasElement,
        ]
    },
    {
        name: 'Banner Moderno',
        description: 'Banner limpo e moderno para vendas.',
        category: 'Web Banners',
        tags: ['venda', 'social'],
        status: 'premium',
        canvasSize: { width: 1200, height: 400 },
        elements: [
             { id: 'rect-bg-t1', type: 'rectangle', x: 0, y: 0, width: 1200, height: 400, fill: '#4299e1', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
             { id: 'text-t1-1', type: 'text', x: 50, y: 150, width: 500, height: 100, text: 'BANNER MODERNO', fontSize: 64, fontFamily: 'Roboto', fontWeight: 'bold', color: '#ffffff', textAlign: 'left', rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
        ]
    },
    {
        name: 'Instagram Post',
        description: 'Perfeito para posts no Instagram.',
        category: 'Posts Sociais',
        tags: ['social', 'post'],
        status: 'novo',
        canvasSize: { width: 1080, height: 1080 },
        elements: [
            { id: 'rect-bg-t2', type: 'rectangle', x: 0, y: 0, width: 1080, height: 1080, fill: '#f97316', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
            { id: 'text-t2-1', type: 'text', x: 54, y: 450, width: 972, height: 200, text: 'INSTAGRAM', fontSize: 120, fontFamily: 'Impact', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
        ]
    },
    {
        name: 'Facebook Cover',
        description: 'Capa profissional para Facebook.',
        category: 'Posts Sociais',
        tags: ['social', 'capa'],
        status: 'novo',
        canvasSize: { width: 820, height: 312 },
        elements: [
             { id: 'rect-bg-t3', type: 'rectangle', x: 0, y: 0, width: 820, height: 312, fill: '#22c55e', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
             { id: 'text-t3-1', type: 'text', x: 40, y: 120, width: 740, height: 100, text: 'FACEBOOK COVER', fontSize: 64, fontFamily: 'Roboto', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
        ]
    },
    {
        name: 'Anúncio Profissional',
        description: 'Ideal para campanhas e anúncios.',
        category: 'Anúncios',
        tags: ['ads', 'venda'],
        canvasSize: { width: 1080, height: 1080 },
        elements: [
             { id: 'rect-bg-t4', type: 'rectangle', x: 0, y: 0, width: 1080, height: 1080, fill: '#8b5cf6', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
             { id: 'text-t4-1', type: 'text', x: 54, y: 450, width: 972, height: 200, text: 'ANÚNCIO', fontSize: 120, fontFamily: 'Impact', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
        ]
    },
     {
        name: 'Banner Corporativo',
        description: 'Design profissional para empresas.',
        category: 'Web Banners',
        tags: ['empresa', 'sério'],
        canvasSize: { width: 1500, height: 500 },
        elements: [
            { id: 'rect-bg-t5', type: 'rectangle', x: 0, y: 0, width: 1500, height: 500, fill: '#2d3748', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
            { id: 'text-t5-1', type: 'text', x: 100, y: 200, width: 1300, height: 100, text: 'CORPORATIVO', fontSize: 80, fontFamily: 'Roboto', fontWeight: 'bold', color: '#ffffff', textAlign: 'left', rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
        ]
    },
    {
        name: 'Banner Criativo',
        description: 'Design vibrante e criativo.',
        category: 'Web Banners',
        tags: ['criativo', 'colorido'],
        status: 'novo',
        canvasSize: { width: 1080, height: 1080 },
        elements: [
            { id: 'rect-bg-t6', type: 'rectangle', x: 0, y: 0, width: 1080, height: 1080, fill: '#ec4899', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
            { id: 'text-t6-1', type: 'text', x: 54, y: 450, width: 972, height: 200, text: 'CRIATIVO', fontSize: 120, fontFamily: 'Lobster', fontWeight: 'normal', color: '#ffffff', textAlign: 'center', rotation: -10, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
        ]
    },
    {
        name: 'Twitter Header',
        description: 'Capa customizada p/ Twitter.',
        category: 'Posts Sociais',
        tags: ['social', 'twitter'],
        canvasSize: { width: 1500, height: 500 },
        elements: [
             { id: 'rect-bg-t7', type: 'rectangle', x: 0, y: 0, width: 1500, height: 500, fill: '#3b82f6', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
             { id: 'text-t7-1', type: 'text', x: 100, y: 200, width: 1300, height: 100, text: 'TWITTER HEADER', fontSize: 80, fontFamily: 'Roboto', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
        ]
    },
    {
        name: 'Banner de Vendas',
        description: 'Perfeito para promoções e vendas.',
        category: 'Anúncios',
        tags: ['venda', 'promo'],
        status: 'novo',
        canvasSize: { width: 1200, height: 400 },
        elements: [
             { id: 'rect-bg-t8', type: 'rectangle', x: 0, y: 0, width: 1200, height: 400, fill: '#ef4444', stroke: 'transparent', strokeWidth: 0, rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
             { id: 'text-t8-1', type: 'text', x: 50, y: 150, width: 1100, height: 100, text: 'PROMOÇÃO', fontSize: 96, fontFamily: 'Impact', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', rotation: 0, effects: { opacity: 100 }, locked: false, animation: { type: 'none', duration: 1, delay: 0, direction: 'left', iteration: '1', trigger: 'onLoad' } },
        ]
    }
];


export const initialElements: CanvasElement[] = [];