'use client';

import React, { useEffect, useState } from 'react';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { Loader2 } from 'lucide-react';

export default function UserActivityTab() {
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Table Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');

  const authedFetch = useAuthedFetch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, usersRes] = await Promise.all([
          authedFetch('/api/admin/dashboard-overview'),
          authedFetch('/api/admin/users')
        ]);

        if (overviewRes.ok && usersRes.ok) {
          setOverview(await overviewRes.json());
          setUsers(await usersRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch User Activity data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authedFetch]);

  // 🚀 CSV EXPORT FUNCTIONALITY
  const handleExportCSV = () => {
    if (users.length === 0) return;
    
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Joined Date', 'Last Active', 'Status'];
    const csvRows = filteredUsers.map(u => 
      `${u.id},"${u.name}","${u.email}","${u.role}",${u.joined},"${u.active}",${u.status}`
    );
    
    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Mystica_CRM_Export_${new Date().toISOString().split('T')[0]}.csv`);
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

  // Live Calculations & Dynamic 5-Part Donut Chart Math
  const totalRegistered = users.length;
  const churnRiskCount = users.filter(u => u.status === 'Churn Risk').length;
  const kpis = overview?.kpis || { active7d: 0, conversionRate: 0 };
  const signupTrend = overview?.trends?.ai || [42, 45, 48, 40, 55, 60, 65, 58, 70, 75, 82, 85, 90, 88, 85, 92, 95, 100, 105, 98, 95, 110, 115, 120, 118, 125, 130, 128, 135, 142];

  // Role Breakdown Calculations for All 5 Roles
  const userCount = users.filter(u => u.role.toLowerCase() === 'user').length;
  const tarotCount = users.filter(u => u.role.toLowerCase().includes('tarot')).length;
  const palmCount = users.filter(u => u.role.toLowerCase().includes('palm')).length;
  const spiritualCount = users.filter(u => u.role.toLowerCase().includes('spiritual')).length;
  const adminCount = users.filter(u => u.role.toLowerCase() === 'admin').length;

  const safeTotal = totalRegistered || 1;
  const userEnd = (userCount / safeTotal) * 100;
  const tarotEnd = userEnd + (tarotCount / safeTotal) * 100;
  const palmEnd = tarotEnd + (palmCount / safeTotal) * 100;
  const spiritualEnd = palmEnd + (spiritualCount / safeTotal) * 100;
  // Admin takes the remainder up to 100%

  const dynamicConicGradient = `conic-gradient(
    #6366f1 0% ${userEnd}%, 
    #f59e0b ${userEnd}% ${tarotEnd}%, 
    #10b981 ${tarotEnd}% ${palmEnd}%, 
    #3b82f6 ${palmEnd}% ${spiritualEnd}%,
    #ec4899 ${spiritualEnd}% 100%
  )`;

  // Apply filters to the CRM table
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || u.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-purple-900/40 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-purple-50 tracking-tight">Global User Activity BI</h2>
        </div>
        <div className="flex gap-2">
          <span className="text-[10px] font-mono bg-[#0a061e] text-emerald-400 px-2 py-1 rounded border border-emerald-900/50 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live DB Sync
          </span>
          <button onClick={handleExportCSV} className="text-[10px] bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-600 transition">
            Export User Report
          </button>
        </div>
      </div>

      {/* High-Density KPI Strip */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'TOTAL REGISTERED', value: totalRegistered, sub: 'Lifetime', color: 'text-purple-300' },
          { label: 'ACTIVE (7D)', value: kpis.active7d, sub: 'Platform wide', color: 'text-emerald-400' },
          { label: 'CONVERSION RATE', value: `${kpis.conversionRate}%`, sub: 'To Paid Consult', color: 'text-emerald-400' },
          { label: 'CHURN RISK', value: churnRiskCount, sub: 'Requires Action', color: 'text-rose-400' }
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

      {/* Top Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 shrink-0 min-h-[220px]">
        {/* Top Left (Spans 3 cols): New Signups Line Chart */}
        <div className="lg:col-span-3 bg-[#0a061e] p-4 rounded-lg border border-purple-900/40 shadow-sm flex flex-col relative h-full">
          <div className="flex justify-between items-center mb-4 z-10 shrink-0">
             <h3 className="text-xs font-bold text-purple-50">Platform Activity Velocity (30D)</h3>
             <span className="text-[10px] text-indigo-400 font-bold bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-500/30">Live Sync</span>
          </div>
          <div className="flex-1 relative w-full mt-2">
            <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
               <line x1="0" y1="25" x2="100" y2="25" stroke="#3b0764" strokeWidth="0.5" strokeDasharray="2,2" />
               <polyline 
                 points={signupTrend.map((val: number, i: number) => `${(i / (signupTrend.length - 1)) * 100},${50 - ((val - Math.min(...signupTrend)) / (Math.max(...signupTrend) || 1)) * 45}`).join(' ')} 
                 fill="none" 
                 stroke="#6366f1" 
                 strokeWidth="3" 
                 vectorEffect="non-scaling-stroke"
               />
            </svg>
          </div>
        </div>

        {/* Top Right (Spans 1 col): User Roles Donut (DYNAMIC 5-WAY SPLIT) */}
        <div className="lg:col-span-1 bg-[#0a061e] p-4 rounded-lg border border-purple-900/40 shadow-sm flex flex-col h-full">
          <div className="w-full flex justify-between items-center shrink-0 mb-3">
            <h3 className="text-xs font-bold text-purple-50">Platform Roles</h3>
          </div>
          <div className="flex-1 flex flex-row items-center justify-between w-full min-h-0 gap-2">
            <div className="flex-[3] flex justify-center items-center h-full">
              <div className="relative w-24 h-24 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0" 
                   style={{ background: dynamicConicGradient }}>
                <div className="absolute inset-0 m-auto w-16 h-16 bg-[#0a061e] rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-lg font-bold text-white">{totalRegistered}</span>
                </div>
              </div>
            </div>
            <div className="flex-[2] flex flex-col justify-center space-y-1.5 text-[9px] pl-1">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#6366f1] shrink-0" /> <span className="text-purple-200">User ({userCount})</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#f59e0b] shrink-0" /> <span className="text-purple-200">Tarot ({tarotCount})</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#10b981] shrink-0" /> <span className="text-purple-200">Palm ({palmCount})</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#3b82f6] shrink-0" /> <span className="text-purple-200">Spiritual ({spiritualCount})</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-[#ec4899] shrink-0" /> <span className="text-purple-200">Admin ({adminCount})</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Interactive CRM Table */}
      <div className="flex-1 bg-[#0a061e] rounded-lg border border-purple-900/40 shadow-sm flex flex-col overflow-hidden min-h-[300px]">
        {/* Search & Filter Toolbar */}
        <div className="p-3 border-b border-purple-900/40 bg-[#050314] flex flex-wrap gap-4 items-center justify-between shrink-0">
          <div className="flex gap-3 flex-1 min-w-[300px]">
            <input 
              type="text" 
              placeholder="Search by Name or Email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#0a061e] border border-purple-900/50 rounded px-3 py-1.5 text-xs text-purple-100 focus:outline-none focus:border-fuchsia-500 transition-colors"
            />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#0a061e] border border-purple-900/50 rounded px-3 py-1.5 text-xs text-purple-100 focus:outline-none focus:border-fuchsia-500"
            >
              <option>All Roles</option>
              <option>User</option>
              <option>Tarot Reader</option>
              <option>Palm Consultant</option>
              <option>Spiritual Consultant</option>
              <option>Admin</option>
            </select>
          </div>
          <button onClick={handleExportCSV} className="bg-purple-900/40 border border-purple-500/30 hover:bg-purple-800 text-purple-100 px-3 py-1.5 rounded text-xs font-semibold transition-colors">
            Export CSV
          </button>
        </div>

        {/* Dense Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-[#050314] text-purple-300/70 sticky top-0 border-b border-purple-900/40 z-10">
              <tr>
                <th className="p-3 pl-4 font-semibold uppercase tracking-wider">User ID</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Name</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Email</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Role</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Joined Date</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Last Active</th>
                <th className="p-3 font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/20">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-purple-900/20 text-purple-200 transition-colors">
                  <td className="p-3 pl-4 font-mono font-bold text-fuchsia-300">usr_{user.id}</td>
                  <td className="p-3 font-semibold text-purple-100">{user.name}</td>
                  <td className="p-3 text-purple-300/80">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      user.role.toLowerCase() === 'user' ? 'bg-indigo-900/30 border-indigo-500/30 text-indigo-300' :
                      user.role.toLowerCase().includes('tarot') ? 'bg-amber-900/30 border-amber-500/30 text-amber-300' :
                      user.role.toLowerCase().includes('palm') ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-300' :
                      user.role.toLowerCase().includes('spiritual') ? 'bg-blue-900/30 border-blue-500/30 text-blue-300' :
                      'bg-fuchsia-900/30 border-fuchsia-500/30 text-fuchsia-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-purple-400/60 font-mono">{user.joined}</td>
                  <td className="p-3 text-purple-300">{user.active}</td>
                  <td className="p-3 font-bold flex items-center gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span className={user.color}>{user.status}</span>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-purple-300/50">No users found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}