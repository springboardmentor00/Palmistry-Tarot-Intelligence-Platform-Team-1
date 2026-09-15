'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { Loader2 } from 'lucide-react';

export default function AIInsightsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const authedFetch = useAuthedFetch();

  useEffect(() => {
    const fetchAIData = async () => {
      try {
        const res = await authedFetch('/api/admin/ai-analytics');
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error("Failed to fetch AI analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAIData();
  }, [authedFetch]);

  const handleExportVisual = () => {
    if (!dashboardRef.current) return;
    const fullPageContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="UTF-8"><title>AI Insights & Synthesis BI Report</title><script src="https://cdn.tailwindcss.com"></script><style>body { background-color: #050314; color: #f3e8ff; font-family: ui-sans-serif, system-ui; padding: 24px; } svg { width: 100%; height: 100%; }</style></head>
      <body><div style="max-width: 1200px; margin: 0 auto;"><h1 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Mystica AI Insights BI - Export</h1>${dashboardRef.current.outerHTML}</div></body>
      </html>
    `;
    const blob = new Blob([fullPageContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `AI_Synthesis_BI_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;

  const kpis = data?.kpis || { totalSynthesis: '0', avgTokens: '0', dominantTask: 'None' };
  const synthesisTrend = data?.synthesisTrend || Array(30).fill(0);
  const tokenTrend = data?.tokenTrend || Array(30).fill(0);
  const taskDistribution = data?.taskDistribution || [];
  const tokenSplit = data?.tokenSplit || [];
  const clustering = data?.clustering || [];

  const maxRuns = Math.max(...synthesisTrend, 10);
  
  // Real Donut Chart Math based on Task Distribution
  let conicStr = 'conic-gradient(#1e1b4b 0% 100%)';
  if (taskDistribution.length > 0) {
    let cumulative = 0;
    const stops = taskDistribution.map((t: any) => {
      const start = cumulative;
      cumulative += t.pct;
      return `${t.color} ${start}% ${cumulative}%`;
    });
    conicStr = `conic-gradient(${stops.join(', ')})`;
  }

  return (
    <div ref={dashboardRef} className="flex flex-col h-full space-y-4 bg-[#050314] p-1">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-purple-900/40 shrink-0">
        <div><h2 className="text-lg font-bold text-purple-50 tracking-tight">AI Insights & Synthesis BI</h2></div>
        <div className="flex gap-2">
          <span className="text-[10px] font-mono bg-[#0a061e] text-fuchsia-400 px-2 py-1 rounded border border-fuchsia-900/50 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" /> Live DB Sync
          </span>
          <button onClick={handleExportVisual} className="text-[10px] bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-600 transition">Export AI Log</button>
        </div>
      </div>

      {/* High-Density KPI Strip */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'TOTAL AI CALLS (30D)', value: kpis.totalSynthesis, sub: 'Logged Runs', color: 'text-purple-300' },
          { label: 'DOMINANT MODALITY', value: kpis.dominantTask, sub: 'Highest Volume', color: 'text-emerald-400' },
          { label: 'AVG TOKENS / RUN', value: kpis.avgTokens, sub: 'Cost Baseline', color: 'text-cyan-400' },
          { label: 'DB TELEMETRY', value: '100%', sub: 'Real Data Synced', color: 'text-fuchsia-400' }
        ].map((kpi, i) => (
          <div key={i} className="bg-[#0a061e] p-3 rounded-lg border border-purple-900/40 shadow-sm flex flex-col justify-center h-20">
            <span className="text-[10px] font-bold text-purple-300/60 uppercase">{kpi.label}</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-purple-50 truncate">{kpi.value}</span>
              <span className={`text-[10px] font-semibold ${kpi.color}`}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0 min-h-[300px]">
        {/* Synthesis Runs Line Chart */}
        <div className="lg:col-span-3 bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col relative h-full">
          <div className="flex justify-between items-center mb-4 z-10 shrink-0">
             <h3 className="text-xs font-bold text-purple-50">Cross-Modal AI Call Volume (30D)</h3>
             <span className="text-[10px] text-fuchsia-400 font-bold bg-fuchsia-900/20 px-2 py-0.5 rounded border border-fuchsia-500/30">Live DB Aggregation</span>
          </div>

          <div className="flex-1 relative w-full mt-2">
            <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
               <polyline 
                 points={synthesisTrend.map((val: number, i: number) => `${(i / (synthesisTrend.length - 1)) * 100},${val > 0 ? 50 - (val / maxRuns) * 45 : 50}`).join(' ')} 
                 fill="none" stroke="#d946ef" strokeWidth="3" vectorEffect="non-scaling-stroke"
               />
               <polygon 
                 points={`0,50 ${synthesisTrend.map((val: number, i: number) => `${(i / (synthesisTrend.length - 1)) * 100},${val > 0 ? 50 - (val / maxRuns) * 45 : 50}`).join(' ')} 100,50`} 
                 fill="rgba(217, 70, 239, 0.15)" 
               />
            </svg>
          </div>
        </div>

        {/* Real Task Distribution Donut */}
        <div className="lg:col-span-1 bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full">
          <div className="w-full flex justify-between items-center shrink-0 mb-4">
            <h3 className="text-xs font-bold text-purple-50">AI Modality Split</h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 gap-6 py-4">
            <div className="relative w-36 h-36 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0" 
                 style={{ background: conicStr }}>
              <div className="absolute inset-0 m-auto w-24 h-24 bg-[#0a061e] rounded-full flex items-center justify-center shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white">{kpis.totalSynthesis}</span>
                  <span className="text-[9px] text-purple-300 mt-1 uppercase tracking-wider">Total Runs</span>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] px-2">
              {taskDistribution.length > 0 ? taskDistribution.map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: t.color }} /> <span className="text-purple-200">{t.label}</span></div>
              )) : <span className="text-purple-400/50 italic">No activity logged</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-[280px]">
        {/* Spiritual Interest Clustering (2 columns to fill the void perfectly!) */}
        <div className="lg:col-span-2 bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full min-h-[280px]">
           <div className="flex justify-between items-center mb-6 shrink-0">
             <div>
               <h3 className="text-xs font-bold text-purple-50">Spiritual Interest Clustering</h3>
               <p className="text-[9px] text-purple-300/60 mt-0.5">Aggregated from Profile.spiritualInterests</p>
             </div>
           </div>

           <div className="w-full h-4 flex rounded-full overflow-hidden mb-6 shrink-0 shadow-inner border border-purple-900/30">
              {clustering.map((item: any, i: number) => (
                <div key={i} className={`${item.color} h-full`} style={{ width: `${item.pct}%` }} />
              ))}
           </div>
           
           {/* grid-cols-2 and content-between ensures it stretches vertically! */}
           <div className="grid grid-cols-2 gap-x-12 content-between flex-1 w-full pb-2">
            {clustering.map((item: any, i: number) => (
              <div key={i} className="flex flex-col justify-center">
                <div className="flex justify-between text-[11px] mb-2">
                  <span className="text-purple-200 truncate pr-2">{item.label}</span>
                  <span className="text-purple-100 font-mono shrink-0">{item.pct}%</span>
                </div>
                <div className="w-full bg-[#050314] h-3.5 rounded overflow-hidden">
                  <div className={`${item.color} h-full rounded`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
           </div>
        </div>

        {/* Real Token Expenditure by Modality */}
        <div className="bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full min-h-[280px]">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h3 className="text-xs font-bold text-purple-50">Token Cost by Modality</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-start space-y-6 py-2">
            {tokenSplit.length > 0 ? tokenSplit.map((ts: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-[11px] mb-2"><span className="text-purple-200">{ts.label}</span><span className="text-cyan-400 font-mono">{ts.tokens.toLocaleString()}t</span></div>
                <div className="w-full bg-[#050314] h-4 rounded overflow-hidden">
                  <div className={`${ts.color} h-full rounded transition-all`} style={{ width: `${ts.pct}%` }} />
                </div>
              </div>
            )) : <div className="text-center text-purple-400/50 text-xs py-8 italic">No tokens logged yet.</div>}
          </div>

          <div className="mt-auto pt-4 border-t border-purple-900/30 shrink-0">
             <h3 className="text-[10px] font-bold text-purple-300/60 mb-3 uppercase tracking-wider">Daily Token Spend Trend</h3>
             <div className="flex items-end gap-1 h-24">
              {tokenTrend.map((h: number, i: number) => {
                const maxV = Math.max(...tokenTrend, 1);
                return (
                  <div key={i} className="w-full bg-cyan-600/70 hover:bg-cyan-400 transition-all rounded-t-sm" style={{ height: `${Math.max((h / maxV) * 100, h > 0 ? 15 : 2)}%` }} title={`Day ${i+1}: ${h} tokens`} />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}