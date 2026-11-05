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
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Scissors,
  Code2,
  Palette,
  FileCheck,
  Cpu,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { SAMPLE_SVGS } from './sample-svgs';
import { StudioMode, SvgPresetStyle, SvgLayer } from './types';

// Extract pseudo coordinates from SVG path for node visualization
function extractCoordinates(d: string): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const matches = d.match(/([0-9.-]+)[,\s]+([0-9.-]+)/g);
  if (!matches) return points;

  // Sample nodes to avoid browser freeze on large paths
  const step = Math.max(1, Math.floor(matches.length / 50));
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
  const [prompt, setPrompt] = useState('Boho Wildflower Floral Bouquet for T-Shirt');
  const [selectedSampleKey, setSelectedSampleKey] = useState<string>('wildflower');
  
  // Active sample data
  const currentSample = SAMPLE_SVGS[selectedSampleKey] || SAMPLE_SVGS.wildflower;
  const [layers, setLayers] = useState<SvgLayer[]>(currentSample.layers);
  
  // Interactive controls
  const [showNodes, setShowNodes] = useState(true);
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
    // At smoothness 100, we compress down by ~85%
    const ratio = 1 - (smoothness / 100) * 0.85;
    return Math.max(24, Math.round(raw * ratio));
  }, [currentSample.originalNodeCount, smoothness]);

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
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      {/* Studio Container */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-xl">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-border/60 bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-base tracking-tight">
                  AI Vector Studio
                </h3>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400 text-xs">
                  ⚡ 100% True Vector
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                Zero Node Soup • Cricut, Laser & React Component Compatible
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-2 flex items-center rounded-xl border border-border/60 bg-background p-1 shadow-inner sm:mt-0">
            <button
              onClick={() => setMode('text')}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium text-xs transition-all ${
                mode === 'text'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="size-3.5" />
              Text to SVG
            </button>
            <button
              onClick={() => setMode('image')}
              className={`flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium text-xs transition-all ${
                mode === 'image'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="size-3.5" />
              PNG to SVG
            </button>
          </div>
        </div>

        {/* Studio Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Generator Configuration (5 cols) */}
          <div className="flex flex-col justify-between border-b border-border/60 p-6 lg:col-span-5 lg:border-r lg:border-b-0">
            <div className="space-y-6">
              {mode === 'text' ? (
                <>
                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between font-medium text-foreground text-xs">
                      <span>Prompt Description</span>
                      <span className="text-muted-foreground text-[11px]">Free, No Sign-up</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                        placeholder="e.g. Vintage Boho Wildflower Skull for Cricut T-Shirt..."
                        className="w-full resize-none rounded-xl border border-input bg-muted/40 p-3 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Preset Style Selector */}
                  <div className="space-y-2">
                    <label className="font-medium text-foreground text-xs">
                      Target Optimization Profile
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          id: 'cricut-cut',
                          title: 'Cricut Monocut',
                          desc: 'Single closed path, zero overlap',
                          icon: Scissors,
                          sample: 'cricut_bear',
                        },
                        {
                          id: 'multi-layer',
                          title: 'Vinyl Multi-Layer',
                          desc: 'Separated by color layers',
                          icon: Layers,
                          sample: 'wildflower',
                        },
                        {
                          id: 'ui-icon',
                          title: 'Web & UI Icon',
                          desc: 'Ultra lightweight React JSX',
                          icon: Code2,
                          sample: 'ui_sparkles',
                        },
                        {
                          id: 'vintage-badge',
                          title: 'Laser Engraving',
                          desc: 'High-contrast wood/acrylic',
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
                              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/30'
                              : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                          }`}
                        >
                          <div className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground text-xs">
                            <item.icon className="size-3.5" />
                            {item.title}
                          </div>
                          <span className="text-[11px] text-muted-foreground leading-tight">
                            {item.desc}
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
                    <label className="font-medium text-foreground text-xs">
                      Upload Raster Image (PNG, JPG, WebP)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center transition-all hover:border-primary hover:bg-muted/40"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                      />
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                        <Upload className="size-6" />
                      </div>
                      <p className="mt-3 font-medium text-foreground text-sm">
                        {uploadedFile ? uploadedFile.name : 'Click or drop image here'}
                      </p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        Auto-eliminates anti-aliased blur & extracts true curves
                      </p>
                    </div>
                  </div>

                  {/* Sample Templates to try */}
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-xs">Or test sample images:</span>
                    <div className="flex gap-2">
                      {Object.keys(SAMPLE_SVGS).map((k) => (
                        <button
                          key={k}
                          onClick={() => handleSelectSample(k)}
                          className={`rounded-lg border px-3 py-1 text-xs transition-all ${
                            selectedSampleKey === k
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40'
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
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gap-2 rounded-xl py-6 font-semibold shadow-md"
              >
                {isGenerating ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Generating Vector Paths...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {mode === 'text' ? 'Generate Clean SVG' : 'Vectorize & Smooth Image'}
                  </>
                )}
              </Button>

              {/* Free Trial Counter Card */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="size-4 text-emerald-500" />
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    No Sign-Up Free Trial
                  </span>
                </div>
                <span className="text-muted-foreground">2/2 exports remaining today</span>
              </div>
            </div>

            {/* Quick Presets Footer */}
            <div className="mt-6 border-t border-border/40 pt-4 text-muted-foreground text-xs">
              <span className="font-medium">Active Model:</span> VTracer Bezier Kernel + LLM Topological Clean
            </div>
          </div>

          {/* Right Column: Interactive Canvas & Node Inspector (7 cols) */}
          <div className="flex flex-col bg-muted/10 p-6 lg:col-span-7">
            {/* Canvas Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
              {/* Node Stats Pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1 font-mono text-xs shadow-sm">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-foreground">{displayedNodeCount}</span>
                  <span className="text-muted-foreground">nodes</span>
                </div>

                <div className="hidden text-muted-foreground text-xs sm:inline">
                  (reduced from <span className="line-through">{currentSample.originalNodeCount}</span> messy nodes)
                </div>
              </div>

              {/* Canvas Action Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowNodes(!showNodes)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                    showNodes
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border/60 bg-background text-muted-foreground hover:bg-muted'
                  }`}
                  title="Toggle anchor point nodes visibility"
                >
                  <span className="size-1.5 rounded-full bg-red-500" />
                  Show Nodes
                </button>

                <div className="mx-1 h-4 w-px bg-border/60" />

                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                  className="rounded-lg border border-border/60 bg-background p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
                  className="rounded-lg border border-border/60 bg-background p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="rounded-lg border border-border/60 bg-background p-1.5 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* SVG Visual Canvas Area */}
            <div className="relative mt-4 flex min-h-[340px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background/50 shadow-inner">
              {/* Transparency Checkerboard background effect */}
              <div
                className="absolute inset-0 opacity-15 dark:opacity-5"
                style={{
                  backgroundImage:
                    'radial-gradient(var(--border) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />

              {/* Rendered SVG with Zoom & Node Highlights */}
              <div
                style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease' }}
                className="relative flex items-center justify-center p-6"
              >
                <svg
                  viewBox={currentSample.viewBox}
                  className="max-h-[280px] w-auto max-w-[320px] drop-shadow-md"
                >
                  {layers
                    .filter((l) => l.visible)
                    .map((layer) => (
                      <path
                        key={layer.id}
                        d={layer.d}
                        fill={layer.color}
                        fillRule="evenodd"
                        stroke={showNodes ? 'rgba(0,0,0,0.1)' : 'none'}
                        strokeWidth="0.5"
                      />
                    ))}

                  {/* Render Visual Red Anchor Nodes if enabled */}
                  {showNodes &&
                    visualNodes.map((pt, idx) => (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r="2.5"
                        fill="#EF4444"
                        stroke="#FFFFFF"
                        strokeWidth="1"
                        className="transition-all"
                      />
                    ))}
                </svg>
              </div>
            </div>

            {/* Smoothness Slider Control */}
            <div className="mt-4 rounded-xl border border-border/60 bg-background/70 p-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Sliders className="size-3.5 text-primary" />
                  RDP Node Smoothing (Eliminate Node Soup)
                </span>
                <span className="font-mono text-muted-foreground">{smoothness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={smoothness}
                onChange={(e) => setSmoothness(parseInt(e.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>Detailed Raw Curves</span>
                <span>Optimized Cut Path (Cricut-Ready)</span>
              </div>
            </div>

            {/* Layers / Color Separation Inspector */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Layers className="size-3.5 text-primary" />
                  Color Layers (Automatic Compound Paths)
                </span>
                <span className="text-muted-foreground">{layers.length} layers detected</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs shadow-sm"
                  >
                    <input
                      type="color"
                      value={layer.color}
                      onChange={(e) => handleColorChange(layer.id, e.target.value)}
                      className="size-4 cursor-pointer rounded-full border-0 bg-transparent p-0"
                    />
                    <span className="max-w-[120px] truncate font-medium text-foreground text-[11px]">
                      {layer.name}
                    </span>
                    <button
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {layer.visible ? (
                        <Eye className="size-3.5 text-emerald-500" />
                      ) : (
                        <EyeOff className="size-3.5 text-muted-foreground/60" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Export & Download Action Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => handleDownload('cricut')}
                  className="gap-2 rounded-xl bg-emerald-600 font-medium text-white shadow-sm hover:bg-emerald-700 text-xs"
                >
                  <Scissors className="size-3.5" />
                  Download Cricut SVG
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload('web')}
                  className="gap-2 rounded-xl text-xs"
                >
                  <Download className="size-3.5" />
                  Download Web SVG
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy('jsx')}
                  className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
                >
                  {copiedType === 'jsx' ? <Check className="size-3.5 text-emerald-500" /> : <Code2 className="size-3.5" />}
                  Copy JSX
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy('raw')}
                  className="gap-1.5 text-muted-foreground hover:text-foreground text-xs"
                >
                  {copiedType === 'raw' ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  Copy SVG
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
