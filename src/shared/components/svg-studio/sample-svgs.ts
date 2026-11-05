import { SvgLayer } from './types';

export interface SampleSvg {
  id: string;
  title: string;
  category: 'cricut' | 'multilayer' | 'icon';
  originalNodeCount: number;
  viewBox: string;
  layers: SvgLayer[];
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
        d: 'M250,450 C240,360 210,280 180,220 C160,180 140,160 110,140 C140,150 170,190 190,230 C200,200 190,160 170,110 C200,140 220,180 230,220 C245,170 240,120 235,70 C245,120 255,170 260,220 C280,180 300,140 330,110 C310,160 300,200 310,230 C330,190 360,150 390,140 C360,160 340,180 320,220 C290,280 260,360 250,450 Z',
      },
      {
        id: 'layer-petals-orange',
        name: 'Terracotta (Marigold Petals)',
        color: '#D85A32',
        visible: true,
        d: 'M170,110 C155,95 130,95 115,110 C100,125 100,150 115,165 C130,180 155,180 170,165 C185,150 185,125 170,110 Z M330,110 C315,95 290,95 275,110 C260,125 260,150 275,165 C290,180 315,180 330,165 C345,150 345,125 330,110 Z',
      },
      {
        id: 'layer-center-gold',
        name: 'Mustard Gold (Flower Centers)',
        color: '#F4A261',
        visible: true,
        d: 'M235,70 C225,55 205,55 195,70 C185,85 185,105 195,120 C205,135 225,135 235,120 C245,105 245,85 235,70 Z M142,137 C137,132 128,132 123,137 C118,142 118,151 123,156 C128,161 137,161 142,156 C147,151 147,142 142,137 Z M302,137 C297,132 288,132 283,137 C278,142 278,151 283,156 C288,161 297,161 302,156 C307,151 307,142 302,137 Z',
      },
    ],
  },
  cricut_bear: {
    id: 'cricut_bear',
    title: 'Geometric Mountain Bear (Cut-Ready)',
    category: 'cricut',
    originalNodeCount: 890,
    viewBox: '0 0 500 350',
    layers: [
      {
        id: 'layer-bear-silhouette',
        name: 'Matte Black (Vinyl Outline)',
        color: '#1E1E24',
        visible: true,
        d: 'M60,260 L90,260 L110,210 L150,230 L180,260 L210,260 L230,190 L260,190 L280,260 L320,260 L340,210 L370,220 L390,260 L440,260 C445,230 450,190 430,150 C410,110 370,90 330,85 C290,80 250,90 220,105 C180,95 130,105 100,135 C70,165 55,210 60,260 Z M160,140 L200,180 L230,150 L270,190 L300,130 L340,180 L320,195 L270,140 L230,180 L200,150 L160,190 Z',
      },
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
        name: 'Primary Brand Color',
        color: '#6366F1',
        visible: true,
        d: 'M12,2 C12.5,6.5 15.5,9.5 20,10 C15.5,10.5 12.5,13.5 12,18 C11.5,13.5 8.5,10.5 4,10 C8.5,9.5 11.5,6.5 12,2 Z M19,16 C19.2,18 20.2,19 22,19.2 C20.2,19.4 19.2,20.4 19,22 C18.8,20.4 17.8,19.4 16,19.2 C17.8,19 18.8,18 19,16 Z M5,2 C5.2,3.5 6.2,4.5 7.5,4.7 C6.2,4.9 5.2,5.9 5,7.2 C4.8,5.9 3.8,4.9 2.5,4.7 C3.8,4.5 4.8,3.5 5,2 Z',
      },
    ],
  },
};
