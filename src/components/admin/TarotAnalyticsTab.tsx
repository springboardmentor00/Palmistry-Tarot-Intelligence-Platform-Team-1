'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { Loader2 } from 'lucide-react';

export default function TarotAnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const authedFetch = useAuthedFetch();

  useEffect(() => {
    const fetchTarotData = async () => {
      try {
        const res = await authedFetch('/api/admin/tarot-analytics');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch Tarot analytics data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTarotData();
  }, [authedFetch]);

  // 🚀 Instant Visual HTML Snapshot Export (Zero CSS disruption)
  const handleExportVisual = () => {
    if (!dashboardRef.current) return;
    
    const dashboardHTML = dashboardRef.current.outerHTML;
    const fullPageContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Mystica Tarot Synthesis BI Report</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { background-color: #050314; color: #f3e8ff; font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; }
          svg { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div style="max-width: 1200px; margin: 0 auto;">
          <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 16px;">Mystica Tarot Synthesis BI - Export Report</h1>
          ${dashboardHTML}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([fullPageContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mystica_Tarot_BI_Report_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const kpis = data?.kpis || { totalSpreads: '0', dominantSpread: 'None', synthesisDepth: 'Standard', upsellConversion: '0%' };
  const matrix = data?.matrix || [];
  const conversionTrend = data?.conversionTrend || Array(30).fill(0);
  const spreadTrends = data?.spreadTrends || {};

  let cumulative = 0;
  const donutStops = matrix.map((m: any, idx: number) => {
    const val = parseFloat(m.pct) || 0;
    const start = cumulative;
    cumulative += val;
    const colors = ['#fbbf24', '#6366f1', '#d946ef', '#a855f7', '#f43f5e', '#10b981'];
    return `${colors[idx % colors.length]} ${start}% ${cumulative}%`;
  });
  const dynamicConicGradient = matrix.length > 0 ? `conic-gradient(${donutStops.join(', ')})` : 'conic-gradient(#3b0764 0% 100%)';

  const getPoints = (arr: number[]) => {
    if (!arr || arr.length === 0) return "0,25 100,25";
    const maxVal = Math.max(...arr, 5);
    return arr.map((val: number, i: number) => {
      const x = (i / (arr.length - 1)) * 100;
      const y = 45 - (val / maxVal) * 35;
      return `${x},${isNaN(y) ? 25 : y}`;
    }).join(' ');
  };

  const lineColors = ['#fbbf24', '#6366f1', '#d946ef', '#a855f7', '#f43f5e', '#10b981'];

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-purple-900/40 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-purple-50 tracking-tight">Tarot Synthesis BI</h2>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-mono bg-[#0a061e] text-emerald-400 px-2 py-1 rounded border border-emerald-900/50 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live DB Sync
          </span>
          <button 
            onClick={handleExportVisual} 
            className="text-[10px] bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-600 transition cursor-pointer"
          >
            Export Visual Report
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout Ref */}
      <div ref={dashboardRef} className="flex flex-col h-full space-y-4">

        {/* High-Density KPI Strip */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          {[
            { label: 'TOTAL SPREADS (30D)', value: kpis.totalSpreads, sub: 'Live DB', color: 'text-emerald-400' },
            { label: 'DOMINANT SPREAD', value: kpis.dominantSpread, sub: 'Top Volume', color: 'text-purple-300' },
            { label: 'SYNTHESIS DEPTH', value: kpis.synthesisDepth, sub: 'Most Used', color: 'text-fuchsia-400' },
            { label: 'UPSELL CONVERSION', value: kpis.upsellConversion, sub: 'Consult Link Rate', color: 'text-emerald-400' }
          ].map((kpi, i) => (
            <div key={i} className="bg-[#0a061e] p-3 rounded-lg border border-purple-900/40 shadow-sm flex flex-col justify-between h-20">
              <span className="text-[10px] font-bold text-purple-300/60 uppercase">{kpi.label}</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold text-purple-50">{kpi.value}</span>
                <span className={`text-[10px] font-semibold ${kpi.color}`}>{kpi.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Row 1: Zoomed and Heighted Middle Layer (Boxes 1, 2, 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0 min-h-[310px]">
          
          {/* Col 1: Dense Matrix Table */}
          <div className="bg-[#0a061e] rounded-lg border border-purple-900/40 shadow-sm flex flex-col overflow-hidden justify-between">
            <div className="p-3 border-b border-purple-900/40 bg-[#050314]">
              <h3 className="text-xs font-bold text-purple-50">Spread Volume Matrix</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-[#050314] text-purple-300/60">
                  <tr>
                    <th className="p-3 pl-4 font-semibold uppercase tracking-wider">Spread Type</th>
                    <th className="p-3 text-right font-semibold uppercase tracking-wider">Volume</th>
                    <th className="p-3 text-right pr-4 font-semibold uppercase tracking-wider">% Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20 text-purple-200">
                  {matrix.length > 0 ? matrix.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-purple-900/10 transition-colors">
                      <td className="p-3 pl-4 font-semibold text-purple-100">{row.name}</td>
                      <td className="p-3 text-right font-mono text-purple-200">{row.vol}</td>
                      <td className={`p-3 text-right font-bold pr-4 ${row.color}`}>{row.pct}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-purple-400/50 italic">No tarot reading data recorded in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Col 2: BI Donut Chart */}
          <div className="bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col justify-between">
            <div className="w-full flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-purple-50">Conversion Drivers</h3>
              <span className="text-[10px] text-purple-300/60">Share of Spreads</span>
            </div>
            
            <div className="flex-1 flex flex-row items-center justify-around w-full my-auto">
              <div className="flex justify-center items-center">
                <div className="relative w-36 h-36 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.6)]" 
                     style={{ background: dynamicConicGradient }}>
                  <div className="absolute inset-0 m-auto w-[5.5rem] h-[5.5rem] bg-[#0a061e] rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-base font-bold text-white">{kpis.totalSpreads}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-2 text-[10px] pl-2">
                {matrix.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: lineColors[idx % lineColors.length] }} /> 
                    <span className="text-purple-200 truncate">{m.name} ({m.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Database Spread Telemetry Breakdown */}
          <div className="bg-[#0a061e] p-5 rounded-lg border border-purple-900/40 shadow-sm flex flex-col justify-between">
            <div>
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs font-bold text-purple-50">Spread Distribution Overview</h3>
                 <span className="text-[10px] text-emerald-400 font-bold">100% Live DB</span>
               </div>
               <p className="text-[11px] text-purple-300/80 mb-4">
                 Tracking all registered tarot executions parsed from <code className="text-fuchsia-300">rawData-&gt;spreadName</code>.
               </p>
               <div className="space-y-3.5 mt-2">
                 {matrix.map((m: any, idx: number) => (
                   <div key={idx}>
                     <div className="flex justify-between text-[10px] mb-1">
                       <span className="text-purple-200 font-medium">{m.name}</span>
                       <span style={{ color: lineColors[idx % lineColors.length] }} className="font-bold">{m.pct}</span>
                     </div>
                     <div className="w-full bg-[#050314] h-2 rounded overflow-hidden">
                       <div className="h-full rounded" style={{ width: m.pct, backgroundColor: lineColors[idx % lineColors.length] }} />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Row 2: Bottom 2 Graphs filling remaining space */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[190px]">
          
          {/* Left Half: Dynamic Spread Momentum Line Chart */}
          <div className="bg-[#0a061e] p-4 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-bold text-purple-50">Spread Momentum (30D Trend)</h3>
               <div className="flex flex-wrap gap-2 text-[8px] font-bold uppercase tracking-wider">
                 {Object.keys(spreadTrends).map((sName, idx) => (
                   <span key={sName} style={{ color: lineColors[idx % lineColors.length] }} className="flex items-center gap-0.5">
                     <div className="w-1.5 h-0.5" style={{ backgroundColor: lineColors[idx % lineColors.length] }}></div> {sName}
                   </span>
                 ))}
               </div>
            </div>
            
            <div className="flex-1 relative w-full h-full min-h-[110px]">
              <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                 <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#3b0764" strokeWidth="0.5" strokeDasharray="1,2" />
                 <line x1="0" y1="25" x2="100" y2="25" stroke="#3b0764" strokeWidth="0.5" strokeDasharray="1,2" />
                 <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#3b0764" strokeWidth="0.5" strokeDasharray="1,2" />

                 {Object.entries(spreadTrends).map(([sName, arr]: [string, any], idx) => (
                   <polyline 
                     key={sName}
                     points={getPoints(arr)} 
                     fill="none" 
                     stroke={lineColors[idx % lineColors.length]} 
                     strokeWidth="1.5" 
                     vectorEffect="non-scaling-stroke"
                   />
                 ))}
              </svg>
            </div>
          </div>

          {/* Right Half: Consultation Upsell Volume Bar Chart */}
          <div className="bg-[#0a061e] p-4 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-bold text-purple-50">Consultation Upsell Volume (30D)</h3>
               <span className="text-[10px] text-emerald-400 font-bold">Live DB Sync</span>
            </div>
            <div className="flex-1 flex items-end gap-1 min-h-[110px]">
              {conversionTrend.map((val: number, i: number) => {
                const maxV = Math.max(...conversionTrend, 1);
                return (
                  <div 
                    key={i} 
                    className="w-full bg-emerald-600/60 hover:bg-emerald-400 transition-all rounded-t-sm" 
                    style={{ height: `${Math.max((val / maxV) * 100, val > 0 ? 15 : 2)}%` }} 
                    title={`Day ${i+1}: ${val} Consultations`} 
                  />
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}