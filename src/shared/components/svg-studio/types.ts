export type StudioMode = 'text' | 'image';

export type SvgPresetStyle = 'cricut-cut' | 'multi-layer' | 'ui-icon' | 'vintage-badge';

export interface SvgLayer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  d: string;
}

export interface SvgStudioState {
  mode: StudioMode;
  prompt: string;
  style: SvgPresetStyle;
  uploadedImage: string | null;
  svgContent: string;
  rawSvgContent: string;
  nodeCount: number;
  originalNodeCount: number;
  smoothness: number; // 0 to 100
  showNodes: boolean;
  layers: SvgLayer[];
  isGenerating: boolean;
  fileName: string;
}

