'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Cpu,
  Zap,
  ArrowRight,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

export function VectorShowcase() {
  const [activeTab, setActiveTab] = useState<'node-meltdown' | 'layer-explosion' | 'laser-trace'>('node-meltdown');
  const [isClean, setIsClean] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100 for before/after sweep
  const [laserProgress, setLaserProgress] = useState(0);

  // Auto-cycle laser trace simulation
  useEffect(() => {
    if (activeTab !== 'laser-trace') return;
    const interval = setInterval(() => {
      setLaserProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 40);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
      {/* Section Header */}
      <div className="mb-8 text-center md:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
          <Sparkles className="size-3 text-emerald-500" />
          <span>Proof of Work • Real Engineering Demonstration</span>
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-100">
          See the Difference: True Vectors vs. Auto-Trace Slop
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
          Why traditional auto-tracers ruin cutting blades and freeze software—and how our geometric cleaning pipeline guarantees 100% cut-ready files.
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            {
              id: 'node-meltdown',
              title: '1. Node Meltdown Comparison',
              desc: '5,000 Chaos Points vs. 48 Clean Anchors',
              icon: Sliders,
            },
            {
              id: 'layer-explosion',
              title: '2. Multi-Mat Vinyl Separation',
              desc: '3D Layer Decomposition for Cricut',
              icon: Layers,
            },
            {
              id: 'laser-trace',
              title: '3. Toolpath Physical Tracing',
              desc: 'Continuous Z-Closed Laser Simulation',
              icon: Scissors,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-850'
              }`}
            >
              <tab.icon className="size-3.5" />
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 md:p-8">
        
        {/* TAB 1: NODE MELTDOWN COMPARISON */}
        {activeTab === 'node-meltdown' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-4 dark:border-zinc-850">
              <div>
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Interactive Node Comparison Sweep
                </h3>
                <p className="text-xs text-zinc-500">
                  Drag the slider or toggle to inspect how messy anti-aliased nodes melt into mathematically minimal Bézier curves.
                </p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center rounded-lg border border-zinc-200 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  onClick={() => setIsClean(false)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    !isClean
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                  }`}
                >
                  Traditional Auto-Trace (Messy)
                </button>
                <button
                  onClick={() => setIsClean(true)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    isClean
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                  }`}
                >
                  Our Clean AI Engine (Optimized)
                </button>
              </div>
            </div>

            {/* Visual Canvas Stage */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              
              {/* Left Display: The Visual Render with Simulated Nodes */}
              <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 shadow-inner dark:border-zinc-800 dark:bg-zinc-900/40 lg:col-span-8">
                {/* Engineering Grid Background */}
                <div
                  className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />

                {/* Status Watermark */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white/90 px-3 py-1.5 font-mono text-xs shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
                  {isClean ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        48 Bézier Anchors (Optimal)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="size-3.5 text-red-500" />
                      <span className="font-semibold text-red-500">
                        3,480 Chaotic Anchors (Node Soup)
                      </span>
                    </>
                  )}
                </div>

                {/* SVG Render with Simulated Vector Paths & Nodes */}
                <div className="relative flex size-[320px] items-center justify-center p-4">
                  <svg viewBox="0 0 400 300" className="size-full drop-shadow-md">
                    {/* The Bear Path */}
                    <path
                      d="M60,240 L90,240 L110,190 L150,210 L180,240 L210,240 L230,170 L260,170 L280,240 L320,240 L340,190 L370,200 L390,240 L440,240 C445,210 450,170 430,130 C410,90 370,70 330,65 C290,60 250,70 220,85 C180,75 130,85 100,115 C70,145 55,190 60,240 Z M160,120 L200,160 L230,130 L270,170 L300,110 L340,160 L320,175 L270,120 L230,160 L200,130 L160,170 Z"
                      fill="#1E1E24"
                      fillRule="evenodd"
                      stroke={isClean ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.6)'}
                      strokeWidth={isClean ? '1' : '2'}
                    />

                    {/* Nodes Layer: Animated Transition */}
                    <AnimatePresence mode="wait">
                      {isClean ? (
                        // Clean Diamonds (Only 14 displayed in sample)
                        <motion.g
                          key="clean-nodes"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {[
                            [60, 240], [110, 190], [150, 210], [180, 240],
                            [230, 170], [280, 240], [340, 190], [390, 240],
                            [430, 130], [330, 65], [220, 85], [100, 115],
                            [200, 160], [270, 170],
                          ].map(([x, y], idx) => (
                            <rect
                              key={idx}
                              x={x - 3}
                              y={y - 3}
                              width="6"
                              height="6"
                              fill="#10B981"
                              stroke="#FFFFFF"
                              strokeWidth="1.2"
                              transform={`rotate(45 ${x} ${y})`}
                            />
                          ))}
                        </motion.g>
                      ) : (
                        // Node Soup: Hundreds of messy red jitter dots
                        <motion.g
                          key="messy-nodes"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {Array.from({ length: 180 }).map((_, idx) => {
                            // Jitter points along perimeter
                            const angle = (idx / 180) * Math.PI * 2;
                            const rx = 240 + Math.cos(angle) * (140 + (idx % 7) * 3);
                            const ry = 160 + Math.sin(angle) * (90 + (idx % 5) * 4);
                            return (
                              <circle
                                key={idx}
                                cx={rx}
                                cy={ry}
                                r="2.2"
                                fill="#EF4444"
                                stroke="#FFFFFF"
                                strokeWidth="0.5"
                                className="opacity-90"
                              />
                            );
                          })}
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </svg>
                </div>

                {/* Bottom Overlay Pill */}
                <div className="absolute bottom-4 z-10 flex items-center gap-3">
                  <button
                    onClick={() => setIsClean(!isClean)}
                    className="flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-4 py-1.5 font-mono text-xs text-white shadow-md backdrop-blur-md transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
                  >
                    <RotateCcw className="size-3" />
                    <span>Click to Toggle State ({isClean ? 'Switch to Messy' : 'Switch to Clean'})</span>
                  </button>
                </div>
              </div>

              {/* Right Panel: Technical Breakdown Comparison */}
              <div className="flex flex-col justify-between space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50 lg:col-span-4">
                <div>
                  <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                    Benchmark Metrics
                  </span>
                  <h4 className="mt-1 font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    Why Node Economy Matters
                  </h4>

                  <div className="mt-4 space-y-3 font-mono text-xs">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="text-zinc-500">Anchor Points (Path Nodes)</div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-red-500 line-through">3,480 nodes</span>
                        <span className="font-semibold text-emerald-500 text-sm">48 nodes (-98.6%)</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="text-zinc-500">Cricut Cut-Time Estimate</div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-red-500 line-through">4m 12s (shaky)</span>
                        <span className="font-semibold text-emerald-500 text-sm">22s (smooth)</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="text-zinc-500">File Payload / Code Weight</div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <span className="text-red-500 line-through">2.4 MB (bloated)</span>
                        <span className="font-semibold text-emerald-500 text-sm">3.8 KB (clean)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="size-4" />
                    <span>Guaranteed 100% Machine Safe</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Zero self-intersecting loops. Blades and laser heads follow a smooth continuous motion without burning or tearing delicate vinyl.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: 3D LAYER EXPLOSION */}
        {activeTab === 'layer-explosion' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-4 dark:border-zinc-850">
              <div>
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Multi-Mat Color Separation & Trapping
                </h3>
                <p className="text-xs text-zinc-500">
                  In vinyl and heat-transfer crafts, each color is cut on a separate physical sheet. We automatically group by color and add 0.2mm trapping.
                </p>
              </div>

              <button
                onClick={() => setIsExploded(!isExploded)}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-950 px-4 py-2 font-mono text-xs text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
              >
                <Layers className="size-3.5" />
                <span>{isExploded ? 'Reassemble Design' : 'Explode 3D Layers'}</span>
              </button>
            </div>

            {/* Isometric 3D Visualizer */}
            <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/60 p-8 shadow-inner dark:border-zinc-800 dark:bg-zinc-900/40">
              {/* Cutting Grid */}
              <div
                className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* 3D Mats Container */}
              <div
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
                className="relative flex size-[320px] items-center justify-center"
              >
                {/* MAT 1: Sage Green Stems (Bottom) */}
                <motion.div
                  animate={{
                    y: isExploded ? -70 : 0,
                    x: isExploded ? -30 : 0,
                    rotateX: isExploded ? 35 : 0,
                    rotateZ: isExploded ? -15 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl border border-emerald-500/40 bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:bg-zinc-900/90"
                >
                  <div className="absolute top-2 left-3 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                    Mat 1 • Sage Green Vinyl
                  </div>
                  <svg viewBox="0 0 500 500" className="size-full">
                    <path
                      d="M250,450 C240,360 210,280 180,220 C160,180 140,160 110,140 C140,150 170,190 190,230 C200,200 190,160 170,110 C200,140 220,180 230,220 C245,170 240,120 235,70 C245,120 255,170 260,220 C280,180 300,140 330,110 C310,160 300,200 310,230 C330,190 360,150 390,140 C360,160 340,180 320,220 C290,280 260,360 250,450 Z"
                      fill="#4A7C59"
                    />
                  </svg>
                </motion.div>

                {/* MAT 2: Terracotta Marigold Petals (Middle) */}
                <motion.div
                  animate={{
                    y: isExploded ? 0 : 0,
                    x: isExploded ? 0 : 0,
                    rotateX: isExploded ? 35 : 0,
                    rotateZ: isExploded ? -15 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl border border-orange-500/40 bg-white/70 p-4 shadow-lg backdrop-blur-sm dark:bg-zinc-900/80"
                >
                  <div className="absolute top-2 left-3 font-mono text-[10px] text-orange-600 dark:text-orange-400">
                    Mat 2 • Terracotta Petals (+0.2mm Trapping)
                  </div>
                  <svg viewBox="0 0 500 500" className="size-full">
                    <path
                      d="M170,110 C155,95 130,95 115,110 C100,125 100,150 115,165 C130,180 155,180 170,165 C185,150 185,125 170,110 Z M330,110 C315,95 290,95 275,110 C260,125 260,150 275,165 C290,180 315,180 330,165 C345,150 345,125 330,110 Z"
                      fill="#D85A32"
                    />
                  </svg>
                </motion.div>

                {/* MAT 3: Mustard Gold Center (Top) */}
                <motion.div
                  animate={{
                    y: isExploded ? 70 : 0,
                    x: isExploded ? 30 : 0,
                    rotateX: isExploded ? 35 : 0,
                    rotateZ: isExploded ? -15 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="absolute inset-0 flex items-center justify-center rounded-2xl border border-amber-500/40 bg-white/60 p-4 shadow-xl backdrop-blur-sm dark:bg-zinc-900/70"
                >
                  <div className="absolute top-2 left-3 font-mono text-[10px] text-amber-600 dark:text-amber-400">
                    Mat 3 • Mustard Gold Accent
                  </div>
                  <svg viewBox="0 0 500 500" className="size-full">
                    <path
                      d="M235,70 C225,55 205,55 195,70 C185,85 185,105 195,120 C205,135 225,135 235,120 C245,105 245,85 235,70 Z M142,137 C137,132 128,132 123,137 C118,142 118,151 123,156 C128,161 137,161 142,156 C147,151 147,142 142,137 Z M302,137 C297,132 288,132 283,137 C278,142 278,151 283,156 C288,161 297,161 302,156 C307,151 307,142 302,137 Z"
                      fill="#F4A261"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Exploded Label Badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-zinc-200 bg-white/90 px-4 py-1.5 font-mono text-xs shadow-md backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
                <span className="text-zinc-500">Status: </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {isExploded ? '3 Separate Cut Sheets (Ready for Vinyl Cutting)' : 'Assembled Product View'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TOOLPATH PHYSICAL TRACING */}
        {activeTab === 'laser-trace' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 pb-4 dark:border-zinc-850">
              <div>
                <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  Physical Toolpath Tracing Simulation
                </h3>
                <p className="text-xs text-zinc-500">
                  Watch how laser heads & drag-knives execute continuous vector toolpaths without jitter or micro-stutters.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-zinc-500">Trajectory: Continuous Z-Closed Path</span>
              </div>
            </div>

            {/* Tracing Stage */}
            <div className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950 p-6 shadow-2xl dark:border-zinc-800">
              {/* Millimeter Laser Bed Grid */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Animated Path Tracing */}
              <div className="relative flex size-[300px] items-center justify-center">
                <svg viewBox="0 0 500 500" className="size-full">
                  {/* Static background outline */}
                  <path
                    d="M250,450 C240,360 210,280 180,220 C160,180 140,160 110,140 C140,150 170,190 190,230 C200,200 190,160 170,110 C200,140 220,180 230,220 C245,170 240,120 235,70 C245,120 255,170 260,220 C280,180 300,140 330,110 C310,160 300,200 310,230 C330,190 360,150 390,140 C360,160 340,180 320,220 C290,280 260,360 250,450 Z"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="3"
                  />
                  {/* Glowing Laser Cut Path with strokeDashoffset */}
                  <path
                    d="M250,450 C240,360 210,280 180,220 C160,180 140,160 110,140 C140,150 170,190 190,230 C200,200 190,160 170,110 C200,140 220,180 230,220 C245,170 240,120 235,70 C245,120 255,170 260,220 C280,180 300,140 330,110 C310,160 300,200 310,230 C330,190 360,150 390,140 C360,160 340,180 320,220 C290,280 260,360 250,450 Z"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeDasharray="2000"
                    strokeDashoffset={2000 - (laserProgress / 100) * 2000}
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  />
                </svg>

                {/* Simulated G-Code readout */}
                <div className="absolute bottom-3 left-3 font-mono text-[11px] text-emerald-400">
                  G01 X{(250 + Math.sin(laserProgress) * 80).toFixed(2)} Y{(220 + Math.cos(laserProgress) * 60).toFixed(2)} F1200
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
