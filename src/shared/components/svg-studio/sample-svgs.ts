import { SvgLayer } from './types';

export interface SampleSvg {
  id: string;
  title: string;
  category: 'cricut' | 'multilayer' | 'icon' | 'vintage';
  originalNodeCount: number;
  viewBox: string;
  layers: SvgLayer[];
  // Pre-computed smooth path points for high-fidelity blade toolpath animation
  toolpathPoints?: Array<{ x: number; y: number }>;
}

export const SAMPLE_SVGS: Record<string, SampleSvg> = {
  wildflower: {
    id: 'wildflower',
    title: 'Boho Wildflower Bouquet',
    category: 'multilayer',
    originalNodeCount: 1420,
    viewBox: '0 0 500 500',
    layers: [
      {
        id: 'layer-stem',
        name: 'Sage Green (Stems & Leaves)',
        color: '#4A7C59',
        visible: true,
        d: 'M250,460 C245,390 220,320 185,250 C165,210 145,180 110,155 C138,170 172,205 190,250 C202,215 195,175 170,120 C200,150 222,192 232,238 C246,180 242,130 236,75 C248,130 258,180 265,238 C282,195 302,152 332,120 C308,175 300,215 312,250 C330,205 364,170 392,155 C358,180 338,210 318,250 C282,320 258,390 250,460 Z',
      },
      {
        id: 'layer-petals-orange',
        name: 'Terracotta (Marigold Petals)',
        color: '#D85A32',
        visible: true,
        d: 'M170,120 C150,100 120,100 100,120 C80,140 80,170 100,190 C120,210 150,210 170,190 C190,170 190,140 170,120 Z M330,120 C310,100 280,100 260,120 C240,140 240,170 260,190 C280,210 310,210 330,190 C350,170 350,140 330,120 Z M236,75 C222,55 198,55 184,75 C170,95 170,120 184,140 C198,160 222,160 236,140 C250,120 250,95 236,75 Z',
      },
      {
        id: 'layer-center-gold',
        name: 'Mustard Gold (Flower Centers)',
        color: '#F4A261',
        visible: true,
        d: 'M236,75 C228,62 212,62 204,75 C196,88 196,104 204,116 C212,128 228,128 236,116 C244,104 244,88 236,75 Z M135,155 C129,149 119,149 113,155 C107,161 107,171 113,177 C119,183 129,183 135,177 C141,171 141,161 135,155 Z M295,155 C289,149 279,149 273,155 C267,161 267,171 273,177 C279,183 289,183 295,177 C301,171 301,161 295,155 Z',
      },
    ],
    toolpathPoints: [
      { x: 250, y: 460 }, { x: 230, y: 380 }, { x: 200, y: 300 }, { x: 185, y: 250 },
      { x: 145, y: 180 }, { x: 110, y: 155 }, { x: 100, y: 120 }, { x: 135, y: 155 },
      { x: 170, y: 120 }, { x: 184, y: 75 }, { x: 204, y: 75 }, { x: 236, y: 75 },
      { x: 265, y: 238 }, { x: 312, y: 250 }, { x: 330, y: 120 }, { x: 295, y: 155 },
      { x: 392, y: 155 }, { x: 318, y: 250 }, { x: 282, y: 320 }, { x: 250, y: 460 },
    ],
  },
  cricut_bear: {
    id: 'cricut_bear',
    title: 'Geometric Mountain Bear (Monocut Silhouette)',
    category: 'cricut',
    originalNodeCount: 890,
    viewBox: '0 0 500 350',
    layers: [
      {
        id: 'layer-bear-silhouette',
        name: 'Matte Black (Continuous Cut Path)',
        color: '#1E1E24',
        visible: true,
        d: 'M60,260 L100,260 L120,220 L160,240 L190,260 L230,260 L250,200 L280,200 L300,260 L340,260 L360,220 L390,230 L410,260 L450,260 C460,220 460,180 435,145 C410,110 370,90 330,85 C290,80 250,90 220,105 C180,95 130,105 100,135 C70,165 55,210 60,260 Z M150,150 L195,195 L225,160 L265,200 L295,140 L335,190 L315,205 L265,150 L225,190 L195,160 L150,200 Z',
      },
    ],
    toolpathPoints: [
      { x: 60, y: 260 }, { x: 100, y: 260 }, { x: 120, y: 220 }, { x: 160, y: 240 },
      { x: 190, y: 260 }, { x: 230, y: 260 }, { x: 250, y: 200 }, { x: 280, y: 200 },
      { x: 300, y: 260 }, { x: 340, y: 260 }, { x: 360, y: 220 }, { x: 390, y: 230 },
      { x: 410, y: 260 }, { x: 450, y: 260 }, { x: 435, y: 145 }, { x: 370, y: 90 },
      { x: 330, y: 85 }, { x: 220, y: 105 }, { x: 100, y: 135 }, { x: 60, y: 260 },
      { x: 150, y: 150 }, { x: 195, y: 195 }, { x: 225, y: 160 }, { x: 265, y: 200 },
      { x: 295, y: 140 }, { x: 335, y: 190 }, { x: 315, y: 205 }, { x: 150, y: 200 },
    ],
  },
  vintage_badge: {
    id: 'vintage_badge',
    title: 'Vintage Artisan Craft Badge (Laser Engrave)',
    category: 'vintage',
    originalNodeCount: 1680,
    viewBox: '0 0 500 500',
    layers: [
      {
        id: 'layer-badge-outer',
        name: 'Dark Walnut (Outer Crest & Shield)',
        color: '#2B2118',
        visible: true,
        d: 'M250,30 L410,90 C410,230 380,380 250,470 C120,380 90,230 90,90 L250,30 Z M250,60 L120,110 C120,230 145,350 250,430 C355,350 380,230 380,110 L250,60 Z',
      },
      {
        id: 'layer-badge-banner',
        name: 'Warm Ochre (Ribbon & Stars)',
        color: '#C68B59',
        visible: true,
        d: 'M130,270 L370,270 L390,320 L350,305 L250,305 L150,305 L110,320 L130,270 Z M250,130 L260,155 L285,155 L265,170 L272,195 L250,180 L228,195 L235,170 L215,155 L240,155 Z',
      },
      {
        id: 'layer-badge-center',
        name: 'Ivory White (Central Compass & Crown)',
        color: '#F4EBD9',
        visible: true,
        d: 'M250,190 L275,235 L320,240 L285,270 L295,315 L250,290 L205,315 L215,270 L180,240 L225,235 Z',
      },
    ],
    toolpathPoints: [
      { x: 250, y: 30 }, { x: 410, y: 90 }, { x: 410, y: 230 }, { x: 380, y: 380 },
      { x: 250, y: 470 }, { x: 120, y: 380 }, { x: 90, y: 230 }, { x: 90, y: 90 },
      { x: 250, y: 30 }, { x: 130, y: 270 }, { x: 370, y: 270 }, { x: 390, y: 320 },
      { x: 250, y: 305 }, { x: 110, y: 320 }, { x: 250, y: 130 }, { x: 272, y: 195 },
      { x: 250, y: 180 }, { x: 250, y: 190 }, { x: 320, y: 240 }, { x: 250, y: 290 },
    ],
  },
  ui_sparkles: {
    id: 'ui_sparkles',
    title: 'AI Smart Sparkles (React / Web Icon)',
    category: 'icon',
    originalNodeCount: 420,
    viewBox: '0 0 24 24',
    layers: [
      {
        id: 'layer-primary-icon',
        name: 'Electric Indigo (Single Clean Path)',
        color: '#6366F1',
        visible: true,
        d: 'M12,2 C12.5,6.5 15.5,9.5 20,10 C15.5,10.5 12.5,13.5 12,18 C11.5,13.5 8.5,10.5 4,10 C8.5,9.5 11.5,6.5 12,2 Z M19,16 C19.2,18 20.2,19 22,19.2 C20.2,19.4 19.2,20.4 19,22 C18.8,20.4 17.8,19.4 16,19.2 C17.8,19 18.8,18 19,16 Z M5,2 C5.2,3.5 6.2,4.5 7.5,4.7 C6.2,4.9 5.2,5.9 5,7.2 C4.8,5.9 3.8,4.9 2.5,4.7 C3.8,4.5 4.8,3.5 5,2 Z',
      },
    ],
    toolpathPoints: [
      { x: 12, y: 2 }, { x: 16, y: 6 }, { x: 20, y: 10 }, { x: 16, y: 14 },
      { x: 12, y: 18 }, { x: 8, y: 14 }, { x: 4, y: 10 }, { x: 8, y: 6 },
      { x: 12, y: 2 }, { x: 19, y: 16 }, { x: 22, y: 19.2 }, { x: 19, y: 22 },
      { x: 16, y: 19.2 }, { x: 19, y: 16 }, { x: 5, y: 2 }, { x: 7.5, y: 4.7 },
      { x: 5, y: 7.2 }, { x: 2.5, y: 4.7 }, { x: 5, y: 2 },
    ],
  },
};
