'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Hand,
  Layers,
  Brain,
  Trash2,
  RefreshCw,
  Inbox,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';

interface PalmReadingRecord {
  id: string;
  handType: string;
  summary: string;
  lifeLine: string | null;
  heartLine: string | null;
  headLine: string | null;
  fateLine: string | null;
  createdAt: string;
}

interface TarotReadingRecord {
  id: string;
  spreadType: string;
  question: string | null;
  cardIds: string;
  cardOrientations: string;
  interpretation: string;
  summary: string;
  createdAt: string;
}

interface InsightRecord {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
}

interface HistoryData {
  user: { id: string; name: string };
  palmReadings: PalmReadingRecord[];
  tarotReadings: TarotReadingRecord[];
  insights: InsightRecord[];
}

export function HistorySection() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const authedFetch = useAuthedFetch();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authedFetch('/api/history');
      if (!res.ok) throw new Error('Failed to fetch history');
      const json = await res.json();
      setData(json);
    } catch (e) {
      toast({
        title: 'Failed to load history',
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

  const remove = async (type: 'palm' | 'tarot' | 'insight', id: string) => {
    try {
      const res = await authedFetch(`/api/history?type=${type}&id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast({ title: 'Deleted', description: 'Reading removed from history.' });
      load();
    } catch (e) {
      toast({
        title: 'Delete failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your history…</p>
      </div>
    );
  }

  if (!data) return null;

  const total = data.palmReadings.length + data.tarotReadings.length + data.insights.length;

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 mb-3">
          <History className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            History & Analytics Service
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          Your Reading History
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Every reading is persisted to the platform database. Revisit past
          insights, track your spiritual journey, and remove records you no
          longer need.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={load} className="border-border/50">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </header>

      {total === 0 ? (
        <Card className="bg-card/60 backdrop-blur border-border/50 p-12 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="font-display text-xl font-semibold mb-1">
            No readings yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete a palm or tarot reading to start building your history.
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="palm" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="palm">
              Palm ({data.palmReadings.length})
            </TabsTrigger>
            <TabsTrigger value="tarot">
              Tarot ({data.tarotReadings.length})
            </TabsTrigger>
            <TabsTrigger value="insights">
              Insights ({data.insights.length})
            </TabsTrigger>
          </TabsList>

          {/* Palm readings */}
          <TabsContent value="palm" className="mt-6 space-y-3">
            {data.palmReadings.length === 0 ? (
              <EmptyState text="No palm readings saved yet." />
            ) : (
              data.palmReadings.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                          <Hand className="w-4 h-4 text-rose-300" />
                        </div>
                        <div>
                          <div className="text-sm font-medium capitalize">
                            {r.handType} hand
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove('palm', r.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {r.summary}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                      {r.heartLine && (
                        <LineMini label="Heart" text={r.heartLine} />
                      )}
                      {r.headLine && <LineMini label="Head" text={r.headLine} />}
                      {r.lifeLine && <LineMini label="Life" text={r.lifeLine} />}
                      {r.fateLine && <LineMini label="Fate" text={r.fateLine} />}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Tarot readings */}
          <TabsContent value="tarot" className="mt-6 space-y-3">
            {data.tarotReadings.length === 0 ? (
              <EmptyState text="No tarot readings saved yet." />
            ) : (
              data.tarotReadings.map((r, i) => {
                const cards = JSON.parse(r.cardIds) as string[];
                const orientations = JSON.parse(r.cardOrientations) as boolean[];
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                            <Layers className="w-4 h-4 text-violet-300" />
                          </div>
                          <div>
                            <div className="text-sm font-medium capitalize">
                              {r.spreadType.replace(/-/g, ' ')} spread
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(r.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove('tarot', r.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      {r.question && (
                        <p className="text-xs italic text-muted-foreground mb-2">
                          Q: {r.question}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {cards.map((c, idx) => {
                          const id = c;
                          const name = id
                            .replace('major-', '')
                            .replace('minor-', '')
                            .replace(/-/g, ' ');
                          return (
                            <span
                              key={idx}
                              className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full',
                                orientations[idx]
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-destructive/20 text-destructive'
                              )}
                              title={orientations[idx] ? 'Upright' : 'Reversed'}
                            >
                              {name} {orientations[idx] ? '↑' : '↓'}
                            </span>
                          );
                        })}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {r.interpretation}
                      </p>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="mt-6 space-y-3">
            {data.insights.length === 0 ? (
              <EmptyState text="No insights synthesized yet." />
            ) : (
              data.insights.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Brain className="w-4 h-4 text-emerald-300" />
                        </div>
                        <div>
                          <div className="text-sm font-medium capitalize">
                            {r.type} · {r.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove('insight', r.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {r.content}
                    </p>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function LineMini({ label, text }: { label: string; text: string }) {
  return (
    <div className="p-2 rounded-md bg-background/40 border border-border/40">
      <div className="text-[10px] uppercase tracking-wider text-primary mb-0.5">
        {label}
      </div>
      <div className="text-muted-foreground line-clamp-2">{text}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="bg-card/40 border-border/50 p-10 text-center text-muted-foreground">
      <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">{text}</p>
    </Card>
  );
}
