'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  History,
  Hand,
  Layers,
  Trash2,
  RefreshCw,
  Inbox,
  Loader2,
  Sparkles,
  ChevronRight,
  Search,
  UserCheck,
  Calendar,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';

// ... (Interfaces remain exactly the same)
interface PalmReadingRecord {
  id: string;
  handType: string;
  summary: string;
  personalitySynthesis: string;
  lines: Record<string, { detected: boolean; confidence: number; points: number[][] }>;
  imageUrl?: string | null;
  createdAt: string;
}

interface TarotCardDraw {
  cardId: string;
  orientation: 'upright' | 'reversed';
  position: string;
}

interface TarotReadingRecord {
  id: string;
  spreadType: string;
  question: string | null;
  draw: TarotCardDraw[];
  interpretation: string;
  summary: string;
  createdAt: string;
}

interface InsightRecord {
  id: string;
  type: 'insight';
  question: string | null;
  summary: string;
  interpretation: string;
  createdAt: string;
}

interface HistoryData {
  user: { id: string; name: string };
  palmReadings: PalmReadingRecord[];
  tarotReadings: TarotReadingRecord[];
  insights: any[];
}

export function HistorySection() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReading, setSelectedReading] = useState<{
    type: 'palm' | 'tarot' | 'insight';
    data: PalmReadingRecord | TarotReadingRecord | InsightRecord;
  } | null>(null);

  const [requestingReview, setRequestingReview] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [clientQuestion, setClientQuestion] = useState('');

  const { toast } = useToast();
  const authedFetch = useAuthedFetch();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch('/api/history');
      if (!res.ok) throw new Error('Failed to load history');
      const json = await res.json();
      setData(json);
    } catch (e) {
      toast({
        title: 'Error loading history',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, authedFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await authedFetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast({ title: 'Removed', description: 'Reading archived from history.' });
      load();
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleRequestReview = async () => {
    if (!selectedReading) return;
    setRequestingReview(true);

    try {
      // SURGICAL ROUTING LOGIC
      let specialistType = 'spiritual_consultant';

      if (selectedReading.type === 'palm') {
        specialistType = 'palm_reader';
      } else if (selectedReading.type === 'tarot') {
        specialistType = 'tarot_reader';
      }

      const res = await authedFetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readingId: selectedReading.data.id,
          specialistType: specialistType,
          clientQuestion: clientQuestion || "Please review my reading.", // Uses user's typed question
        }),
      });

      if (!res.ok) throw new Error('Failed to submit consultation request');

      toast({
        title: 'Sent to Specialist!',
        description: 'Your reading is in the review queue. Check the Consultations tab.',
      });
      
      // Reset everything on success
      setSelectedReading(null); 
      setIsReviewMode(false);
      setClientQuestion('');
    } catch (e: any) {
      toast({
        title: 'Request Failed',
        description: e.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRequestingReview(false);
    }
  };

  const filteredTarot = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data.tarotReadings;
    const term = searchTerm.toLowerCase();
    return data.tarotReadings.filter(
      (r) =>
        r.spreadType.toLowerCase().includes(term) ||
        (r.question && r.question.toLowerCase().includes(term)) ||
        r.summary.toLowerCase().includes(term) ||
        r.interpretation.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const filteredPalm = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data.palmReadings;
    const term = searchTerm.toLowerCase();
    return data.palmReadings.filter(
      (r) =>
        r.handType.toLowerCase().includes(term) ||
        r.summary.toLowerCase().includes(term) ||
        r.personalitySynthesis.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const filteredInsights = useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data.insights;
    const term = searchTerm.toLowerCase();
    return data.insights.filter(
      (r) =>
        r.type.toLowerCase().includes(term) ||
        r.summary.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading reading archives…</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 mb-1">
          <History className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Reading Vault & History
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Your Spiritual Timeline</h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Review saved readings, inspect detected palm line features, and request human specialist reviews.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search readings..."
              className="pl-8 h-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={load} className="h-9">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </header>

      <Tabs defaultValue="tarot" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-xs mx-auto">
          <TabsTrigger value="tarot">Tarot ({filteredTarot.length})</TabsTrigger>
          <TabsTrigger value="palm">Palmistry ({filteredPalm.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({filteredInsights.length})</TabsTrigger>
        </TabsList>

        {/* TAROT READINGS LIST - FIXED SPACING */}
        <TabsContent value="tarot" className="mt-6 space-y-3">
          {filteredTarot.length === 0 ? (
            <EmptyState text={searchTerm ? 'No matching tarot readings found.' : 'No tarot readings saved yet.'} />
          ) : (
            filteredTarot.map((r) => (
              <Card
                key={r.id}
                onClick={() => setSelectedReading({ type: 'tarot', data: r })}
                className="p-4 cursor-pointer hover:bg-accent/40 transition flex flex-row items-center justify-between border-border/50 group w-full"
              >
                <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm capitalize truncate">{r.spreadType}</h4>
                      {r.question && (
                        <Badge variant="outline" className="text-[10px] font-normal py-0 shrink-0">
                          Q: {r.question.slice(0, 20)}...
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{r.summary}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground/80">
                      <Calendar className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-1 shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => remove(r.id, e)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* PALM READINGS LIST - FIXED SPACING */}
        <TabsContent value="palm" className="mt-6 space-y-3">
          {filteredPalm.length === 0 ? (
            <EmptyState text={searchTerm ? 'No matching palm readings found.' : 'No palm readings saved yet.'} />
          ) : (
            filteredPalm.map((r) => (
              <Card
                key={r.id}
                onClick={() => setSelectedReading({ type: 'palm', data: r })}
                className="p-4 cursor-pointer hover:bg-accent/40 transition flex flex-row items-center justify-between border-border/50 group w-full"
              >
                <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                    <Hand className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm capitalize truncate">{r.handType} Hand Scan</h4>
                      <Badge variant="secondary" className="text-[10px] font-normal py-0 shrink-0">
                        {Object.values(r.lines).filter((l) => l.detected).length} lines detected
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{r.summary}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground/80">
                      <Calendar className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-1 shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => remove(r.id, e)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="insights" className="mt-6 space-y-3">
          {filteredInsights.length === 0 ? (
            <EmptyState text={searchTerm ? 'No matching insights found.' : 'No reading insights found in the archive.'} />
          ) : (
            filteredInsights.map((r: any) => (
              <Card
                key={r.id}
                onClick={() => setSelectedReading({ type: 'insight', data: r })}
                className="p-4 cursor-pointer hover:bg-accent/40 transition flex flex-row items-center justify-between border-border/50 group w-full"
              >
                <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm capitalize truncate">Holistic Insight</h4>
                      {r.question && (
                        <Badge variant="outline" className="text-[10px] font-normal py-0 shrink-0">
                          Q: {r.question.slice(0, 20)}...
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5 line-clamp-1">{r.interpretation}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground/80">
                      <Calendar className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-1 shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => remove(r.id, e)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* DEEP DIVE MODAL */}
      <Dialog 
        open={!!selectedReading} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReading(null);
            setIsReviewMode(false);
            setClientQuestion('');
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedReading && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  {selectedReading.type === 'tarot' ? (
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">Tarot Reading</Badge>
                  ) : (
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">Palmistry Analysis</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(selectedReading.data.createdAt).toLocaleString()}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-bold">
                  {selectedReading.type === 'tarot'
                    ? (selectedReading.data as TarotReadingRecord).spreadType
                    : selectedReading.type === 'insight'
                    ? 'Holistic Insight'
                    : `${(selectedReading.data as PalmReadingRecord).handType} Hand Scan`}
                </DialogTitle>
                <DialogDescription>
                  {(selectedReading.type === 'tarot' || selectedReading.type === 'insight') && (selectedReading.data as TarotReadingRecord | InsightRecord).question ? (
                    <span className="flex items-center gap-1.5 text-xs italic text-foreground/80">
                      <HelpCircle className="w-3.5 h-3.5 text-primary" />
                      Inquiry: &quot;{(selectedReading.data as TarotReadingRecord | InsightRecord).question}&quot;
                    </span>
                  ) : (
                    selectedReading.data.summary
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">

                {/* TAROT SPECIFIC: CARD IMAGES & SPREAD */}
                {selectedReading.type === 'tarot' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      The Spread
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(selectedReading.data as TarotReadingRecord).draw.map((d, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 bg-secondary/20 p-3 rounded-xl border border-border/50">
                          <div className="text-[10px] text-muted-foreground uppercase font-semibold text-center h-4">
                            {d.position}
                          </div>
                          {/* CARD IMAGE FRAME */}
                          <div className="relative w-full max-w-[120px] aspect-[1/1.7] rounded-lg overflow-hidden border border-border shadow-md bg-muted">
                            <img
                              src={`/cards/${d.cardId}.jpg`}
                              alt={d.cardId}
                              className={cn(
                                "w-full h-full object-cover transition-transform duration-500",
                                d.orientation === 'reversed' && "rotate-180"
                              )}
                              onError={(e) => {
                                // Fallback if image isn't placed in public/tarot/ yet
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', `<span class="text-xs text-muted-foreground p-2 text-center">${d.cardId}</span>`);
                              }}
                            />
                          </div>
                          <div className="text-center mt-1">
                            <div className="font-medium text-sm capitalize leading-tight">
                              {d.cardId.replace('major-', '').replace('minor-', '').replace(/-/g, ' ')}
                            </div>
                            <Badge
                              variant={d.orientation === 'upright' ? 'default' : 'destructive'}
                              className="mt-1.5 text-[10px] h-4 py-0"
                            >
                              {d.orientation === 'upright' ? 'Upright ↑' : 'Reversed ↓'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PALM SPECIFIC: IMAGE + STATS LAYOUT */}
                {selectedReading.type === 'palm' && (
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* LEFT COLUMN: PALM PHOTO */}
                    <div className="w-full md:w-1/3 aspect-[3/4] bg-secondary/30 rounded-xl overflow-hidden border border-border/50 flex flex-col items-center justify-center shrink-0 shadow-inner relative">
                      {(selectedReading.data as PalmReadingRecord).imageUrl ? (
                        <img
                          src={(selectedReading.data as PalmReadingRecord).imageUrl!}
                          alt="Palm Scan"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground p-6 text-center">
                          <ImageIcon className="w-10 h-10 opacity-20" />
                          <span className="text-xs opacity-60">Image not saved for this legacy scan. New scans will appear here.</span>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: LINE CONFIDENCES */}
                    <div className="flex-1 space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Detected Features
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries((selectedReading.data as PalmReadingRecord).lines).map(([name, val]) => {
                          const label = name.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                          const pct = Math.round((val.confidence || 0) * 100);
                          return (
                            <div key={name} className="p-3 rounded-lg border border-border/60 bg-secondary/20">
                              <div className="text-[11px] text-muted-foreground">{label}</div>
                              <div className="flex items-center justify-between mt-1">
                                <span className={cn('text-sm font-semibold', val.detected ? 'text-primary' : 'text-muted-foreground')}>
                                  {val.detected ? `${pct}%` : 'Not Detected'}
                                </span>
                                {val.detected && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {val.points.length} pts
                                  </span>
                                )}
                              </div>
                              <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                  className={cn('h-full rounded-full', val.detected ? 'bg-primary' : 'bg-muted')}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI SYNTHESIS / INTERPRETATION */}
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    AI Holistic Interpretation
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
                    {selectedReading.type === 'tarot'
                      ? (selectedReading.data as TarotReadingRecord).interpretation
                      : selectedReading.type === 'insight'
                      ? (selectedReading.data as InsightRecord).interpretation
                      : (selectedReading.data as PalmReadingRecord).personalitySynthesis}
                  </div>
                </div>

                {/* ACTION: CONSULTATION TRIGGER */}
                <div className="pt-4 border-t border-border/50">
                  {!isReviewMode ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground text-center sm:text-left">
                        Want a human expert to deeply analyze these results?
                      </span>
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs w-full sm:w-auto"
                        onClick={() => {
                          // Pre-fill the input if it's a tarot reading with an existing question
                          const existingQ = (selectedReading.data as any).question;
                          setClientQuestion(existingQ || '');
                          setIsReviewMode(true);
                        }}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Request Specialist Review
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        What would you like to ask the specialist?
                      </label>
                      <Input
                        value={clientQuestion}
                        onChange={(e) => setClientQuestion(e.target.value)}
                        placeholder="e.g., Can you provide more clarity on the second card?"
                        className="text-sm bg-background/50"
                        disabled={requestingReview}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsReviewMode(false)}
                          disabled={requestingReview}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleRequestReview}
                          disabled={requestingReview || !clientQuestion.trim()}
                          className="bg-primary text-primary-foreground"
                        >
                          {requestingReview ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          {requestingReview ? 'Sending...' : 'Confirm & Send'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="p-12 text-center text-muted-foreground border-dashed border border-border/60 bg-card/40">
      <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">{text}</p>
    </Card>
  );
}