'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { Loader2 } from 'lucide-react';

export default function PalmAnalysisTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const authedFetch = useAuthedFetch();

  useEffect(() => {
    const fetchPalmData = async () => {
      try {
        const res = await authedFetch('/api/admin/palm-analytics');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch Palm analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPalmData();
  }, [authedFetch]);

  const handleExportVisual = () => {
    if (!dashboardRef.current) return;
    const fullPageContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><title>VLM Telemetry BI Report</title><script src="https://cdn.tailwindcss.com"></script><style>body { background-color: #050314; color: #f3e8ff; font-family: ui-sans-serif, system-ui; padding: 24px; } svg { width: 100%; height: 100%; }</style></head>
      <body><div style="max-width: 1200px; margin: 0 auto;"><h1 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Mystica VLM Telemetry BI - Export</h1>${dashboardRef.current.outerHTML}</div></body>
      </html>
    `;
    const blob = new Blob([fullPageContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `VLM_Telemetry_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;

  const kpis = data?.kpis || { totalScans: '0', avgTokens: '0', avgLatency: '0s', failedScans: '0' };
  const latencyTrend = data?.latencyTrend || Array(30).fill(0);
  const resolutionMetrics = data?.resolutionMetrics || { p1080: 0, p720: 0, p480: 0 };
  const resolutionTrend = data?.resolutionTrend || Array(30).fill(0);
  const errors = data?.errors || [];
  const composition = data?.composition || [];

  // 🚀 Dynamic Error Donut Math (Shows dark neutral if 0 fails)
  let conicStr = 'conic-gradient(#1e1b4b 0% 100%)'; 
  if (errors.length > 0) {
    let cumulative = 0;
    const stops = errors.map((err: any) => {
      const start = cumulative;
      cumulative += err.pct;
      return `${err.color} ${start}% ${cumulative}%`;
    });
    conicStr = `conic-gradient(${stops.join(', ')})`;
  }

  // 🚀 Dynamic Latency Max Value for SVG Mapping
  const maxLat = Math.max(...latencyTrend, 2.5); // Ensure threshold is visible
  const targetThresholdY = 50 - (2.0 / maxLat) * 45;

  return (
    <div ref={dashboardRef} className="flex flex-col h-full space-y-4 bg-[#050314] p-1">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-purple-900/40 shrink-0">
        <div><h2 className="text-lg font-bold text-purple-50 tracking-tight">VLM Telemetry BI</h2></div>
        <div className="flex gap-2">
          <span className="text-[10px] font-mono bg-[#0a061e] text-emerald-400 px-2 py-1 rounded border border-emerald-900/50 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live DB Sync</span>
          <span className="text-[10px] font-mono bg-[#0a061e] text-purple-300 px-2 py-1 rounded border border-purple-900/50">GLM-4V</span>
          <button onClick={handleExportVisual} className="text-[10px] bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-600 transition">Export Report</button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'TOTAL SCANS (30D)', value: kpis.totalScans, sub: 'Live DB', color: 'text-emerald-400' },
          { label: 'AVG TOKENS', value: kpis.avgTokens, sub: 'GLM-4V Output', color: 'text-emerald-400' },
          { label: 'AVG LATENCY', value: kpis.avgLatency, sub: 'Total DB Avg', color: 'text-emerald-400' },
          { label: 'FAILED SCANS', value: kpis.failedScans, sub: 'Activity Log', color: 'text-rose-400' }
        ].map((kpi, i) => (
          <div key={i} className="bg-[#0a061e] p-3 rounded-lg border border-purple-900/40 shadow-sm flex flex-col justify-center h-20">
            <span className="text-[10px] font-bold text-purple-300/60 uppercase">{kpi.label}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-purple-50">{kpi.value}</span>
              <span className={`text-[10px] font-semibold ${kpi.color}`}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {/* TOP ROW: Real Latency & Errors Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0 min-h-[300px]">
          {/* Latency Area Chart */}
          <div className="lg:col-span-3 bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col relative h-full">
            <div className="flex justify-between items-center mb-4 z-10 shrink-0">
               <h3 className="text-xs font-bold text-purple-50">VLM Processing Latency (30D)</h3>
               <span className="text-[10px] text-fuchsia-400 font-bold bg-fuchsia-900/20 px-2 py-0.5 rounded border border-fuchsia-500/30">Target: &lt; 2.0s</span>
            </div>
            
            <div className="absolute top-[28%] left-5 z-10 text-[10px] font-mono text-fuchsia-500/80 tracking-widest uppercase">2.0s Threshold</div>

            <div className="flex-1 relative w-full mt-2">
              <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                 <line x1="0" y1={targetThresholdY} x2="100" y2={targetThresholdY} stroke="#d946ef" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.7"/>
                 
                 <polyline 
                   points={latencyTrend.map((val: number, i: number) => `${(i / (latencyTrend.length - 1)) * 100},${val > 0 ? 50 - (val / maxLat) * 45 : 50}`).join(' ')} 
                   fill="none" stroke="#6366f1" strokeWidth="3" vectorEffect="non-scaling-stroke"
                 />
                 <polygon 
                   points={`0,50 ${latencyTrend.map((val: number, i: number) => `${(i / (latencyTrend.length - 1)) * 100},${val > 0 ? 50 - (val / maxLat) * 45 : 50}`).join(' ')} 100,50`} 
                   fill="rgba(99, 102, 241, 0.15)" 
                 />
              </svg>
            </div>
          </div>

          {/* Dynamic Error Donut */}
          <div className="lg:col-span-1 bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full">
            <div className="w-full flex justify-between items-center shrink-0 mb-4">
              <h3 className="text-xs font-bold text-purple-50">Errors</h3>
              <span className={`text-[10px] font-bold ${Number(kpis.failedScans) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{kpis.failedScans} Fails</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 gap-6 py-4">
              <div className="relative w-36 h-36 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0" style={{ background: conicStr }}>
                <div className="absolute inset-0 m-auto w-24 h-24 bg-[#0a061e] rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-3xl font-bold text-white">{kpis.failedScans}</span>
                </div>
              </div>

              <div className="w-full flex flex-wrap justify-around text-[10px] px-2 gap-2">
                {errors.length > 0 ? errors.map((e: any, i: number) => (
                   <div key={i} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: e.color }} /> <span className="text-purple-200">{e.label}</span></div>
                )) : (
                   <span className="text-emerald-400/50 italic">System Optimal</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Real Resolution & Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          {/* Upload Resolution Qualities */}
          <div className="bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full min-h-[260px]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xs font-bold text-purple-50">Upload Resolution Qualities</h3>
            </div>
            
            <div className="flex-1 flex flex-col gap-5 py-2">
              <div>
                <div className="flex justify-between text-[11px] mb-1.5"><span className="text-purple-200">1080p+ (Optimal)</span><span className="text-emerald-400">{resolutionMetrics.p1080}%</span></div>
                <div className="w-full bg-[#050314] h-4 rounded"><div className="bg-emerald-500 h-full rounded" style={{ width: `${resolutionMetrics.p1080}%`}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1.5"><span className="text-purple-200">720p (Acceptable)</span><span className="text-amber-400">{resolutionMetrics.p720}%</span></div>
                <div className="w-full bg-[#050314] h-4 rounded"><div className="bg-amber-500 h-full rounded" style={{ width: `${resolutionMetrics.p720}%`}} /></div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1.5"><span className="text-purple-200">&lt;480p (Failed)</span><span className="text-rose-400">{resolutionMetrics.p480}%</span></div>
                <div className="w-full bg-[#050314] h-4 rounded"><div className="bg-rose-500 h-full rounded" style={{ width: `${resolutionMetrics.p480}%`}} /></div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-900/30 shrink-0">
               <h3 className="text-[10px] font-bold text-purple-300/60 mb-3 uppercase tracking-wider">1080p+ Volume Trend</h3>
               <div className="flex items-end gap-1 h-24">
                {resolutionTrend.map((h: number, i: number) => {
                  const maxV = Math.max(...resolutionTrend, 1);
                  return (
                    <div key={i} className="w-full bg-emerald-600/70 hover:bg-emerald-400 transition-all rounded-t-sm" style={{ height: `${Math.max((h / maxV) * 100, h > 0 ? 15 : 2)}%` }} title={`Day ${i+1}: ${h} HD scans`} />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Guidance Intent Composition */}
          <div className="lg:col-span-2 bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full min-h-[260px]">
             <div className="flex justify-between items-center mb-5 shrink-0">
               <h3 className="text-xs font-bold text-purple-50">Guidance Intent Composition</h3>
               <span className="text-[10px] text-amber-400 font-bold bg-amber-900/20 px-3 py-1 rounded border border-amber-500/30">Live DB Aggregation</span>
             </div>
             
             <div className="w-full h-2.5 flex rounded-full overflow-hidden mb-6 shrink-0 shadow-inner border border-purple-900/30">
                {composition.map((item: any, i: number) => (
                  <div key={i} className={`${item.color} h-full`} style={{ width: `${item.pct}%` }} />
                ))}
             </div>

             <div className="grid grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-3 flex-1 mt-2">
              {composition.map((item: any, i: number) => (
                <div key={i} className="bg-[#050314] border border-purple-900/20 p-3 rounded-lg flex flex-col justify-between hover:border-purple-500/30 transition-colors h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-sm ${item.color} shrink-0`} />
                    <span className="text-[10px] font-semibold text-purple-200 truncate">{item.label}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-white leading-none">{item.pct}%</span>
                    <span className="text-[9px] font-bold text-purple-400/50">{item.trend}</span>
                  </div>
                </div>
              ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}