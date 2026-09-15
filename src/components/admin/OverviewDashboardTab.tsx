'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { Loader2 } from 'lucide-react';

export default function DashboardOverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const authedFetch = useAuthedFetch();

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await authedFetch('/api/admin/dashboard-overview');
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error("Failed to fetch Master Dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, [authedFetch]);

  // 🚀 Fully activated export capturing the entire root container!
  const handleExportVisual = () => {
    if (!dashboardRef.current) return;
    
    const clonedNode = dashboardRef.current.cloneNode(true) as HTMLElement;
    clonedNode.style.height = 'auto';
    clonedNode.style.overflow = 'visible';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Master Command Center BI Report</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { 
            background-color: #050314 !important; 
            color: #f3e8ff !important; 
            font-family: ui-sans-serif, system-ui, sans-serif; 
            padding: 32px; 
          }
          svg { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div style="max-width: 1400px; margin: 0 auto;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 24px; color: #ffffff;">Mystica Master Command Center BI - Export Report</h1>
          ${clonedNode.outerHTML}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `Master_Dashboard_BI_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;

  const kpis = data?.kpis || { totalUsers: 0, active7d: 0, totalAI: 0, conversionRate: 0, slaBacklog: 0, avgLatency: 0 };
  const tarotTrend = data?.trends?.tarot || Array(30).fill(0);
  const palmTrend = data?.trends?.palm || Array(30).fill(0);
  const aiTrend = data?.trends?.ai || Array(30).fill(0);
  
  const rawFunnel = data?.funnel || [];
  const funnelColors = ['bg-indigo-600', 'bg-fuchsia-600', 'bg-purple-600', 'bg-amber-500'];
  const mappedFunnel = rawFunnel.map((item: any, idx: number) => ({ ...item, color: funnelColors[idx % funnelColors.length] }));

  const rawLifeGoals = data?.demographics?.goals || [];
  const goalColors = ['bg-emerald-500', 'bg-rose-500', 'bg-purple-500', 'bg-blue-500', 'bg-amber-500', 'bg-cyan-500', 'bg-slate-400'];
  const mappedGoals = rawLifeGoals.map((item: any, idx: number) => ({ ...item, color: goalColors[idx % goalColors.length] }));

  const ageDist = data?.demographics?.age || [];
  const ageColors = ['bg-purple-900/40 text-purple-300', 'bg-purple-800/40 text-purple-200', 'bg-purple-700/40 text-purple-100', 'bg-purple-600/40 text-purple-50'];

  const tarotProfile = data?.tarotProfile || [];
  let conicStr = 'conic-gradient(#1e1b4b 0% 100%)';
  if (tarotProfile.length > 0 && tarotProfile.some((t: any) => t.pct > 0)) {
    let cumulative = 0;
    const stops = tarotProfile.filter((t: any) => t.pct > 0).map((t: any) => {
      const start = cumulative;
      cumulative += t.pct;
      return `${t.colorCode} ${start}% ${cumulative}%`;
    });
    conicStr = `conic-gradient(${stops.join(', ')})`;
  }

  const palmQuality = data?.palmQuality || { p1080: 0, p720: 0, p480: 0 };
  const aiCore = data?.aiCore || { totalTokens: 0, avgTokens: 0, promptPct: 0, compPct: 0 };
  const triage = data?.triage || [];
  const recentEvents = data?.recentEvents || [];

  const maxVelocity = Math.max(...tarotTrend, ...palmTrend, ...aiTrend, 10);
  const tarotVol30D = tarotTrend.reduce((a: number, b: number) => a + b, 0);

  return (
    <div ref={dashboardRef} className="flex flex-col h-full space-y-5 bg-[#050314] p-2">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-purple-900/40 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-purple-50 tracking-tight">Master Command Center</h2>
          <p className="text-xs text-purple-300/60 mt-1">Real-time synthesis: Platform, Users, AI Core, and Operations.</p>
        </div>
        <div className="flex gap-3">
          <span className="text-[11px] font-mono bg-emerald-900/20 text-emerald-400 px-3 py-1.5 rounded border border-emerald-500/30 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Telemetry
          </span>
          <button 
            onClick={handleExportVisual} 
            className="text-[11px] bg-purple-700 text-white px-4 py-1.5 rounded hover:bg-purple-600 transition font-bold tracking-wider uppercase cursor-pointer"
          >
            Export Master PDF
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-[#0a061e] p-4 rounded-xl border border-purple-900/40 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider">Total Users</span>
            <span className="text-[10px] font-bold text-emerald-400">Active</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-purple-50 font-mono">{kpis.totalUsers.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-purple-300">{kpis.active7d.toLocaleString()} (7D)</span>
          </div>
        </div>

        <div className="bg-[#0a061e] p-4 rounded-xl border border-purple-900/40 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider">Total AI Synthesis</span>
            <span className="text-[10px] font-bold text-fuchsia-400">GLM Core</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-purple-50 font-mono">{(kpis.totalAI >= 1000 ? (kpis.totalAI/1000).toFixed(1) + 'k' : kpis.totalAI)}</span>
            <span className="text-[11px] font-semibold text-purple-300">Scans/Spreads</span>
          </div>
        </div>

        <div className="bg-[#0a061e] p-4 rounded-xl border border-purple-900/40 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider">Platform Conversion</span>
            <span className="text-[10px] font-bold text-emerald-400">Revenue</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-purple-50 font-mono">{kpis.conversionRate}%</span>
            <span className="text-[11px] font-semibold text-purple-300">Paid Upsell</span>
          </div>
        </div>

        <div className="bg-[#0a061e] p-4 rounded-xl border border-purple-900/40 shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-purple-300/60 uppercase tracking-wider">Human SLA Backlog</span>
            <span className={`text-[10px] font-bold ${kpis.slaBacklog > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
              {kpis.slaBacklog > 0 ? 'Action Needed' : 'Cleared'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-400 font-mono">{kpis.slaBacklog}</span>
            <span className="text-[11px] font-semibold text-amber-400">Pending Tickets</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
        
        {/* LEFT COLUMN: Users & Demographics */}
        <div className="lg:col-span-3 flex flex-col gap-5 h-full">
          
          <div className="bg-[#0a061e] p-5 rounded-xl border border-purple-900/40 shadow-sm flex flex-col shrink-0">
            <h3 className="text-xs font-bold text-purple-50 mb-5">Onboarding Funnel</h3>
            <div className="flex-1 flex flex-col space-y-4">
              {mappedFunnel.map((item: any) => (
                <div key={item.stage} className="relative">
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-purple-200">{item.stage}</span>
                    <span className="text-purple-100 font-mono">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[#050314] rounded h-4 overflow-hidden border border-purple-900/30">
                    <div className={`h-full ${item.color} flex items-center justify-end pr-2 font-bold text-[9px] text-white transition-all`} style={{ width: item.w }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0a061e] p-5 rounded-xl border border-purple-900/40 shadow-sm flex flex-col flex-1">
            <h3 className="text-xs font-bold text-purple-50 mb-4">Core UX Demographics</h3>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="mb-2 shrink-0">
                <span className="text-[9px] text-purple-300/60 font-semibold mb-2 block uppercase tracking-wider">Age Distribution</span>
                <div className="flex gap-1 text-[9px] font-bold">
                  {ageDist.length > 0 ? ageDist.map((a: any, i: number) => (
                    <div key={i} className={`${ageColors[i%ageColors.length]} py-1.5 rounded text-center truncate`} style={{ width: `${a.pct}%` }}>{a.label}</div>
                  )) : <div className="text-purple-400/50 italic py-1.5">No data</div>}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end space-y-2.5 mt-4">
                <span className="text-[9px] text-purple-300/60 font-semibold mb-1 block uppercase tracking-wider">Primary Life Goals</span>
                {mappedGoals.length > 0 ? mappedGoals.map((goal: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-[9px] mb-1">
                      <span className="text-purple-200 truncate pr-2">{goal.label}</span>
                      <span className="text-purple-100 font-mono">{goal.pct}%</span>
                    </div>
                    <div className="w-full bg-[#050314] h-1.5 rounded">
                      <div className={`${goal.color} h-full rounded transition-all`} style={{ width: `${goal.pct}%` }} />
                    </div>
                  </div>
                )) : <span className="text-[9px] text-purple-400/50 italic">No goals selected.</span>}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Velocity & Product Summary */}
        <div className="lg:col-span-6 flex flex-col gap-5 h-full">
          
          <div className="bg-[#0a061e] p-5 rounded-xl border border-purple-900/40 shadow-sm flex flex-col relative h-[48%] shrink-0">
            <div className="flex justify-between items-center mb-4 z-10 shrink-0">
               <h3 className="text-sm font-bold text-purple-50">Cross-Platform Generation Velocity</h3>
               <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                 <span className="text-[#fbbf24] flex items-center gap-1"><div className="w-2.5 h-0.5 bg-[#fbbf24]"></div> Tarot</span>
                 <span className="text-[#6366f1] flex items-center gap-1"><div className="w-2.5 h-0.5 bg-[#6366f1]"></div> Palm VLM</span>
                 <span className="text-[#d946ef] flex items-center gap-1"><div className="w-2.5 h-0.5 bg-[#d946ef]"></div> AI Core</span>
               </div>
            </div>

            <div className="flex-1 relative w-full mt-2">
              <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                 <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="#3b0764" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>
                 <line x1="0" y1="25" x2="100" y2="25" stroke="#3b0764" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.6"/>
                 <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="#3b0764" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4"/>

                 <polyline points={palmTrend.map((val: number, i: number) => `${(i / (palmTrend.length - 1)) * 100},${val > 0 ? 50 - (val / maxVelocity) * 45 : 50}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
                 <polyline points={aiTrend.map((val: number, i: number) => `${(i / (aiTrend.length - 1)) * 100},${val > 0 ? 50 - (val / maxVelocity) * 45 : 50}`).join(' ')} fill="none" stroke="#d946ef" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
                 <polyline points={tarotTrend.map((val: number, i: number) => `${(i / (tarotTrend.length - 1)) * 100},${val > 0 ? 50 - (val / maxVelocity) * 45 : 50}`).join(' ')} fill="none" stroke="#fbbf24" strokeWidth="4" vectorEffect="non-scaling-stroke"/>
              </svg>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-5 h-[45%]">
             <div className="bg-[#0a061e] p-5 rounded-xl border border-purple-900/40 shadow-sm flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="text-xs font-bold text-purple-50 mb-1">Tarot Synthesis Profile</h3>
                  <span className="text-[10px] text-amber-400 font-mono">{tarotProfile[0]?.count || 0} {tarotProfile[0]?.label || 'Spreads'}</span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center mt-4 mb-2">
                  <div className="relative w-36 h-36 rounded-full mb-4 shadow-[0_0_25px_rgba(251,191,36,0.15)]" 
                       style={{ background: conicStr }}>
                    <div className="absolute inset-0 m-auto w-20 h-20 bg-[#0a061e] rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-2xl font-bold text-white">{tarotProfile[0]?.pct || 0}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-[9px] w-full font-semibold px-2">
                    {tarotProfile.map((t: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: t.colorCode }} /> <span className="text-purple-200 truncate">{t.label}</span></div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="bg-[#0a061e] p-5 rounded-xl border border-purple-900/40 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2 shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-purple-50 mb-1">Palm VLM Health</h3>
                    <span className="text-[10px] text-fuchsia-400 font-mono">GLM-4V Engine</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center w-full my-4 bg-[#050314] rounded-lg border border-purple-900/20 py-4 shadow-inner">
                   <span className="text-4xl font-bold text-emerald-400 font-mono leading-none tracking-tighter">{kpis.avgLatency > 0 ? kpis.avgLatency : '0.0'}<span className="text-2xl text-emerald-500/70">s</span></span>
                   <span className="text-[9px] uppercase text-purple-300/80 tracking-widest mt-2 flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Avg Processing Latency
                   </span>
                </div>

                <div className="flex flex-col gap-2.5 mt-auto shrink-0">
                  <span className="text-[9px] font-bold text-purple-300/60 uppercase tracking-wider block">Upload Quality Matrix</span>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1"><span className="text-purple-200">1080p+ (Optimal)</span><span className="text-emerald-400 font-mono">{palmQuality.p1080}%</span></div>
                    <div className="w-full bg-[#050314] h-2 rounded"><div className="bg-emerald-500 h-full rounded transition-all" style={{ width: `${palmQuality.p1080}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1"><span className="text-purple-200">720p (Acceptable)</span><span className="text-amber-400 font-mono">{palmQuality.p720}%</span></div>
                    <div className="w-full bg-[#050314] h-2 rounded"><div className="bg-amber-500 h-full rounded transition-all" style={{ width: `${palmQuality.p720}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1"><span className="text-purple-200">&lt;480p (Failed)</span><span className="text-rose-400 font-mono">{palmQuality.p480}%</span></div>
                    <div className="w-full bg-[#050314] h-2 rounded"><div className="bg-rose-500 h-full rounded transition-all" style={{ width: `${palmQuality.p480}%` }} /></div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Operations & Broadcasts */}
        <div className="lg:col-span-3 flex flex-col gap-5 h-full">
          
          <div className="bg-[#0a061e] p-5 rounded-xl border border-purple-900/40 shadow-sm flex flex-col shrink-0">
            <h3 className="text-xs font-bold text-purple-50 mb-4">AI Core Diagnostics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#050314] p-2.5 rounded border border-purple-900/20">
                <span className="text-[10px] text-purple-200 font-semibold">Total Tokens Processed</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{aiCore.totalTokens.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9px] text-purple-300/60 font-semibold mb-2 block uppercase tracking-wider">Avg Token Cost ({aiCore.avgTokens.toLocaleString()}t)</span>
                
                <div 
                  className="w-full h-3 flex rounded-full overflow-hidden border border-purple-900/30"
                  style={{
                    background: aiCore.promptPct === 0 && aiCore.compPct === 0 
                      ? 'linear-gradient(90deg, #06b6d4 0%, #d946ef 100%)' 
                      : '#050314'
                  }}
                >
                  {aiCore.promptPct > 0 && <div className="bg-cyan-500 h-full transition-all" style={{ width: `${aiCore.promptPct}%` }} />}
                  {aiCore.compPct > 0 && <div className="bg-fuchsia-500 h-full transition-all" style={{ width: `${aiCore.compPct}%` }} />}
                </div>

              </div>
            </div>
          </div>

          <div className="bg-[#0a061e] p-5 rounded-xl border border-purple-900/40 shadow-sm flex flex-col shrink-0">
            <h3 className="text-xs font-bold text-purple-50 mb-3">Specialist SLA Triage</h3>
            <div className="space-y-2 flex-1">
              <div className="flex justify-between items-center text-[10px] bg-[#050314] p-2.5 rounded border border-purple-900/20 mb-3">
                 <span className="text-purple-200 flex items-center gap-1.5">
                   {kpis.slaBacklog > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />} 
                   Pending Backlog
                 </span>
                 <span className={`${kpis.slaBacklog > 0 ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>{kpis.slaBacklog} Tickets</span>
              </div>
              {triage.map((t: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-[10px] bg-[#050314] p-2.5 rounded border border-purple-900/20">
                  <span className="text-purple-200 flex items-center gap-1.5">
                    Pending {t.modality}
                  </span>
                  <span className={`${t.count > 0 ? 'text-rose-400' : 'text-emerald-400'} font-bold`}>{t.count} Tickets</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0a061e] p-5 rounded-xl border border-purple-900/40 shadow-sm flex flex-col flex-1 justify-between">
            <div>
              <h3 className="text-xs font-bold text-purple-50 mb-3">Recent Platform Events</h3>
              <div className="space-y-3">
                {recentEvents.length > 0 ? recentEvents.map((evt: any, i: number) => (
                  <div key={i} className="bg-[#050314] p-2.5 rounded border border-purple-900/30">
                    <span className="text-[10px] font-bold text-purple-100 block truncate">{evt.action}</span>
                    <div className="flex justify-end text-[9px] mt-1">
                      <span className="text-purple-300">{evt.time}</span>
                    </div>
                  </div>
                )) : <span className="text-[10px] text-purple-400/50 italic block text-center py-2">No recent events logged.</span>}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}