'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, User, Heart, TrendingUp, Brain,
  Sparkles, Save, Send, ShieldAlert, Loader2, Globe,
  Search, FileText, FileEdit, RefreshCw, ArrowRight
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useAuthedFetch } from '@/components/auth/auth-provider';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

// =====================================================================
// 1. TYPES & INTERFACES
// =====================================================================

type ConsultationStatus = 'Pending' | 'In Review' | 'Completed';

interface Consultation {
  id: string;
  clientId: string;
  clientName: string;
  topic: string;
  requestedAt: string;
  status: ConsultationStatus;
}

interface TrendPoint {
  session: string;
  personalGrowth: number;
  careerClarity: number;
  relationship: number;
  selfReflection: number;
}

interface ClientCase {
  consultation: Consultation;
  profile: {
    ageGroup: string;
    spiritualInterests: string[];
    spiritualGoals: string;
    previousSessions: number;
  };
  insights: {
    overallInterpretation: string;
    scores: {
      palmConfidence: number;
      tarotRelevance: number;
      personalityAlignment: number;
      contextRelevance: number;
      overall: number;
    };
  };
  trends: TrendPoint[];
  specialistNotes?: string;
}

interface ConsultantForm {
  spiritualRemedies: string;
  lifestyleAdvice: string;
  notes: string;
  summary: string;
  rating: number;
}

const AUTHORIZED_ROLES = ['spiritual_consultant', 'admin', 'Spiritual Consultant', 'Administrator'];

const EMPTY_FORM: ConsultantForm = {
  spiritualRemedies: '',
  lifestyleAdvice: '',
  notes: '',
  summary: '',
  rating: 5,
};

// =====================================================================
// 2. HELPER COMPONENTS
// =====================================================================

function MetricCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-xl border border-border/50 bg-background/40 gap-2 ${highlight ? 'border-primary/40 bg-primary/5' : ''}`}>
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
          <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4" strokeLinecap="round" stroke="currentColor" className={highlight ? 'text-primary' : 'text-accent'} strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {value}%
        </div>
      </div>
      <p className={`text-[10px] text-center uppercase tracking-wider leading-snug ${highlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{label}</p>
    </div>
  );
}

// =====================================================================
// 3. MAIN COMPONENT
// =====================================================================

export function SpiritualGuideSection() {
  const { toast } = useToast();
  const { user } = useAuth();
  const authedFetch = useAuthedFetch();

  const [clientCases, setClientCases] = useState<ClientCase[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState<ConsultantForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);

  // 👇 --- INSERT THIS NEW BLOCK --- 👇
  const [stats, setStats] = useState({ pending: 0, completedAllTime: 0 });

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authedFetch('/api/consultations/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [authedFetch, user]);
  // 👆 ------------------------------- 👆

  const fetchQueue = useCallback(async () => {
    // FIX: Silent abort if the user is logging out or not authenticated
    if (!user) return; 

    setLoading(true);
    try {
      const res = await authedFetch('/api/consultations');
      // ... rest of your code ...
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();

      const newCases: ClientCase[] = data.map((t: any) => {
        const profileData = t.client?.profile || {};
        return {
          consultation: {
            id: t.id,
            clientId: t.clientId || 'unknown',
            clientName: t.client?.name || 'Seeker',
            topic: t.clientQuestion || 'Seeking Holistic Guidance',
            requestedAt: t.createdAt,
            status: t.status === 'Completed' ? 'Completed' : 'Pending'
          },
          profile: {
            ageGroup: profileData.ageGroup || 'Not specified',
            spiritualInterests: profileData.spiritualInterests?.length > 0 ? profileData.spiritualInterests : ['General Spirituality'],
            spiritualGoals: profileData.primaryGoal || 'Clarity',
            previousSessions: 1, 
          },
          insights: {
            overallInterpretation: t.reading?.summary || 'AI interpretation pending deeper review. Connect the client\'s Palm and Tarot history for a full synthesis.',
            scores: { palmConfidence: 85, tarotRelevance: 92, personalityAlignment: 88, contextRelevance: 90, overall: 89 }
          },
          trends: [
            { session: 'Last', personalGrowth: 50, careerClarity: 50, relationship: 50, selfReflection: 50 },
            { session: 'Now', personalGrowth: 60, careerClarity: 55, relationship: 60, selfReflection: 65 }
          ],
          specialistNotes: t.specialistNotes || '',
        };
      });

      setClientCases(newCases);
      
      const pending = newCases.filter(c => c.consultation.status === 'Pending');
      if (pending.length > 0 && !selectedId) {
        setSelectedId(pending[0].consultation.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authedFetch, selectedId]);

  useEffect(() => {
    fetchQueue();
    fetchStats(); // <-- Added
  }, [fetchQueue, fetchStats]); // <-- Added

  const selectedCase = useMemo(
    () => clientCases.find((c) => c.consultation.id === selectedId) || null,
    [selectedId, clientCases]
  );

  const pendingTickets = clientCases.filter(
    (c) => c.consultation.status === 'Pending' && c.consultation.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectConsultation = (id: string) => {
    setSelectedId(id);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.summary.trim() || !form.notes.trim()) {
      toast({ title: 'Missing details', description: 'Please add notes and a summary.', variant: 'destructive' });
      return;
    }

    // 1. Format the notes cleanly (Notice we deleted the old 'payload' variable entirely)
    const formattedNotes = `✦ SPIRITUAL REMEDIES:\n${form.spiritualRemedies}\n\n✦ LIFESTYLE ADVICE:\n${form.lifestyleAdvice}\n\n✦ CONSULTANT NOTES:\n${form.notes}`;

    try {
      const res = await authedFetch(`/api/consultations/${selectedId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistNotes: formattedNotes,
          summary: form.summary,
          rating: form.rating
        })
      });

      if (!res.ok) throw new Error('Failed to submit review');

      setClientCases((prev) =>
        prev.map((c) => (c.consultation.id === selectedId ? { ...c, consultation: { ...c.consultation, status: 'Completed' } } : c))
      );
      
      toast({ title: 'Review Completed', description: 'Holistic consultation submitted successfully.' });
      
      const remaining = clientCases.filter(q => q.consultation.id !== selectedId && q.consultation.status === 'Pending');
      if (remaining.length > 0) setSelectedId(remaining[0].consultation.id);
      else setSelectedId(null);
      
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const updateForm = (key: keyof ConsultantForm, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isAuthorized = !!user && AUTHORIZED_ROLES.includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="relative z-10 w-full pb-20">
        <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
          <Card className="bg-card/60 backdrop-blur border-destructive/30 p-8 space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto text-destructive">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              This workspace is strictly reserved for authenticated <span className="text-primary font-medium">Spiritual Guides</span>.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full pb-20">
      <div className="space-y-6">
        
        {/* STANDARDIZED HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                  Specialist Console
                </span>
                <span className="opacity-40">•</span>
                <span className="text-xs text-muted-foreground font-mono">{user?.name}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                Spiritual Guide Workspace
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* THE NEW METRIC CARDS */}
            <div className="hidden md:flex items-center gap-4 mr-4">
              <div className="text-center px-4 border-r border-border/50">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Pending</p>
                <p className="font-display text-xl font-bold text-amber-400">{stats.pending}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Completed</p>
                <p className="font-display text-xl font-bold text-emerald-400">{stats.completedAllTime}</p>
              </div>
            </div>

            {/* SYNC BUTTON */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { fetchQueue(); fetchStats(); }} 
              disabled={loading} 
              className="border-border/60 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Sync Queue
            </Button>
          </div>
        </div>

        {/* STANDARDIZED SPLIT VIEW */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* QUEUE (LEFT COLUMN) */}
          <div className="lg:col-span-4 h-full">
            <Card className="bg-card/60 backdrop-blur border-border/50 p-5 flex flex-col h-full">
              <div className="flex items-center justify-between pb-4 border-b border-border/50 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-wide">Pending Queue</h2>
                    <p className="text-xs text-muted-foreground">
                      {loading ? 'Fetching tickets...' : `${pendingTickets.length} pending consultations`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Filter by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8 text-xs bg-background/40 border-border/50"
                />
              </div>

              <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 max-h-[580px]">
                {loading ? (
                  <div className="py-12 text-center"><Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" /></div>
                ) : pendingTickets.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground space-y-2">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/80" />
                    <p className="font-medium text-sm text-foreground">Queue Empty</p>
                    <p className="text-xs max-w-[200px] mx-auto">No pending holistic consultations.</p>
                  </div>
                ) : (
                  pendingTickets.map((c) => (
                    <motion.div
                      key={c.consultation.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => selectConsultation(c.consultation.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                        c.consultation.id === selectedId
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                          : 'border-border/50 bg-background/40 hover:border-primary/40 hover:bg-secondary/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-semibold text-primary">GUIDE-{c.consultation.id.substring(0,5).toUpperCase()}</span>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">Pending</Badge>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {c.consultation.clientName}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(c.consultation.requestedAt), 'MMM d, h:mm a')}
                          </div>
                        </div>
                        <Button size="sm" variant={c.consultation.id === selectedId ? 'default' : 'secondary'} className="h-8 px-3 text-xs shrink-0">
                          Review <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* WORKSPACE (RIGHT COLUMN) */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedCase ? (
              <Card className="bg-card/60 backdrop-blur border-border/50 p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[450px]">
                <Globe className="w-12 h-12 mb-4 opacity-30 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">No Consultation Selected</h3>
                <p className="text-xs max-w-sm">Select a pending consultation ticket from the queue on the left to begin reviewing.</p>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={selectedCase.consultation.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* CLIENT DOSSIER */}
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            GUIDE-{selectedCase.consultation.id.substring(0,8).toUpperCase()}
                          </span>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">Pending</Badge>
                        </div>
                        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          {selectedCase.consultation.clientName}
                        </h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Age Group</p>
                        <p className="text-sm font-medium">{selectedCase.profile.ageGroup}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sessions</p>
                        <p className="text-sm font-medium">{selectedCase.profile.previousSessions}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Goals</p>
                        <p className="text-sm font-medium">{selectedCase.profile.spiritualGoals}</p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="font-display text-sm font-semibold">Client's Core Question</h3>
                      </div>
                      <p className="text-base leading-relaxed italic">&ldquo;{selectedCase.consultation.topic}&rdquo;</p>
                    </div>
                  </Card>

                  {/* AI HOLISTIC SCORES */}
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400">
                        <Brain className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">Holistic AI Synthesis</h3>
                        <p className="text-xs text-muted-foreground">Cross-referencing Palm, Tarot, and Profile data</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <MetricCard label="Palm Confidence" value={selectedCase.insights.scores.palmConfidence} />
                      <MetricCard label="Tarot Relevance" value={selectedCase.insights.scores.tarotRelevance} />
                      <MetricCard label="Alignment" value={selectedCase.insights.scores.personalityAlignment} />
                      <MetricCard label="Context" value={selectedCase.insights.scores.contextRelevance} />
                      <MetricCard label="Overall Synergy" value={selectedCase.insights.scores.overall} highlight />
                    </div>

                    <div className="p-4.5 mt-2 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                      <p className="text-sm leading-relaxed text-slate-200 font-normal whitespace-pre-line">
                        {selectedCase.insights.overallInterpretation}
                      </p>
                    </div>
                  </Card>

                  {/* TREND GRAPH */}
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <TrendingUp className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">Growth Trajectory</h3>
                        <p className="text-xs text-muted-foreground">Client's alignment across recent sessions</p>
                      </div>
                    </div>
                    <div className="h-64 w-full bg-background/30 rounded-xl p-4 border border-border/50">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedCase.trends} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gGrowth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d4af37" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                            </linearGradient> 
                            <linearGradient id="gCareer" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#555" strokeOpacity={0.4} />
                          <XAxis dataKey="session" tick={{ fill: '#999', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#999', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #444', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                          <Area type="monotone" dataKey="personalGrowth" name="Personal Growth" stroke="#d4af37" fill="url(#gGrowth)" strokeWidth={2} />
                          <Area type="monotone" dataKey="careerClarity" name="Career Clarity" stroke="#a855f7" fill="url(#gCareer)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* SPECIALIST EDITOR */}
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <FileEdit className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">Final Holistic Guidance</h3>
                        <p className="text-xs text-muted-foreground">Provide actionable advice based on the synthesized data</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Spiritual Remedies</label>
                        <Textarea
                          value={form.spiritualRemedies}
                          onChange={(e) => updateForm('spiritualRemedies', e.target.value)}
                          placeholder="Crystals, meditation habits..."
                          className="min-h-[100px] bg-background/50 border-border/60 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Lifestyle Advice</label>
                        <Textarea
                          value={form.lifestyleAdvice}
                          onChange={(e) => updateForm('lifestyleAdvice', e.target.value)}
                          placeholder="Sleep routine, grounding exercises..."
                          className="min-h-[100px] bg-background/50 border-border/60 text-sm"
                        />
                      </div>
                      <div className="space-y-2 col-span-full">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Consultant Summary (Sent to Client)</label>
                        <Textarea
                          value={form.summary}
                          onChange={(e) => updateForm('summary', e.target.value)}
                          placeholder="Write the final summary for the client..."
                          className="min-h-[120px] bg-background/50 border-border/60 text-sm"
                        />
                      </div>
                      <div className="space-y-2 col-span-full">
                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Internal Notes</label>
                        <Textarea
                          value={form.notes}
                          onChange={(e) => updateForm('notes', e.target.value)}
                          placeholder="Internal observations (not sent to client)..."
                          className="min-h-[80px] bg-background/50 border-border/60 text-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button onClick={handleSubmit} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 px-6 h-11 text-sm font-semibold shadow-lg shadow-primary/20">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Consultation
                      </Button>
                    </div>
                  </Card>

                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}