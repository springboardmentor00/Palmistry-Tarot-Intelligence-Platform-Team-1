'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Inbox,
  Sparkles,
  User,
  Loader2,
  ShieldAlert
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  id: string; // Changed to string for PostgreSQL UUIDs
  clientName: string;
  question: string;
  spreadType: string;
  cards: ConsultationCard[];
  aiInterpretation: string;
  specialistNotes: string;
  status: ConsultationStatus;
  createdAt: string;
};

const STATUS_CONFIG: Record<
  ConsultationStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-400',
  },
  'in-review': {
    label: 'In Review',
    className: 'bg-blue-500/10 text-blue-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-400',
  },
};

function StatusBadge({ status }: { status: ConsultationStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'text-[10px] uppercase tracking-wider px-2 py-1 rounded-full',
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

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
        style={{
          backgroundImage:
            'radial-gradient(ellipse at top, oklch(0.55 0.18 290 / 0.3), transparent), radial-gradient(ellipse at bottom, oklch(0.6 0.16 320 / 0.2), transparent)',
        }}
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

        <div className="absolute top-1 left-1 text-primary/40 text-xs">✦</div>
        <div className="absolute top-1 right-1 text-primary/40 text-xs">✦</div>
        <div className="absolute bottom-1 left-1 text-primary/40 text-xs">✦</div>
        <div className="absolute bottom-1 right-1 text-primary/40 text-xs">✦</div>
      </div>
    </div>
  );
}

const AUTHORIZED_ROLES = ['tarot_reader', 'admin', 'Tarot Reader', 'Administrator'];

export function TarotReaderSection() {
  const { user } = useAuth();
  const authedFetch = useAuthedFetch();
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
          specialistNotes: t.specialistNotes ? JSON.parse(t.specialistNotes).notes : '',
          status: t.status === 'Completed' ? 'completed' : 'pending',
          createdAt: t.createdAt,
        };
      });

      setConsultations(formattedTickets);
      
      const pending = formattedTickets.filter(c => c.status === 'pending');
      if (pending.length > 0 && !selectedId) {
        setSelectedId(pending[0].id);
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

  const selected = consultations.find((item) => item.id === selectedId) ?? null;

  const openConsultation = (consultation: Consultation) => {
    setSelectedId(consultation.id);
    setNotes(consultation.specialistNotes);
  };

  const completeConsultation = async () => {
    if (!selected || selected.status === 'completed') return;

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
        title: 'Consultation completed',
        description: `${selected.clientName}'s consultation has been sent to their inbox.`,
      });
      
      // Select next pending ticket
      const remaining = consultations.filter(c => c.id !== selected.id && c.status === 'pending');
      if (remaining.length > 0) setSelectedId(remaining[0].id);

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const pendingCount = consultations.filter((c) => c.status === 'pending').length;
  const inReviewCount = consultations.filter((c) => c.status === 'in-review').length;
  const completedCount = consultations.filter((c) => c.status === 'completed').length;

  const isAuthorized = !!user && AUTHORIZED_ROLES.includes(user.role);

  if (!isAuthorized) {
    return (
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
    );
  }

  if (loading) {
    return <div className="py-32 text-center"><Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Specialist Workspace
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
            <User className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Tarot Reader</span>
          </div>
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          Tarot Reader Workspace
        </h1>

        <p className="text-muted-foreground max-w-2xl">
          Review consultations, interpret the spread, and add your intuitive
          guidance.
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Pending
              </p>
              <p className="font-display text-3xl font-bold">{pendingCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                In Review
              </p>
              <p className="font-display text-3xl font-bold">{inReviewCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Completed
              </p>
              <p className="font-display text-3xl font-bold">{completedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Queue — left column */}
        <Card className="bg-card/60 backdrop-blur border-border/50 overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h2 className="font-display text-xl font-semibold">
              Consultation Queue
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select a consultation to inspect the spread and provide guidance.
            </p>
          </div>

          <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto">
            {consultations.map((consultation) => (
              <button
                key={consultation.id}
                type="button"
                onClick={() => openConsultation(consultation)}
                className={cn(
                  'w-full text-left p-4 transition-colors hover:bg-secondary/30',
                  selectedId === consultation.id && 'bg-secondary/40 border-l-2 border-l-primary',
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{consultation.clientName}</h3>
                  <StatusBadge status={consultation.status} />
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {consultation.question}
                </p>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-muted-foreground">
                  <span>{consultation.spreadType}</span>
                  <span>·</span>
                  <span>{consultation.cards.length} cards</span>
                  <span>·</span>
                  <span>{format(new Date(consultation.createdAt), 'MMM d, h:mm a')}</span>
                </div>
              </button>
            ))}
            {consultations.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No consultations in queue.
              </div>
            )}
          </div>
        </Card>

        {/* Detail — right column */}
        <div className="space-y-4">
          {!selected ? (
            <Card className="bg-card/60 backdrop-blur border-border/50 p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Inbox className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                No consultation selected
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Choose a consultation from the queue to review the spread and add
                your guidance.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">
                      {selected.clientName}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selected.spreadType}
                    </p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-sm font-semibold">
                      Client&apos;s Question
                    </h3>
                  </div>
                  <p className="text-base leading-relaxed italic">
                    &ldquo;{selected.question}&rdquo;
                  </p>
                </div>
              </Card>

              <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">
                  Cards Drawn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selected.cards.map((card) => (
                    <ConsultationCardView
                      key={`${card.position}-${card.name}`}
                      card={card}
                    />
                  ))}
                </div>
              </Card>

              <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-lg font-semibold">
                    AI Interpretation
                  </h3>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-5">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {selected.aiInterpretation}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  AI-assisted interpretation
                </p>
              </Card>

              <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-lg font-semibold">
                    Specialist Notes &amp; Intuitive Guidance
                  </h3>
                </div>

                {selected.status === 'completed' ? (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-background/40 border border-border/50 p-4 min-h-[120px]">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selected.specialistNotes || 'No notes were added.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium text-sm">Consultation Completed</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Add your interpretation, observations, intuitive guidance, and any context the client should receive..."
                      className="min-h-[160px] bg-background/40 border-border/50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {notes.length} characters
                    </p>
                    <div className="flex justify-end">
                      <Button
                        onClick={completeConsultation}
                        className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Consultation
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}