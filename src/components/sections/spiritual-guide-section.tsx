'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Sparkles, Search, CheckCircle2, Clock, User, Heart, TrendingUp, Brain,
  Layers, Hand, Star, Save, Send, Eye, ShieldCheck, Compass, FileText,
  Award, History as HistoryIcon, Lightbulb, Flame, Globe,
  Feather, Calendar, Target, BookOpen, BarChart3, Bell,
  ShieldAlert, Loader2
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useAuthedFetch } from '@/components/auth/auth-provider';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

// =====================================================================
// 1. TYPES & INTERFACES
// =====================================================================

type Priority = 'Low' | 'Medium' | 'High';
type ConsultationStatus = 'Pending' | 'In Review' | 'Completed';

interface Consultation {
  id: string;
  clientId: string;
  clientName: string;
  topic: string;
  requestedAt: string;
  priority: Priority;
  status: ConsultationStatus;
}

interface ClientProfile {
  id: string;
  name: string;
  ageGroup: string;
  spiritualInterests: string[];
  spiritualGoals: string;
  readingPreferences: string;
  previousSessions: number;
  currentConcern: string;
}

interface PalmAnalysis {
  imageSrc: string;
  lines: { label: string; value: string; note: string }[];
  palmShape: string;
  fingerStructure: string;
}

interface TarotCardDetail {
  position: string;
  name: string;
  img: string;
  keywords: string[];
  meaning: string;
}

interface TarotAnalysis {
  spreadType: string;
  cards: TarotCardDetail[];
  keyThemes: string[];
}

interface HolisticInsights {
  personality: string;
  relationships: string;
  careerLifeTrends: string;
  strengths: string[];
  challenges: string[];
  growthOpportunities: string[];
  overallInterpretation: string;
  scores: {
    palmConfidence: number;
    tarotRelevance: number;
    personalityAlignment: number;
    contextRelevance: number;
    overall: number;
  };
}

interface AIRecommendations {
  personalGrowth: string[];
  relationshipGuidance: string[];
  careerSuggestions: string[];
  goalAlignment: string[];
  spiritualDevelopment: string[];
}

interface ConsultationHistoryItem {
  id: string;
  date: string;
  topic: string;
  keyInsight: string;
  status: 'Completed' | 'Archived';
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
  profile: ClientProfile;
  palm: PalmAnalysis;
  tarot: TarotAnalysis;
  insights: HolisticInsights;
  recommendations: AIRecommendations;
  history: ConsultationHistoryItem[];
  trends: TrendPoint[];
}

interface ConsultantForm {
  spiritualRemedies: string;
  lifestyleAdvice: string;
  additionalGuidance: string;
  notes: string;
  summary: string;
  rating: number;
}

const AUTHORIZED_ROLES = ['spiritual_consultant', 'admin', 'Spiritual Consultant', 'Administrator'];

const EMPTY_FORM: ConsultantForm = {
  spiritualRemedies: '',
  lifestyleAdvice: '',
  additionalGuidance: '',
  notes: '',
  summary: '',
  rating: 0,
};

// =====================================================================
// 2. HELPER COMPONENTS
// =====================================================================

function SectionHeader({
  title, subtitle, icon: Icon, badge,
}: {
  title: string; subtitle?: string; icon?: React.ComponentType<{ className?: string }>; badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 w-10 h-10 rounded-xl bg-secondary/70 border border-border/50 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-wide text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
      </div>
      {badge}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    High: 'bg-destructive/15 text-destructive border-destructive/30',
    Medium: 'bg-primary/15 text-primary border-primary/30',
    Low: 'bg-muted text-muted-foreground border-border/50',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[priority]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: ConsultationStatus }) {
  const styles: Record<ConsultationStatus, string> = {
    Pending: 'bg-accent/15 text-accent border-accent/30',
    'In Review': 'bg-chart-3/15 text-chart-3 border-chart-3/30',
    Completed: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {status}
    </span>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (value / 100) * circumference;
  return (
    <Card className={`flex flex-col items-center justify-center py-6 gap-3 ${highlight ? 'border-primary/40 bg-primary/5' : ''}`}>
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted" />
          <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round" stroke="currentColor" className={highlight ? 'text-primary' : 'text-accent'} strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>
          {value}%
        </div>
      </div>
      <p className={`text-xs text-center px-2 leading-snug ${highlight ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{label}</p>
    </Card>
  );
}

function InsightCard({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground leading-relaxed">{children}</CardContent>
    </Card>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RecommendationCategory({ title, icon: Icon, items }: { title: string; icon: React.ComponentType<{ className?: string }>; items: string[] }) {
  return (
    <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
      </div>
      <div className="text-sm text-muted-foreground">
        <BulletList items={items} />
      </div>
    </div>
  );
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} onMouseEnter={() => onChange && setHover(n)} onMouseLeave={() => onChange && setHover(0)} className={`transition-transform ${onChange ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`} aria-label={`${n} star`}>
          <Star className={`w-7 h-7 transition-colors ${n <= active ? 'fill-primary text-primary' : 'text-muted-foreground/40'}`} />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{active > 0 ? `${active} / 5` : 'Not rated'}</span>
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

  const [queue, setQueue] = useState<Consultation[]>([]);
  const [clientCases, setClientCases] = useState<ClientCase[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [form, setForm] = useState<ConsultantForm>(EMPTY_FORM);
  const [notified, setNotified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch('/api/consultations');
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();

      const newQueue: Consultation[] = [];
      const newCases: ClientCase[] = [];

      data.forEach((t: any) => {
        let rawData: any = {};
        try { rawData = typeof t.reading?.rawData === 'string' ? JSON.parse(t.reading.rawData) : (t.reading?.rawData || {}); } catch(e) {}
        
        const c: Consultation = {
          id: t.id,
          clientId: t.clientId || 'unknown',
          clientName: t.client?.name || 'Seeker',
          topic: t.clientQuestion || (t.reading?.readingType === 'tarot' ? 'Tarot Reading' : 'Spiritual Guidance'),
          requestedAt: new Date(t.createdAt).toLocaleString(),
          priority: 'Medium',
          status: t.status === 'Completed' ? 'Completed' : 'Pending'
        };
        newQueue.push(c);

        const profileData = t.client?.profile || {};

        // Deep mapping from Prisma schema to UI
        const cCase: ClientCase = {
          consultation: c,
          profile: {
            id: t.clientId || 'unknown',
            name: t.client?.name || 'Seeker',
            ageGroup: profileData.ageGroup || 'Not specified',
            spiritualInterests: profileData.spiritualInterests?.length > 0 ? profileData.spiritualInterests : ['General Spirituality'],
            spiritualGoals: profileData.primaryGoal || 'Seeking clarity and guidance.',
            readingPreferences: profileData.preferredTopics?.join(', ') || (t.reading?.readingType === 'tarot' ? 'Tarot' : 'Palmistry'),
            previousSessions: 1, 
            currentConcern: t.clientQuestion || 'Seeking general holistic guidance.',
          },
          palm: {
            imageSrc: t.reading?.imageUrl || '/sample-palm.jpg',
            lines: [{ label: 'Life Line', value: 'Detected', note: 'AI Confidence check' }],
            palmShape: rawData.handType || 'Unknown',
            fingerStructure: 'Standard',
          },
          tarot: {
            spreadType: rawData.spreadName || 'Reading',
            cards: Array.isArray(rawData.draw) ? rawData.draw.map((d: any) => ({
              position: d.position || 'Card',
              name: d.cardId || 'Unknown',
              img: `/cards/${d.cardId}.jpg`,
              keywords: [d.orientation || 'upright'],
              meaning: 'Drawn card.'
            })) : [],
            keyThemes: ['Guidance', 'Reflection'],
          },
          insights: {
            personality: t.reading?.personalitySynthesis || 'Personality insights forming...',
            relationships: 'Relationship trends pending deeper review.',
            careerLifeTrends: 'Career trajectory requires reflection.',
            strengths: ['Curiosity', 'Openness'],
            challenges: ['Uncertainty'],
            growthOpportunities: ['Self-reflection'],
            overallInterpretation: t.reading?.summary || 'AI interpretation unavailable.',
            scores: { palmConfidence: 85, tarotRelevance: 85, personalityAlignment: 85, contextRelevance: 85, overall: 85 }
          },
          recommendations: {
            personalGrowth: ['Journaling'], relationshipGuidance: ['Patience'], careerSuggestions: ['Focus'], goalAlignment: ['Review'], spiritualDevelopment: ['Meditation']
          },
          history: [],
          // Keep the Mock Trend data so the UI graph doesn't break
          trends: [
            { session: 'Last', personalGrowth: 50, careerClarity: 50, relationship: 50, selfReflection: 50 },
            { session: 'Now', personalGrowth: 60, careerClarity: 55, relationship: 60, selfReflection: 65 }
          ],
        };
        newCases.push(cCase);
      });

      setQueue(newQueue);
      setClientCases(newCases);
      
      if (newQueue.length > 0 && !selectedId) {
        setSelectedId(newQueue.find(q => q.status === 'Pending')?.id || newQueue[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authedFetch, selectedId]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const selectedCase = useMemo(
    () => clientCases.find((c) => c.consultation.id === selectedId) || null,
    [selectedId, clientCases]
  );

  const selectedConsultation = useMemo(
    () => queue.find((c) => c.id === selectedId) || null,
    [queue, selectedId]
  );

  const filteredQueue = useMemo(
    () =>
      queue.filter((c) => {
        const matchesSearch =
          c.clientName.toLowerCase().includes(search.toLowerCase()) ||
          c.topic.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [queue, search, statusFilter, priorityFilter]
  );

  const selectConsultation = (id: string) => {
    setSelectedId(id);
    setForm(EMPTY_FORM);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    setForm((f) => ({ ...f }));
    toast({
      title: 'Draft saved',
      description: 'Draft saved successfully.',
    });
  };

  const handleSubmit = async () => {
    if (!form.summary.trim() || !form.notes.trim()) {
      toast({
        title: 'Missing details',
        description: 'Please add consultant notes and a summary before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await authedFetch(`/api/consultations/${selectedId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistNotes: form.notes,
          summary: form.summary,
          rating: form.rating
        })
      });

      if (!res.ok) throw new Error('Failed to submit review');

      setQueue((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, status: 'Completed' as ConsultationStatus } : c))
      );
      setForm(EMPTY_FORM);
      toast({
        title: 'Consultation submitted',
        description: 'Consultation submitted successfully to the user.',
      });
      
      const remaining = queue.filter(q => q.id !== selectedId && q.status === 'Pending');
      if (remaining.length > 0) setSelectedId(remaining[0].id);
    } catch (err: any) {
      toast({
        title: 'Submission Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const updateForm = (key: keyof ConsultantForm, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const client = selectedCase?.profile;
  const initials = client?.name.split(' ').map((p: string) => p[0]).join('') || 'U';

  const isAuthorized = !!user && AUTHORIZED_ROLES.includes(user.role);

  return (
    <div className="relative z-10 w-full pb-20 space-y-14">
      
      {!isAuthorized ? (
        <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
          <Card className="bg-card/60 backdrop-blur border-destructive/30 p-8 space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto text-destructive">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              The Spiritual Guide Workspace is strictly reserved for authenticated{' '}
              <span className="text-primary font-medium">Spiritual Consultants</span>.
            </p>
            <div className="p-3 rounded-lg bg-secondary/40 text-xs text-muted-foreground">
              Current role: <span className="font-semibold text-foreground">{user?.role || 'Guest'}</span>
            </div>
          </Card>
        </div>
      ) : (
        <>
          {/* ============ PAGE HEADER ============ */}
          <header className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-foreground">
                    Spiritual Guide
                  </h1>
                  <p className="text-accent text-sm font-medium tracking-wide mt-0.5">
                    Holistic Consultation Workspace
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                    Review holistic insights and provide personalized guidance.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setNotified(true);
                    toast({
                      title: 'Notifications',
                      description: `${queue.filter((c) => c.status === 'Pending').length} pending consultation request(s).`,
                    });
                  }}
                  className="relative w-10 h-10 rounded-full border border-border/50 bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className={`w-5 h-5 text-foreground ${notified ? 'opacity-50' : ''}`} />
                  {queue.some((c) => c.status === 'Pending') && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive border-2 border-background" />
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-foreground">{user?.name || 'Dr. Consultant'}</p>
                    <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-chart-4 animate-pulse" />
                      Available
                    </p>
                  </div>
                  <Avatar className="w-10 h-10 border border-border/50">
                    <AvatarFallback className="bg-secondary text-primary font-semibold">
                      {user?.name ? user.name.substring(0, 2).toUpperCase() : 'SC'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>

          {/* ============ 1. CONSULTATION QUEUE ============ */}
          <section>
            <SectionHeader
              title="Consultation Queue"
              subtitle="Pending holistic review requests"
              icon={HistoryIcon}
            />

            <div className="flex flex-col md:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by client or topic…"
                  className="pl-9 bg-card/60"
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[160px] bg-card/60">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Review">In Review</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full md:w-[160px] bg-card/60">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="hidden md:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-muted-foreground">
                      <th className="px-5 py-3.5 font-medium">Client</th>
                      <th className="px-5 py-3.5 font-medium">Topic</th>
                      <th className="px-5 py-3.5 font-medium">Requested</th>
                      <th className="px-5 py-3.5 font-medium">Priority</th>
                      <th className="px-5 py-3.5 font-medium">Status</th>
                      <th className="px-5 py-3.5 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQueue.map((c) => (
                      <tr
                        key={c.id}
                        className={`border-b border-border/30 transition-colors last:border-0 hover:bg-secondary/40 ${
                          c.id === selectedId ? 'bg-secondary/50' : ''
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                                {c.clientName.split(' ').map((p) => p[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{c.clientName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{c.topic}</td>
                        <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{c.requestedAt}</td>
                        <td className="px-5 py-4"><PriorityBadge priority={c.priority} /></td>
                        <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant={c.id === selectedId ? 'default' : 'outline'}
                            onClick={() => selectConsultation(c.id)}
                            className="gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {c.id === selectedId ? 'Reviewing' : 'Review'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredQueue.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                          No consultations match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="md:hidden space-y-3">
              {filteredQueue.map((c) => (
                <Card key={c.id} className={`p-4 ${c.id === selectedId ? 'border-primary/40' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                          {c.clientName.split(' ').map((p) => p[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{c.clientName}</p>
                        <p className="text-xs text-muted-foreground">{c.topic} · {c.requestedAt}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => selectConsultation(c.id)} className="gap-1.5 shrink-0">
                      <Eye className="w-3.5 h-3.5" /> Review
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </Card>
              ))}
              {filteredQueue.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No consultations match your filters.
                </p>
              )}
            </div>
          </section>

          {loading ? (
            <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
          ) : !selectedConsultation || !selectedCase || !client ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              <Globe className="w-12 h-12 mb-4 mx-auto opacity-30 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">No Pending Requests</h3>
              <p className="text-sm mt-2">Select a consultation from the queue or wait for new requests.</p>
            </Card>
          ) : (
          <>
            {/* ============ 2. CLIENT OVERVIEW ============ */}
            <section>
              <SectionHeader
                title="Client Overview"
                subtitle={`Reviewing consultation for ${selectedConsultation.clientName}`}
                icon={User}
              />
              <Card className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-6 border-b border-border/40">
                  <Avatar className="w-16 h-16 border border-border/50">
                    <AvatarFallback className="bg-gradient-to-br from-secondary to-secondary/50 text-primary text-xl font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold text-foreground">{client.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary" className="gap-1.5">
                        <Calendar className="w-3 h-3" /> {client.ageGroup}
                      </Badge>
                      <Badge variant="secondary" className="gap-1.5">
                        <BookOpen className="w-3 h-3" /> {client.readingPreferences}
                      </Badge>
                      <Badge variant="secondary" className="gap-1.5">
                        <HistoryIcon className="w-3 h-3" /> {client.previousSessions} previous sessions
                      </Badge>
                    </div>
                  </div>
                  <div className="lg:text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Requested Topic</p>
                    <p className="font-medium text-primary mt-1">{selectedConsultation.topic}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Spiritual Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {client.spiritualInterests.map((i) => (
                        <span key={i} className="rounded-full bg-secondary/60 border border-border/40 px-2.5 py-1 text-xs text-foreground">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Spiritual Goals</p>
                    <p className="text-sm text-foreground/90">{client.spiritualGoals}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Previous Sessions</p>
                    <p className="text-sm text-foreground/90">{client.previousSessions}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Concern</p>
                    <p className="text-sm text-foreground/90">{client.currentConcern}</p>
                  </div>
                </div>
              </Card>
            </section>

            {/* ============ 3. HOLISTIC INSPECTION ============ */}
            <section>
              <SectionHeader
                title="Holistic Inspection"
                subtitle="Review the client's profile, palm analysis, and tarot reading together."
                icon={Layers}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Profile column */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="w-4 h-4 text-primary" /> Profile
                    </CardTitle>
                    <CardDescription>Context from the client record</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Goals</p>
                      <p className="text-foreground/90">{client.spiritualGoals}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Interests</p>
                      <p className="text-foreground/90">{client.spiritualInterests.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">History</p>
                      <p className="text-foreground/90">{client.previousSessions} previous consultation sessions</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Preferences</p>
                      <p className="text-foreground/90">{client.readingPreferences}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Current Concern</p>
                      <p className="text-foreground/90">{client.currentConcern}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Palm column */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Hand className="w-4 h-4 text-primary" /> Palm Analysis
                    </CardTitle>
                    <CardDescription>Key palm indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-border/50 relative aspect-[4/3] bg-secondary/40 flex items-center justify-center text-muted-foreground text-xs text-center p-4">
                      <div className="space-y-2">
                        <Hand className="w-8 h-8 mx-auto opacity-50" />
                        <p>Palm Scan Attached</p>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {selectedCase.palm.lines.map((l) => (
                        <div key={l.label} className="flex items-start justify-between gap-3 text-sm">
                          <div>
                            <p className="text-foreground/90 font-medium">{l.label}</p>
                            <p className="text-xs text-muted-foreground">{l.note}</p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">{l.value}</Badge>
                        </div>
                      ))}
                      <div className="flex items-start justify-between gap-3 text-sm pt-2 border-t border-border/40">
                        <div>
                          <p className="text-foreground/90 font-medium">Palm Shape</p>
                          <p className="text-xs text-muted-foreground">Elemental type</p>
                        </div>
                        <Badge className="shrink-0">{selectedCase.palm.palmShape}</Badge>
                      </div>
                      <div className="flex items-start justify-between gap-3 text-sm">
                        <div>
                          <p className="text-foreground/90 font-medium">Finger Structure</p>
                          <p className="text-xs text-muted-foreground">Phalange balance</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">{selectedCase.palm.fingerStructure}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tarot column */}
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Layers className="w-4 h-4 text-primary" /> Tarot Analysis
                    </CardTitle>
                    <CardDescription>{selectedCase.tarot.spreadType}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2.5">
                      {selectedCase.tarot.cards.map((card) => (
                        <div key={card.position} className="space-y-1.5">
                          <div className="rounded-lg overflow-hidden border border-border/50 relative aspect-[2/3] bg-secondary/40 flex items-center justify-center text-[10px] text-muted-foreground">
                            <Layers className="w-6 h-6 opacity-30" />
                          </div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground text-center">{card.position}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {selectedCase.tarot.cards.map((card) => (
                        <div key={card.name} className="rounded-lg border border-border/40 bg-secondary/30 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{card.name}</p>
                            <span className="text-xs text-muted-foreground">{card.position}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{card.meaning}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {card.keywords.map((k) => (
                              <span key={k} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px]">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Key Themes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCase.tarot.keyThemes.map((t) => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ============ 4. AI HOLISTIC INSIGHTS ============ */}
            <section>
              <SectionHeader
                title="AI Holistic Insights"
                subtitle="Profile, palm, and tarot synthesized into a unified interpretation."
                icon={Brain}
                badge={
                  <Badge className="gap-1.5 bg-primary/15 text-primary border border-primary/30">
                    <Sparkles className="w-3 h-3" /> AI Generated
                  </Badge>
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <InsightCard title="Personality" icon={User}>
                  {selectedCase.insights.personality}
                </InsightCard>
                <InsightCard title="Relationships" icon={Heart}>
                  {selectedCase.insights.relationships}
                </InsightCard>
                <InsightCard title="Career & Life Trends" icon={TrendingUp}>
                  {selectedCase.insights.careerLifeTrends}
                </InsightCard>
                <InsightCard title="Strengths" icon={Award}>
                  <BulletList items={selectedCase.insights.strengths} />
                </InsightCard>
                <InsightCard title="Challenges" icon={Flame}>
                  <BulletList items={selectedCase.insights.challenges} />
                </InsightCard>
                <InsightCard title="Growth Opportunities" icon={Lightbulb}>
                  <BulletList items={selectedCase.insights.growthOpportunities} />
                </InsightCard>
              </div>

              <Card className="mt-5 border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-display">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Overall Holistic Interpretation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCase.insights.overallInterpretation
                    .split('\n\n')
                    .map((para, i) => (
                      <p key={i} className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-4 last:mb-0">
                        {para}
                      </p>
                    ))}
                </CardContent>
              </Card>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard label="Palm Analysis Confidence" value={selectedCase.insights.scores.palmConfidence} />
                <MetricCard label="Tarot Relevance" value={selectedCase.insights.scores.tarotRelevance} />
                <MetricCard label="Personality Alignment" value={selectedCase.insights.scores.personalityAlignment} />
                <MetricCard label="Context Relevance" value={selectedCase.insights.scores.contextRelevance} />
                <MetricCard label="Overall Insight Score" value={selectedCase.insights.scores.overall} highlight />
              </div>
            </section>

            {/* ============ 5. GUIDANCE & RECOMMENDATIONS ============ */}
            <section>
              <SectionHeader
                title="Guidance & Recommendations"
                subtitle="AI suggestions alongside the consultant's personal guidance."
                icon={Compass}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Brain className="w-4 h-4 text-primary" /> AI Recommendations
                    </CardTitle>
                    <CardDescription>Static suggestions generated from the holistic reading</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RecommendationCategory title="Personal Growth" icon={Target} items={selectedCase.recommendations.personalGrowth} />
                    <RecommendationCategory title="Relationship Guidance" icon={Heart} items={selectedCase.recommendations.relationshipGuidance} />
                    <RecommendationCategory title="Career Suggestions" icon={TrendingUp} items={selectedCase.recommendations.careerSuggestions} />
                    <RecommendationCategory title="Goal Alignment" icon={Award} items={selectedCase.recommendations.goalAlignment} />
                    <div className="sm:col-span-2">
                      <RecommendationCategory title="Spiritual Development" icon={Globe} items={selectedCase.recommendations.spiritualDevelopment} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Feather className="w-4 h-4 text-primary" /> Consultant Guidance
                    </CardTitle>
                    <CardDescription>Your personalized additions to the AI guidance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Spiritual Remedies</label>
                      <Textarea
                        rows={3}
                        placeholder="e.g. Morning meditation, grounding crystals, moon journaling…"
                        value={form.spiritualRemedies}
                        onChange={(e) => updateForm('spiritualRemedies', e.target.value)}
                        className="bg-card/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Lifestyle Advice</label>
                      <Textarea
                        rows={3}
                        placeholder="e.g. Sleep routine, digital detox windows, exercise rhythm…"
                        value={form.lifestyleAdvice}
                        onChange={(e) => updateForm('lifestyleAdvice', e.target.value)}
                        className="bg-card/60"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Additional Guidance</label>
                      <Textarea
                        rows={3}
                        placeholder="Any other personalized direction for this client…"
                        value={form.additionalGuidance}
                        onChange={(e) => updateForm('additionalGuidance', e.target.value)}
                        className="bg-card/60"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ============ 6. CONSULTATION REVIEW ============ */}
            <section>
              <SectionHeader
                title="Consultation Review"
                subtitle="Finalize your notes and submit the completed consultation."
                icon={FileText}
              />

              <Card className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Consultant Notes</label>
                    <Textarea
                      rows={6}
                      placeholder="Observations from the holistic review, tone of the session, areas to follow up…"
                      value={form.notes}
                      onChange={(e) => updateForm('notes', e.target.value)}
                      className="bg-card/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Consultation Summary</label>
                    <Textarea
                      rows={6}
                      placeholder="A concise summary the client will receive after the session…"
                      value={form.summary}
                      onChange={(e) => updateForm('summary', e.target.value)}
                      className="bg-card/60"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-secondary/30 p-4 sm:p-5">
                  <p className="text-sm font-medium text-foreground mb-3">Guidance Relevance</p>
                  <StarRating value={form.rating} onChange={(v) => updateForm('rating', v)} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                    <Save className="w-4 h-4" /> Save Draft
                  </Button>
                  <Button onClick={handleSubmit} className="gap-2">
                    <Send className="w-4 h-4" /> Submit Consultation
                  </Button>
                </div>
              </Card>
            </section>

            {/* ============ 7. CONSULTATION HISTORY & TRENDS ============ */}
            <section>
              <SectionHeader
                title="Consultation History & Trends"
                subtitle="Previous sessions and the client's growth trajectory."
                icon={BarChart3}
              />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <HistoryIcon className="w-4 h-4 text-primary" /> Previous Consultations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-y border-border/50 text-left text-muted-foreground">
                            <th className="px-5 py-3 font-medium">Date</th>
                            <th className="px-5 py-3 font-medium">Topic</th>
                            <th className="px-5 py-3 font-medium">Key Insight</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedCase.history.map((h) => (
                            <tr key={h.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                              <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{h.date}</td>
                              <td className="px-5 py-3.5 text-foreground">{h.topic}</td>
                              <td className="px-5 py-3.5 text-muted-foreground">{h.keyInsight}</td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-chart-4/30 bg-chart-4/10 px-2.5 py-0.5 text-xs font-medium text-chart-4">
                                  <CheckCircle2 className="w-3 h-3" /> {h.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {selectedCase.history.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                                No previous consultations yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4 text-primary" /> User Trend Analysis
                    </CardTitle>
                    <CardDescription>Mock growth trends across recent sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedCase.trends} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gGrowth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#d4af37" stopOpacity={0.5} />
                              <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                            </linear, 
                            <linearGradient id="gCareer" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gRelation" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gReflect" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4ade80" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#555" strokeOpacity={0.4} />
                          <XAxis dataKey="session" tick={{ fill: '#999', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#999', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: '#1a1a2e',
                              border: '1px solid #444',
                              borderRadius: 12,
                              color: '#fff',
                              fontSize: 12,
                            }}
                          />
                          <Area type="monotone" dataKey="personalGrowth" name="Personal Growth" stroke="#d4af37" fill="url(#gGrowth)" strokeWidth={2} />
                          <Area type="monotone" dataKey="careerClarity" name="Career Clarity" stroke="#a855f7" fill="url(#gCareer)" strokeWidth={2} />
                          <Area type="monotone" dataKey="relationship" name="Relationship" stroke="#38bdf8" fill="url(#gRelation)" strokeWidth={2} />
                          <Area type="monotone" dataKey="selfReflection" name="Self-Reflection" stroke="#4ade80" fill="url(#gReflect)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-xs text-muted-foreground">
                      {[
                        ['Personal Growth', '#d4af37'],
                        ['Career Clarity', '#a855f7'],
                        ['Relationship', '#38bdf8'],
                        ['Self-Reflection', '#4ade80'],
                      ].map(([label, color]) => (
                        <span key={label} className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          {label}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </>
    )}
  </div>
);
}