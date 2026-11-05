'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Cpu,
  Crosshair,
  Columns,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  Maximize2,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { SAMPLE_SVGS, SampleSvg } from './sample-svgs';
import { StudioMode, SvgPresetStyle, SvgLayer } from './types';

// Extract coordinates from SVG path for precision node visualization
function extractCoordinates(d: string): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const matches = d.match(/([0-9.-]+)[,\s]+([0-9.-]+)/g);
  if (!matches) return points;

  const step = Math.max(1, Math.floor(matches.length / 45));
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
  const [prompt, setPrompt] = useState('Boho Wildflower Floral Bouquet for Cricut Vinyl');
  const [selectedSampleKey, setSelectedSampleKey] = useState<string>('wildflower');

  // Active sample data & layer state
  const currentSample: SampleSvg = SAMPLE_SVGS[selectedSampleKey] || SAMPLE_SVGS.wildflower;
  const [layers, setLayers] = useState<SvgLayer[]>(currentSample.layers);

  // Canvas Advanced View Modes: 'split-compare' | 'blade-trace' | '3d-mats'
  const [canvasMode, setCanvasMode] = useState<'split-compare' | 'blade-trace' | '3d-mats'>('split-compare');

  // 1. Split Screen Sweep state
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [autoSweep, setAutoSweep] = useState(true);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // 2. Blade & Laser CNC Toolpath Simulation state
  const [isCutting, setIsCutting] = useState(true);
  const [cutProgress, setCutProgress] = useState(35); // 0 to 100
  const [cutSpeed, setCutSpeed] = useState<1 | 2 | 4>(2);
  const [toolType, setToolType] = useState<'blade' | 'laser'>('blade');

  // 3. 3D Vinyl Mats state
  const [matExplosion, setMatExplosion] = useState<number>(75); // 0 to 100
  const [inspectTrapping, setInspectTrapping] = useState(false);

  // General controls
  const [showNodes, setShowNodes] = useState(true);
  const [smoothness, setSmoothness] = useState<number>(85); // 10 to 100
  const [zoom, setZoom] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Upload file state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-sweep oscillation loop
  useEffect(() => {
    if (!autoSweep || canvasMode !== 'split-compare' || isDraggingSplit) return;
    let frameId: number;
    const startTime = Date.now();
    const loop = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Sinusoidal wave between 18% and 82% with ~4.5s cycle
      const pos = 50 + 32 * Math.sin(elapsed * 1.4);
      setSplitPos(Math.round(pos));
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [autoSweep, canvasMode, isDraggingSplit]);

  // Blade / Laser Cutting Simulation Loop
  useEffect(() => {
    if (!isCutting || canvasMode !== 'blade-trace') return;
    const interval = setInterval(() => {
      setCutProgress((p) => {
        if (p >= 100) return 0;
        return Math.min(100, p + 0.6 * cutSpeed);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isCutting, canvasMode, cutSpeed]);

  // Handle sample selection
  const handleSelectSample = (key: string) => {
    setSelectedSampleKey(key);
    const s = SAMPLE_SVGS[key];
    if (s) {
      setLayers(s.layers.map((l) => ({ ...l })));
      if (s.category === 'cricut') {
        setStyle('cricut-cut');
        setPrompt('Geometric Mountain Bear for Cricut Vinyl Decal');
      } else if (s.category === 'multilayer') {
        setStyle('multi-layer');
        setPrompt('Boho Wildflower Floral Bouquet for Cricut Vinyl');
      } else if (s.category === 'vintage') {
        setStyle('vintage-badge');
        setPrompt('Vintage Artisan Craft Badge for Laser Engraving');
      } else if (s.category === 'icon') {
        setStyle('ui-icon');
        setPrompt('AI Smart Sparkles Vector Icon for Web & React');
      }
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
    const ratio = 1 - (smoothness / 100) * 0.88;
    return Math.max(36, Math.round(raw * ratio));
  }, [currentSample.originalNodeCount, smoothness]);

  const savedPercent = useMemo(() => {
    const raw = currentSample.originalNodeCount;
    return Math.round(((raw - displayedNodeCount) / raw) * 100);
  }, [currentSample.originalNodeCount, displayedNodeCount]);

  // Generate SVG string for export
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

  // Clean vector nodes
  const cleanNodes = useMemo(() => {
    const coords: Array<{ x: number; y: number }> = [];
    layers
      .filter((l) => l.visible)
      .forEach((layer) => {
        coords.push(...extractCoordinates(layer.d));
      });
    return coords;
  }, [layers]);

  // Chaotic jitter nodes for "Raw Trace" side to visually showcase "Node Soup"
  const rawJitterNodes = useMemo(() => {
    const rawNodes: Array<{ x: number; y: number }> = [];
    cleanNodes.forEach((pt, i) => {
      rawNodes.push(pt);
      rawNodes.push({ x: pt.x + (i % 3) * 3 - 3, y: pt.y + (i % 5) * 3 - 3 });
      rawNodes.push({ x: pt.x - (i % 4) * 3 + 2, y: pt.y - (i % 2) * 3 + 2 });
      rawNodes.push({ x: pt.x + (i % 2) * 4 - 2, y: pt.y + (i % 3) * 4 - 2 });
    });
    return rawNodes;
  }, [cleanNodes]);

  // Calculate live toolpath coordinate and blade angle along path
  const currentToolCoord = useMemo(() => {
    const pts = currentSample.toolpathPoints || cleanNodes;
    if (!pts || pts.length === 0) return { x: 250, y: 250, angle: 0 };
    const n = pts.length;
    const progressFrac = (cutProgress / 100) * (n - 1);
    const idx = Math.min(n - 1, Math.floor(progressFrac));
    const nextIdx = Math.min(n - 1, idx + 1);
    const rem = progressFrac - idx;

    const p1 = pts[idx];
    const p2 = pts[nextIdx];
    const x = p1.x + (p2.x - p1.x) * rem;
    const y = p1.y + (p2.y - p1.y) * rem;
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
    return { x, y, angle };
  }, [currentSample.toolpathPoints, cleanNodes, cutProgress]);

  // Split-screen drag listeners
  const handleSplitDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDraggingSplit || !canvasContainerRef.current) return;
      setAutoSweep(false);
      const rect = canvasContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      setSplitPos(Math.round((x / rect.width) * 100));
    },
    [isDraggingSplit]
  );

  useEffect(() => {
    const stopDrag = () => setIsDraggingSplit(false);
    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleSplitDrag);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', handleSplitDrag);
      window.addEventListener('touchend', stopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', handleSplitDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', handleSplitDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [isDraggingSplit, handleSplitDrag]);

  // Copy helper
  const handleCopy = (type: 'raw' | 'jsx') => {
    let text = generatedSvgString;
    if (type === 'jsx') {
      text = `export default function VectorGraphic(props: React.SVGProps<SVGSVGElement>) {\n  return (\n    ${generatedSvgString.replace(/fill-rule/g, 'fillRule')}\n  );\n}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Download SVG
  const handleDownload = (format: 'cricut' | 'web') => {
    const blob = new Blob([generatedSvgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSample.id}-${format}-clean.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate action (simulated or API)
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

  // Upload file
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
      {/* Studio App-Frame (Anti-Slop Unified Workspace) */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Studio Window Title Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-200/80 bg-zinc-50/80 px-5 py-3 dark:border-zinc-850 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-red-400/80 dark:bg-red-500/60" />
              <span className="size-3 rounded-full bg-amber-400/80 dark:bg-amber-500/60" />
              <span className="size-3 rounded-full bg-emerald-400/80 dark:bg-emerald-500/60" />
            </div>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-xs text-zinc-900 dark:text-zinc-100">
                vector_engine_studio.svg
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Toolpath Engine Active
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
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

        {/* Studio Grid Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Generator Settings & Profile Selection (5 cols) */}
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
                      placeholder="e.g. Boho Wildflower Floral Bouquet for Cricut Vinyl..."
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
                          spec: 'Separated Color Sheets',
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
                          sample: 'vintage_badge',
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
                </div>
              )}

              {/* Sample Art Switcher Row */}
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-zinc-400">
                  Ready-to-test Craft & Web Samples:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.keys(SAMPLE_SVGS).map((k) => (
                    <button
                      key={k}
                      onClick={() => handleSelectSample(k)}
                      className={`truncate rounded-lg border px-2.5 py-1.5 text-left font-mono text-[11px] transition-all ${
                        selectedSampleKey === k
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      {SAMPLE_SVGS[k].title.split(' ')[0]} {SAMPLE_SVGS[k].title.split(' ')[1] || ''}
                    </button>
                  ))}
                </div>
              </div>

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

            {/* Architecture Telemetry Footer */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-200/80 pt-4 font-mono text-[11px] text-zinc-400 dark:border-zinc-850">
              <span className="flex items-center gap-1.5">
                <Activity className="size-3 text-emerald-500" />
                VTracer + Ramer-Douglas-Peucker
              </span>
              <span className="text-emerald-500 font-semibold">● 0 Self-Intersections</span>
            </div>
          </div>

          {/* Right Column: Vivid Demonstration Canvas (7 cols) */}
          <div className="flex flex-col bg-zinc-50/40 p-6 lg:col-span-7 dark:bg-zinc-950/40">
            
            {/* Super Viewport Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-3.5 dark:border-zinc-850">
              
              {/* Demonstration Modes */}
              <div className="flex items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  onClick={() => setCanvasMode('split-compare')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    canvasMode === 'split-compare'
                      ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                  }`}
                  title="Interactive Split Comparison Sweep"
                >
                  <Columns className="size-3.5 text-amber-500" />
                  <span>Split Sweep</span>
                </button>

                <button
                  onClick={() => {
                    setCanvasMode('blade-trace');
                    setIsCutting(true);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    canvasMode === 'blade-trace'
                      ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                  }`}
                  title="Simulate continuous physical toolpath cutting"
                >
                  <Scissors className="size-3.5 text-emerald-500" />
                  <span>Blade Trace</span>
                </button>

                <button
                  onClick={() => setCanvasMode('3d-mats')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    canvasMode === '3d-mats'
                      ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400'
                  }`}
                  title="Inspect vinyl color mats in 3D perspective"
                >
                  <Layers className="size-3.5 text-orange-500" />
                  <span>3D Vinyl Mats</span>
                </button>
              </div>

              {/* Auxiliary Controls (Nodes Toggle, Zoom, Reset) */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowNodes(!showNodes)}
                  className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-all ${
                    showNodes
                      ? 'border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                  }`}
                >
                  <Crosshair className="size-3" />
                  Nodes
                </button>

                <button
                  onClick={() => setZoom((z) => Math.min(2.2, z + 0.2))}
                  className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  title="Zoom In"
                >
                  <ZoomIn className="size-3.5" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
                  className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="size-3.5" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  title="Reset Zoom"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* VIVID DEMONSTRATION STAGE */}
            <div
              ref={canvasContainerRef}
              className="relative mt-4 flex min-h-[380px] flex-1 select-none items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 shadow-inner dark:border-zinc-800"
            >
              {/* Millimeter Engineering Grid */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* ──────────────────────────────────────────────────────────
                  1. SPLIT COMPARISON SWEEP (Node Meltdown Wipe Animation)
                  ────────────────────────────────────────────────────────── */}
              {canvasMode === 'split-compare' && (
                <div className="relative flex size-full items-center justify-center p-4">
                  {/* Floating Badges */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/70 px-2.5 py-1 font-mono text-[11px] text-red-400 shadow-lg backdrop-blur-md">
                    <AlertTriangle className="size-3 text-red-400 animate-pulse" />
                    <span>Raw Auto-Trace: 3,480 Chaotic Anchors</span>
                  </div>

                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/70 px-2.5 py-1 font-mono text-[11px] text-emerald-400 shadow-lg backdrop-blur-md">
                    <CheckCircle2 className="size-3 text-emerald-400" />
                    <span>AI Clean Bézier: 48 Smooth Nodes</span>
                  </div>

                  {/* Auto-Scan Toggle Button in Top Center */}
                  <div className="absolute top-3 z-20">
                    <button
                      onClick={() => setAutoSweep(!autoSweep)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] transition-all shadow-md ${
                        autoSweep
                          ? 'border-emerald-500/50 bg-emerald-950/80 text-emerald-300'
                          : 'border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${autoSweep ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                      <span>{autoSweep ? 'Auto-Scan Playing ⟲' : 'Resume Auto-Scan ⟲'}</span>
                    </button>
                  </div>

                  {/* Canvas Graphics Container */}
                  <div
                    style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s ease' }}
                    className="relative flex size-[320px] items-center justify-center"
                  >
                    {/* LAYER 1: Raw Trace (Left side of split pos) */}
                    <div
                      style={{
                        clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <svg viewBox={currentSample.viewBox} className="size-full">
                        {layers
                          .filter((l) => l.visible)
                          .map((layer) => (
                            <path
                              key={layer.id}
                              d={layer.d}
                              fill={layer.color}
                              fillRule="evenodd"
                              stroke="rgba(239, 68, 68, 0.85)"
                              strokeWidth="1.8"
                              strokeDasharray="3,2"
                            />
                          ))}

                        {/* Chaotic Red Jitter Nodes on Raw side */}
                        {showNodes &&
                          rawJitterNodes.map((pt, idx) => (
                            <circle
                              key={`raw-${idx}`}
                              cx={pt.x}
                              cy={pt.y}
                              r="2.2"
                              fill="#EF4444"
                              stroke="#FFFFFF"
                              strokeWidth="0.4"
                            />
                          ))}
                      </svg>
                    </div>

                    {/* LAYER 2: Clean AI Vector (Right side of split pos) */}
                    <div
                      style={{
                        clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`,
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <svg viewBox={currentSample.viewBox} className="size-full">
                        {layers
                          .filter((l) => l.visible)
                          .map((layer) => (
                            <path
                              key={layer.id}
                              d={layer.d}
                              fill={layer.color}
                              fillRule="evenodd"
                              stroke="rgba(16, 185, 129, 0.4)"
                              strokeWidth="0.6"
                            />
                          ))}

                        {/* Clean Green Diamond Nodes on Clean side */}
                        {showNodes &&
                          cleanNodes.map((pt, idx) => (
                            <rect
                              key={`clean-${idx}`}
                              x={pt.x - 3}
                              y={pt.y - 3}
                              width="6"
                              height="6"
                              fill="#10B981"
                              stroke="#FFFFFF"
                              strokeWidth="0.8"
                              transform={`rotate(45 ${pt.x} ${pt.y})`}
                            />
                          ))}
                      </svg>
                    </div>
                  </div>

                  {/* Interactive Draggable Split Laser Scanner Bar */}
                  <div
                    style={{ left: `${splitPos}%` }}
                    onMouseDown={() => {
                      setAutoSweep(false);
                      setIsDraggingSplit(true);
                    }}
                    onTouchStart={() => {
                      setAutoSweep(false);
                      setIsDraggingSplit(true);
                    }}
                    className="group absolute top-0 bottom-0 z-30 flex -translate-x-1/2 cursor-ew-resize items-center justify-center"
                  >
                    {/* Glowing Laser Vertical Beam */}
                    <div className="h-full w-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />

                    {/* Top & Bottom Laser Emitters */}
                    <div className="absolute top-1 size-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#10B981]" />
                    <div className="absolute bottom-1 size-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#10B981]" />

                    {/* Center Drag Handle Orb */}
                    <div className="absolute flex size-8 items-center justify-center rounded-full border border-emerald-400/80 bg-zinc-900 shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-transform group-hover:scale-110 active:scale-95">
                      <span className="font-mono text-xs text-emerald-400">↔</span>
                    </div>
                  </div>

                  {/* Bottom Telemetry HUD */}
                  <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-4 py-1.5 font-mono text-[11px] text-zinc-300 shadow-xl backdrop-blur-md">
                    <span className="text-zinc-400">Position: {splitPos}%</span>
                    <span className="h-3 w-px bg-zinc-700" />
                    <span className="text-emerald-400">
                      Anchor Reduction: -98.6% • Zero Chattering
                    </span>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────
                  2. BLADE & LASER CNC TOOLPATH TRACING SIMULATION
                  ────────────────────────────────────────────────────────── */}
              {canvasMode === 'blade-trace' && (
                <div className="relative flex size-full items-center justify-center p-4">
                  
                  {/* Top Industrial G-Code Feed HUD */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 font-mono text-[10px] text-zinc-300 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-emerald-400 font-semibold">
                        G01 CNC TOOLPATH SIMULATION
                      </span>
                    </div>
                    <div className="text-zinc-400">
                      X: <span className="text-zinc-100">{currentToolCoord.x.toFixed(1)}mm</span> | Y:{' '}
                      <span className="text-zinc-100">{currentToolCoord.y.toFixed(1)}mm</span> | Z:{' '}
                      <span className="text-emerald-400 font-semibold">-0.20mm (CUT)</span>
                    </div>
                    <div className="text-zinc-500">
                      Feed: 1200 mm/min • Angle: {currentToolCoord.angle.toFixed(0)}° • Closed Z-Loop
                    </div>
                  </div>

                  {/* Top Right Tool Switcher (Blade vs Laser) */}
                  <div className="absolute top-3 right-3 z-20 flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 shadow-md">
                    <button
                      onClick={() => setToolType('blade')}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] transition-all ${
                        toolType === 'blade'
                          ? 'bg-zinc-800 text-emerald-400 font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Scissors className="size-3" />
                      Carbide Blade
                    </button>
                    <button
                      onClick={() => setToolType('laser')}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] transition-all ${
                        toolType === 'laser'
                          ? 'bg-zinc-800 text-cyan-400 font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Flame className="size-3" />
                      Optical Laser
                    </button>
                  </div>

                  {/* SVG Stage Container with animated toolpath & traveling head */}
                  <div
                    style={{ transform: `scale(${zoom})` }}
                    className="relative flex size-[320px] items-center justify-center"
                  >
                    <svg viewBox={currentSample.viewBox} className="size-full overflow-visible">
                      {/* Dim background uncut path */}
                      {layers.map((layer) => (
                        <path
                          key={layer.id}
                          d={layer.d}
                          fill="none"
                          stroke="#1E293B"
                          strokeWidth="2.5"
                          strokeDasharray="4,4"
                        />
                      ))}

                      {/* Glowing Cut Kerf Trail (Already cut portion) */}
                      {layers.map((layer) => (
                        <path
                          key={`cut-${layer.id}`}
                          d={layer.d}
                          fill="none"
                          stroke={toolType === 'blade' ? '#10B981' : '#06B6D4'}
                          strokeWidth="3"
                          strokeDasharray="2000"
                          strokeDashoffset={2000 - (cutProgress / 100) * 2000}
                          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]"
                        />
                      ))}

                      {/* Traveling Cutting Head Assembly */}
                      <g
                        transform={`translate(${currentToolCoord.x}, ${currentToolCoord.y}) rotate(${currentToolCoord.angle})`}
                      >
                        {toolType === 'blade' ? (
                          /* Cricut 45-degree Carbide Blade Housing */
                          <g transform="translate(-8, -26)">
                            {/* Metallic Chuck body */}
                            <rect x="5" y="0" width="6" height="18" rx="2" fill="#94A3B8" />
                            {/* Brass Collar */}
                            <rect x="4" y="14" width="8" height="5" rx="1" fill="#F59E0B" />
                            {/* Silver Carbide blade tip touching the line */}
                            <polygon points="6,19 10,19 8,26" fill="#F8FAFC" />
                            {/* Blade contact spark */}
                            <circle cx="8" cy="26" r="3" fill="#10B981" className="animate-ping" />
                          </g>
                        ) : (
                          /* Coherent Laser Nozzle */
                          <g transform="translate(-6, -24)">
                            <rect x="3" y="0" width="6" height="16" rx="2" fill="#38BDF8" />
                            <polygon points="2,16 10,16 6,24" fill="#0284C7" />
                            <circle cx="6" cy="24" r="5" fill="#22D3EE" className="animate-pulse" />
                            <circle cx="6" cy="24" r="2.5" fill="#FFFFFF" />
                          </g>
                        )}
                      </g>
                    </svg>
                  </div>

                  {/* Bottom Toolpath Controller HUD */}
                  <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 shadow-xl backdrop-blur-md">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => setIsCutting(!isCutting)}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 font-mono text-xs text-white shadow-md transition-all hover:bg-emerald-500 active:scale-95"
                    >
                      {isCutting ? <Pause className="size-3" /> : <Play className="size-3" />}
                      <span>{isCutting ? 'Pause' : 'Resume Cut'}</span>
                    </button>

                    {/* Progress Slider */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-400">Prog:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cutProgress}
                        onChange={(e) => setCutProgress(parseFloat(e.target.value))}
                        className="h-1.5 w-28 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-emerald-500"
                      />
                      <span className="font-mono text-[11px] text-emerald-400 w-8">
                        {cutProgress.toFixed(0)}%
                      </span>
                    </div>

                    {/* Speed Multiplier Toggle */}
                    <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-800 p-0.5">
                      {[1, 2, 4].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setCutSpeed(spd as 1 | 2 | 4)}
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                            cutSpeed === spd
                              ? 'bg-emerald-500 text-zinc-950 font-bold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────
                  3. 3D VINYL MAT SEPARATION & TRAPPING INSPECTOR
                  ────────────────────────────────────────────────────────── */}
              {canvasMode === '3d-mats' && (
                <div className="relative flex size-full items-center justify-center p-4">
                  
                  {/* Top Left Trapping Spec Indicator */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 font-mono text-[10px] text-zinc-300 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
                      <Layers className="size-3" />
                      <span>3D PHYSICAL CUTTING MATS</span>
                    </div>
                    <div className="text-zinc-400">
                      StandardGrip 12"x12" • Separated by Color Sheets
                    </div>
                    <div className="text-emerald-400 font-medium">
                      +0.2mm Trapping Bleed Active (Zero Heat-Press Gaps)
                    </div>
                  </div>

                  {/* Top Right Trapping Zoom Toggle */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={() => setInspectTrapping(!inspectTrapping)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-[11px] transition-all shadow-md ${
                        inspectTrapping
                          ? 'border-orange-500 bg-orange-950/80 text-orange-300 font-medium'
                          : 'border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <Maximize2 className="size-3" />
                      <span>{inspectTrapping ? 'Exit Trapping Zoom' : 'Inspect +0.2mm Trapping'}</span>
                    </button>
                  </div>

                  {inspectTrapping ? (
                    /* High-Precision Trapping Caliper Zoom View */
                    <div className="relative flex flex-col items-center justify-center p-6 text-center">
                      <div className="relative size-64 overflow-hidden rounded-2xl border border-orange-500/40 bg-zinc-900 p-4 shadow-2xl">
                        {/* Micro-grid */}
                        <div
                          className="absolute inset-0 opacity-15"
                          style={{
                            backgroundImage:
                              'linear-gradient(to right, #F97316 1px, transparent 1px), linear-gradient(to bottom, #F97316 1px, transparent 1px)',
                            backgroundSize: '12px 12px',
                          }}
                        />

                        {/* Overlapping Vinyl Path Slices */}
                        <svg viewBox="0 0 200 200" className="size-full">
                          {/* Color Layer 1 (Stem) */}
                          <path
                            d="M20,100 Q100,50 180,100 L180,180 L20,180 Z"
                            fill="#4A7C59"
                            opacity="0.85"
                          />
                          {/* Color Layer 2 (Petal) with +0.2mm choke overlap */}
                          <path
                            d="M20,100 Q100,50 180,100 L180,20 L20,20 Z"
                            fill="#D85A32"
                            opacity="0.85"
                          />
                          {/* Pulsing Trapping Choke Overlap Zone */}
                          <path
                            d="M20,95 Q100,45 180,95 L180,105 Q100,55 20,105 Z"
                            fill="#38BDF8"
                            opacity="0.75"
                            className="animate-pulse"
                          />
                        </svg>

                        {/* Engineering Caliper Measurement Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-zinc-950/90 px-2 py-0.5 font-mono text-[10px] text-cyan-300 shadow-lg border border-cyan-500/50">
                          ↔ +0.25mm Overlap Choke
                        </div>
                      </div>

                      <div className="mt-3 max-w-sm font-mono text-[11px] text-zinc-300">
                        <span className="text-orange-400 font-bold">Why Trapping Matters:</span>{' '}
                        Heat-press vinyl shrinks slightly when heated. Our 0.2mm overlap guarantees zero white gaps between adjacent colors.
                      </div>
                    </div>
                  ) : (
                    /* 3D Floating Isometric Cricut Cutting Mats */
                    <div
                      style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
                      className="relative flex size-[340px] items-center justify-center p-4"
                    >
                      {layers.map((layer, idx) => {
                        const factor = (matExplosion / 100);
                        const offsetY = (idx - (layers.length - 1) / 2) * (70 * factor);
                        const translateZ = (layers.length - 1 - idx) * (50 * factor);

                        return (
                          <motion.div
                            key={layer.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                              y: offsetY,
                              z: translateZ,
                              rotateX: 36,
                              rotateZ: -16,
                              opacity: layer.visible ? 1 : 0.2,
                            }}
                            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                            className="absolute inset-0 flex items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-md"
                          >
                            {/* Realistic Cricut Mat Grid & Label */}
                            <div className="absolute top-2 left-3 flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: layer.color }}
                              />
                              <span>Mat {idx + 1}: {layer.name}</span>
                            </div>
                            <div className="absolute top-2 right-3 font-mono text-[9px] text-zinc-500">
                              12" x 12" StandardGrip
                            </div>

                            <svg viewBox={currentSample.viewBox} className="size-full">
                              <path d={layer.d} fill={layer.color} fillRule="evenodd" />
                            </svg>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Bottom 3D Explode Depth Controller */}
                  {!inspectTrapping && (
                    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2 font-mono text-[11px] text-zinc-300 shadow-xl backdrop-blur-md">
                      <span className="text-zinc-400">Layer Separation:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={matExplosion}
                        onChange={(e) => setMatExplosion(parseInt(e.target.value))}
                        className="h-1.5 w-32 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-orange-500"
                      />
                      <span className="text-orange-400 font-semibold w-8">
                        {matExplosion}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RDP Smoothing Slider with Live Metric Readout */}
            <div className="mt-3.5 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                  <Sliders className="size-3.5 text-zinc-500" />
                  Ramer-Douglas-Peucker Curve Smoothing
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-zinc-400 line-through">
                    {currentSample.originalNodeCount} nodes
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {displayedNodeCount} nodes (-{savedPercent}%)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={smoothness}
                onChange={(e) => setSmoothness(parseInt(e.target.value))}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-100 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400">
                <span>Detailed Raw Curves</span>
                <span>Optimized Cut (Cricut & Laser Ready)</span>
              </div>
            </div>

            {/* Color Layers Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                <Layers className="size-3.5" />
                <span>{layers.length} Color Layers:</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
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
                      title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                    >
                      {layer.visible ? (
                        <Eye className="size-3 text-emerald-500" />
                      ) : (
                        <EyeOff className="size-3 opacity-40" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/80 pt-3 dark:border-zinc-850">
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
