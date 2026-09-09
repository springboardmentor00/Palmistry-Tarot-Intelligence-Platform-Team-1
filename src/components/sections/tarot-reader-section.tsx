'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Clock3,
  Eye,
  FileText,
  Inbox,
  Sparkles,
  User,
  Loader2,
  ShieldAlert,
  Layers,
  RefreshCw,
  FileEdit,
  ArrowRight
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth, useAuthedFetch } from '@/components/auth/auth-provider';

type ConsultationStatus = 'pending' | 'in-review' | 'completed';

type ConsultationCard = {
  name: string;
  orientation: 'Upright' | 'Reversed';
  position: string;
  symbol: string;
};

type Consultation = {
  id: string;
  clientName: string;
  question: string;
  spreadType: string;
  cards: ConsultationCard[];
  aiInterpretation: string;
  specialistNotes: string;
  status: ConsultationStatus;
  createdAt: string;
};

const AUTHORIZED_ROLES = ['tarot_reader', 'admin', 'Tarot Reader', 'Administrator'];

function ConsultationCardView({ card }: { card: ConsultationCard }) {
  const reversed = card.orientation === 'Reversed';

  return (
    <div className="flex flex-col">
      {card.position && (
        <div className="text-xs uppercase tracking-wider text-primary text-center mb-1.5 font-medium">
          {card.position}
        </div>
      )}
      <div
        className={cn(
          'relative aspect-[2/3.4] rounded-lg overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-secondary/80 via-background/80 to-secondary/60 p-3 flex flex-col items-center justify-between shadow-xl',
          reversed && 'tarot-reversed',
        )}
      >
        <div className="w-full text-center">
          <div className="text-[10px] uppercase tracking-wider text-primary/80 font-medium">
            Tarot
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-4xl md:text-5xl mb-2">{card.symbol}</div>
          <div className="font-display text-sm md:text-base font-bold leading-tight">
            {card.name}
          </div>
        </div>

        <div className="w-full text-center">
          <div
            className={cn(
              'inline-block text-[10px] px-2 py-0.5 rounded-full',
              reversed
                ? 'bg-destructive/20 text-destructive'
                : 'bg-primary/20 text-primary',
            )}
          >
            {card.orientation}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TarotReaderSection() {
  const { user } = useAuth();
  const authedFetch = useAuthedFetch();
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // 👇 --- INSERT THIS NEW STATS BLOCK --- 👇
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
  // 👆 ------------------------------------ 👆

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch('/api/consultations');
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();

      const formattedTickets: Consultation[] = data.map((t: any) => {
        let rawData: any = {};
        try { rawData = typeof t.reading?.rawData === 'string' ? JSON.parse(t.reading.rawData) : (t.reading?.rawData || {}); } catch(e) {}
        
        return {
          id: t.id,
          clientName: t.client?.name || 'Seeker',
          question: t.clientQuestion || 'Please interpret my recent draw.',
          spreadType: rawData.spreadName || 'Tarot Reading',
          cards: Array.isArray(rawData.draw) ? rawData.draw.map((d: any) => ({
            name: d.cardId ? d.cardId.replace('major-', '').replace('minor-', '').replace(/-/g, ' ').toUpperCase() : 'Card',
            orientation: d.orientation === 'reversed' ? 'Reversed' : 'Upright',
            position: d.position || 'Drawn Card',
            symbol: '✨'
          })) : [],
          aiInterpretation: t.reading?.personalitySynthesis || t.reading?.summary || 'No AI interpretation available.',
          specialistNotes: t.specialistNotes || '',
          status: t.status === 'Completed' ? 'completed' : 'pending',
          createdAt: t.createdAt,
        };
      });

      setConsultations(formattedTickets);
      
      const pending = formattedTickets.filter(c => c.status === 'pending');
      if (pending.length > 0 && !selectedId) {
        setSelectedId(pending[0].id);
        setNotes(pending[0].specialistNotes);
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

  const selected = consultations.find((item) => item.id === selectedId) ?? null;

  const openConsultation = (consultation: Consultation) => {
    setSelectedId(consultation.id);
    setNotes(consultation.specialistNotes);
  };

  const completeConsultation = async () => {
    if (!selected || selected.status === 'completed') return;
    if (!notes.trim()) {
      toast({ title: 'Error', description: 'Specialist notes cannot be empty.', variant: 'destructive' });
      return;
    }

    try {
      const res = await authedFetch(`/api/consultations/${selected.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          specialistNotes: notes, 
          summary: "A Tarot Specialist has finalized your reading.", 
          rating: 5 
        })
      });

      if (!res.ok) throw new Error("Failed to save review");

      setConsultations((current) =>
        current.map((consultation) =>
          consultation.id === selected.id
            ? { ...consultation, specialistNotes: notes, status: 'completed' as ConsultationStatus }
            : consultation,
        ),
      );

      toast({
        title: 'Review Completed',
        description: `${selected.clientName}'s consultation has been finalized.`,
      });
      
      const remaining = consultations.filter(c => c.id !== selected.id && c.status === 'pending');
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
        setNotes(remaining[0].specialistNotes);
      } else {
        setSelectedId(null);
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const pendingTickets = consultations.filter(
    (c) => c.status === 'pending' && c.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              This workspace is strictly reserved for authenticated <span className="text-primary font-medium">Tarot Readers</span>.
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
              <Layers className="w-5 h-5" />
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
                Tarot Reader Workspace
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
                      {loading ? 'Fetching tickets...' : `${consultations.filter(c => c.status === 'pending').length} pending consultations`}
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
                    <p className="text-xs max-w-[200px] mx-auto">No pending tarot consultations.</p>
                  </div>
                ) : (
                  pendingTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => openConsultation(ticket)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                        ticket.id === selectedId
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                          : 'border-border/50 bg-background/40 hover:border-primary/40 hover:bg-secondary/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-semibold text-primary">TAROT-{ticket.id.substring(0,6).toUpperCase()}</span>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">Pending</Badge>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                            {ticket.clientName}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(ticket.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </div>
                        <Button size="sm" variant={ticket.id === selectedId ? 'default' : 'secondary'} className="h-8 px-3 text-xs shrink-0">
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
            {!selected ? (
              <Card className="bg-card/60 backdrop-blur border-border/50 p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[450px]">
                <Layers className="w-12 h-12 mb-4 opacity-30 text-primary" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">No Consultation Selected</h3>
                <p className="text-xs max-w-sm">Select a pending consultation ticket from the queue on the left to begin reviewing.</p>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={selected.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* CLIENT DOSSIER */}
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            TAROT-{selected.id.substring(0,8).toUpperCase()}
                          </span>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">Pending</Badge>
                          <Badge variant="secondary" className="text-[11px] capitalize">{selected.spreadType}</Badge>
                        </div>
                        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          {selected.clientName}
                        </h2>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="font-display text-sm font-semibold">Client's Question</h3>
                      </div>
                      <p className="text-base leading-relaxed italic">&ldquo;{selected.question}&rdquo;</p>
                    </div>
                  </Card>

                  {/* DRAWN CARDS */}
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="w-4 h-4 text-primary" />
                      <h3 className="font-display text-lg font-semibold">Cards Drawn</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {selected.cards.map((card) => (
                        <ConsultationCardView key={`${card.position}-${card.name}`} card={card} />
                      ))}
                    </div>
                  </Card>

                  {/* AI SYNTHESIS */}
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">AI Interpretation</h3>
                        <p className="text-xs text-muted-foreground">Automated narrative baseline</p>
                      </div>
                    </div>
                    <div className="p-4.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                      <p className="text-sm leading-relaxed text-slate-200 font-normal whitespace-pre-line">
                        {selected.aiInterpretation}
                      </p>
                    </div>
                  </Card>

                  {/* SPECIALIST EDITOR */}
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <FileEdit className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">Specialist Review</h3>
                        <p className="text-xs text-muted-foreground">Add your intuitive guidance</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Add your interpretation, observations, and intuitive guidance..."
                        className="min-h-[160px] bg-background/50 border-border/60 focus:border-primary text-sm leading-relaxed"
                      />
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button onClick={completeConsultation} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 px-6 h-11 text-sm font-semibold shadow-lg shadow-primary/20">
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