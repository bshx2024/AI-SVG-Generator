'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Layers,
  Sliders,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Scissors,
  Code2,
  FileCheck,
  Cpu,
  Crosshair,
  Maximize2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { SAMPLE_SVGS } from './sample-svgs';
import { StudioMode, SvgPresetStyle, SvgLayer } from './types';

// Extract pseudo coordinates from SVG path for precision vector node visualization
function extractCoordinates(d: string): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const matches = d.match(/([0-9.-]+)[,\s]+([0-9.-]+)/g);
  if (!matches) return points;

  // Sample nodes to preserve fidelity without DOM lag
  const step = Math.max(1, Math.floor(matches.length / 60));
  for (let i = 0; i < matches.length; i += step) {
    const parts = matches[i].split(/[,\s]+/);
    if (parts.length >= 2) {
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }
  }
  return points;
}

export function SvgStudio() {
  const [mode, setMode] = useState<StudioMode>('text');
  const [style, setStyle] = useState<SvgPresetStyle>('cricut-cut');
  const [prompt, setPrompt] = useState('Vintage Boho Wildflower Skull for Cricut T-Shirt');
  const [selectedSampleKey, setSelectedSampleKey] = useState<string>('wildflower');
  
  // Active sample data
  const currentSample = SAMPLE_SVGS[selectedSampleKey] || SAMPLE_SVGS.wildflower;
  const [layers, setLayers] = useState<SvgLayer[]>(currentSample.layers);
  
  // Interactive controls
  const [showNodes, setShowNodes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [smoothness, setSmoothness] = useState<number>(85); // 0 (raw) to 100 (ultra smooth)
  const [zoom, setZoom] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // File upload state for Image-to-SVG mode
  const [uploadedFile, setUploadedFile] = useState<{ name: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Switch sample or update layers
  const handleSelectSample = (key: string) => {
    setSelectedSampleKey(key);
    const s = SAMPLE_SVGS[key];
    if (s) {
      setLayers(s.layers.map((l) => ({ ...l })));
      if (s.category === 'cricut') setStyle('cricut-cut');
      else if (s.category === 'multilayer') setStyle('multi-layer');
      else if (s.category === 'icon') setStyle('ui-icon');
    }
  };

  // Toggle single layer visibility
  const toggleLayerVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  // Change single layer color
  const handleColorChange = (id: string, newColor: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, color: newColor } : l))
    );
  };

  // Simulated node reduction based on smoothness slider
  const displayedNodeCount = useMemo(() => {
    const raw = currentSample.originalNodeCount;
    const ratio = 1 - (smoothness / 100) * 0.85;
    return Math.max(24, Math.round(raw * ratio));
  }, [currentSample.originalNodeCount, smoothness]);

  const savedPercent = useMemo(() => {
    const raw = currentSample.originalNodeCount;
    return Math.round(((raw - displayedNodeCount) / raw) * 100);
  }, [currentSample.originalNodeCount, displayedNodeCount]);

  // Generate SVG markup from current layer state
  const generatedSvgString = useMemo(() => {
    const visibleLayers = layers.filter((l) => l.visible);
    const content = visibleLayers
      .map(
        (l) =>
          `  <g id="${l.id}" fill="${l.color}">\n    <path d="${l.d}" fill-rule="evenodd" />\n  </g>`
      )
      .join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${currentSample.viewBox}">\n${content}\n</svg>`;
  }, [layers, currentSample.viewBox]);

  // Extract visual nodes for display
  const visualNodes = useMemo(() => {
    if (!showNodes) return [];
    const allCoords: Array<{ x: number; y: number }> = [];
    layers
      .filter((l) => l.visible)
      .forEach((layer) => {
        allCoords.push(...extractCoordinates(layer.d));
      });
    return allCoords;
  }, [layers, showNodes]);

  // Copy to clipboard helper
  const handleCopy = (type: 'raw' | 'jsx') => {
    let text = generatedSvgString;
    if (type === 'jsx') {
      text = `export default function Icon(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${generatedSvgString.replace(/fill-rule/g, 'fillRule')}\n  );\n}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Download SVG file
  const handleDownload = (format: 'cricut' | 'web') => {
    const blob = new Blob([generatedSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSample.id}-${format}-optimized.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle generation action
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/svg/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, mode }),
      });
      const data = await res.json();
      if (data.success && data.layers) {
        setLayers(data.layers);
      }
    } catch (err) {
      console.error('Failed to generate SVG:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle file drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFile({
          name: file.name,
          preview: event.target?.result as string,
        });
        handleSelectSample('cricut_bear');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* App Frame (Taste-Skill Anti-Slop System) */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Studio Titlebar (Desktop App Style) */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-200/80 bg-zinc-50/70 px-5 py-3 dark:border-zinc-850 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-red-400/80 dark:bg-red-500/60" />
              <span className="size-3 rounded-full bg-amber-400/80 dark:bg-amber-500/60" />
              <span className="size-3 rounded-full bg-emerald-400/80 dark:bg-emerald-500/60" />
            </div>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100">
                vector_engine_v1.0.svg
              </span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                100% Closed Curves
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setMode('text')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium text-xs transition-all ${
                mode === 'text'
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <Sparkles className="size-3" />
              Text to SVG
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium text-xs transition-all ${
                mode === 'image'
                  ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              <Upload className="size-3" />
              PNG to SVG
            </button>
          </div>
        </div>

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Panel: Parameters & Input (5 cols) */}
          <div className="flex flex-col justify-between border-b border-zinc-200/80 p-6 lg:col-span-5 lg:border-r lg:border-b-0 dark:border-zinc-850">
            <div className="space-y-5">
              {mode === 'text' ? (
                <>
                  {/* Prompt Textarea */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-medium text-zinc-900 dark:text-zinc-100">
                        Prompt Instruction
                      </label>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                        ✓ Free Trial • No Sign-up
                      </span>
                    </div>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={3}
                      placeholder="e.g. Boho Wildflower Bouquet for Cricut Vinyl..."
                      className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100 dark:focus:border-zinc-100"
                    />
                  </div>

                  {/* Profile Preset Selectors */}
                  <div className="space-y-2">
                    <label className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                      Target Geometry Profile
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: 'cricut-cut',
                          title: 'Cricut Monocut',
                          spec: '1 Closed Loop • 0 Overlap',
                          icon: Scissors,
                          sample: 'cricut_bear',
                        },
                        {
                          id: 'multi-layer',
                          title: 'Vinyl Multi-Layer',
                          spec: 'Separated by Color Group',
                          icon: Layers,
                          sample: 'wildflower',
                        },
                        {
                          id: 'ui-icon',
                          title: 'Minimalist Icon',
                          spec: 'React JSX • < 3KB',
                          icon: Code2,
                          sample: 'ui_sparkles',
                        },
                        {
                          id: 'vintage-badge',
                          title: 'Laser Engraving',
                          spec: 'High-Contrast Solid Fill',
                          icon: Cpu,
                          sample: 'cricut_bear',
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setStyle(item.id as SvgPresetStyle);
                            handleSelectSample(item.sample);
                          }}
                          className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                            style === item.id
                              ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                              : 'border-zinc-200 bg-zinc-50/60 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-medium text-xs">
                            <item.icon className="size-3.5" />
                            {item.title}
                          </div>
                          <span
                            className={`mt-1 font-mono text-[10px] ${
                              style === item.id
                                ? 'text-zinc-300 dark:text-zinc-600'
                                : 'text-zinc-400 dark:text-zinc-500'
                            }`}
                          >
                            {item.spec}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Image to SVG Dropzone */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                      Raster Source (PNG, JPG, WebP)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-7 text-center transition-all hover:border-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/30 dark:hover:border-zinc-600"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                      />
                      <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-200/80 text-zinc-700 transition-colors group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950">
                        <Upload className="size-5" />
                      </div>
                      <p className="mt-2.5 font-medium text-xs text-zinc-900 dark:text-zinc-100">
                        {uploadedFile ? uploadedFile.name : 'Drop PNG or click to browse'}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                        Auto-eliminates fuzzy pixels & extracts paths
                      </p>
                    </div>
                  </div>

                  {/* Sample presets */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[11px] text-zinc-400">Or test ready samples:</span>
                    <div className="flex gap-1.5">
                      {Object.keys(SAMPLE_SVGS).map((k) => (
                        <button
                          key={k}
                          onClick={() => handleSelectSample(k)}
                          className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                            selectedSampleKey === k
                              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                          }`}
                        >
                          {SAMPLE_SVGS[k].title.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 font-medium text-sm text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {isGenerating ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-900 dark:border-t-transparent" />
                    <span>Processing Bézier Curves...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>{mode === 'text' ? 'Generate Clean SVG' : 'Vectorize & Smooth Image'}</span>
                  </>
                )}
              </button>

              {/* Free Trial Badge */}
              <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    No Sign-Up Free Trial
                  </span>
                </div>
                <span className="font-mono text-zinc-500 text-[11px]">2/2 remaining today</span>
              </div>
            </div>

            {/* Architecture Footer Note */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-200/80 pt-4 font-mono text-[11px] text-zinc-400 dark:border-zinc-850">
              <span>Engine: VTracer + RDP</span>
              <span className="text-emerald-500">● 0 Self-Intersections</span>
            </div>
          </div>

          {/* Right Panel: Interactive Canvas (7 cols) */}
          <div className="flex flex-col bg-zinc-50/40 p-6 lg:col-span-7 dark:bg-zinc-950/40">
            
            {/* Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-850">
              
              {/* Node Economy Metric Badge */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 font-mono text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{displayedNodeCount}</span>
                  <span className="text-zinc-400">nodes</span>
                </div>

                <div className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-emerald-700 text-[11px] dark:text-emerald-400">
                  -{savedPercent}% Node Soup
                </div>
              </div>

              {/* Viewport Action Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowNodes(!showNodes)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                    showNodes
                      ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                  }`}
                >
                  <Crosshair className="size-3" />
                  Anchor Nodes
                </button>

                <div className="mx-1 h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />

                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                  className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                  className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  title="Reset View"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Precision SVG Canvas Area */}
            <div className="relative mt-4 flex min-h-[340px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-inner dark:border-zinc-800 dark:bg-zinc-900">
              
              {/* Technical Millimeter Grid Pattern */}
              {showGrid && (
                <div
                  className="absolute inset-0 opacity-[0.08] dark:opacity-[0.04]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
              )}

              {/* Rendered SVG with Zoom & Vectors */}
              <div
                style={{ transform: `scale(${zoom})`, transition: 'transform 0.12s ease' }}
                className="relative flex items-center justify-center p-6"
              >
                <svg
                  viewBox={currentSample.viewBox}
                  className="max-h-[290px] w-auto max-w-[340px] transition-all"
                >
                  {layers
                    .filter((l) => l.visible)
                    .map((layer) => (
                      <path
                        key={layer.id}
                        d={layer.d}
                        fill={layer.color}
                        fillRule="evenodd"
                        stroke={showNodes ? 'rgba(0,0,0,0.15)' : 'none'}
                        strokeWidth="0.5"
                      />
                    ))}

                  {/* Render Visual Red Diamond Anchor Nodes if enabled */}
                  {showNodes &&
                    visualNodes.map((pt, idx) => (
                      <rect
                        key={idx}
                        x={pt.x - 2}
                        y={pt.y - 2}
                        width="4"
                        height="4"
                        fill="#EF4444"
                        stroke="#FFFFFF"
                        strokeWidth="0.8"
                        transform={`rotate(45 ${pt.x} ${pt.y})`}
                        className="transition-all"
                      />
                    ))}
                </svg>
              </div>
            </div>

            {/* Smoothness Slider */}
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  <Sliders className="size-3.5 text-zinc-500" />
                  Ramer-Douglas-Peucker Smoothing
                </span>
                <span className="font-mono text-zinc-500">{smoothness}% Tolerance</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={smoothness}
                onChange={(e) => setSmoothness(parseInt(e.target.value))}
                className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-100 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[10px] text-zinc-400">
                <span>Detailed (Raw Anchor Count)</span>
                <span>Optimized Cut (Clean Paths)</span>
              </div>
            </div>

            {/* Layers / Color Separation Inspector */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  <Layers className="size-3.5 text-zinc-500" />
                  Color Layers (Cricut Compound Paths)
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {layers.length} separate cut mats
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <input
                      type="color"
                      value={layer.color}
                      onChange={(e) => handleColorChange(layer.id, e.target.value)}
                      className="size-3.5 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                    <span className="max-w-[120px] truncate font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                      {layer.name}
                    </span>
                    <button
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      {layer.visible ? (
                        <Eye className="size-3.5 text-emerald-500" />
                      ) : (
                        <EyeOff className="size-3.5 opacity-40" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar (Exporting) */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/80 pt-4 dark:border-zinc-850">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleDownload('cricut')}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 font-medium text-xs text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
                >
                  <Scissors className="size-3.5" />
                  Download Cricut SVG
                </button>
                <button
                  onClick={() => handleDownload('web')}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 font-medium text-xs text-zinc-800 transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-850"
                >
                  <Download className="size-3.5" />
                  Download Web SVG
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy('jsx')}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {copiedType === 'jsx' ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Code2 className="size-3.5" />
                  )}
                  JSX
                </button>
                <button
                  onClick={() => handleCopy('raw')}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {copiedType === 'raw' ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  Raw SVG
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
