'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Sparkles,
  Loader2,
  RotateCcw,
  RefreshCw,
  BookOpen,
  Wand2,
  ArrowRight,
  Undo2,
  ClipboardList,
} from 'lucide-react';
import { TarotReaderSection } from '@/components/sections/tarot-reader-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';
import {
  SPREADS,
  type SpreadDefinition,
  type CardOrientation,
  type TarotCard,
} from '@/lib/tarot';

interface DrawnCard {
  card: TarotCard;
  orientation: CardOrientation;
  position: string;
}

interface TarotSectionProps {
  onReadingComplete: (r: {
    type: 'tarot';
    summary: string;
    content: string;
  }) => void;
}

type Phase = 'select' | 'drawing' | 'reveal' | 'interpreting' | 'interpreted';
type TarotView = 'reading' | 'workspace';

export function TarotSection({ onReadingComplete }: TarotSectionProps) {
  const [view, setView] = useState<TarotView>('reading');
  const [phase, setPhase] = useState<Phase>('select');
  const [spread, setSpread] = useState<SpreadDefinition | null>(null);
  const [question, setQuestion] = useState('');
  const [draw, setDraw] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [interpretSummary, setInterpretSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const authedFetch = useAuthedFetch();

  const reset = () => {
    setPhase('select');
    setSpread(null);
    setQuestion('');
    setDraw([]);
    setInterpretation('');
    setInterpretSummary('');
    setError(null);
  };

  const startDraw = async (selectedSpread: SpreadDefinition) => {
    setSpread(selectedSpread);
    setPhase('drawing');
    setError(null);
    setDraw([]);
    setInterpretation('');
    setInterpretSummary('');

    try {
      // Slight delay for shuffle animation
      await new Promise((r) => setTimeout(r, 1100));
      const res = await fetch('/api/tarot/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadId: selectedSpread.id }),
      });
      if (!res.ok) {
        throw new Error('Failed to draw cards');
      }
      const data = await res.json();
      const drawn: DrawnCard[] = data.draw.map((d: any) => {
        const card: TarotCard = {
          id: d.cardId,
          name: d.cardName,
          arcana: d.arcana,
          suit: d.suit,
          number: 0,
          element: '',
          keywords: d.keywords,
          upright: d.upright,
          reversed: d.reversed,
          symbol: d.symbol,
          fortune: '',
        };
        return {
          card,
          orientation: d.orientation as CardOrientation,
          position: d.position,
        };
      });
      setDraw(drawn);
      setPhase('reveal');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setPhase('select');
    }
  };

  const interpret = async () => {
    if (!spread || draw.length === 0) return;
    setPhase('interpreting');
    setError(null);
    try {
      const res = await authedFetch('/api/tarot/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadId: spread.id,
          spreadName: spread.name,
          question: question || undefined,
          draw: draw.map((d) => ({
            cardId: d.card.id,
            orientation: d.orientation,
            position: d.position,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || 'Failed to interpret');
      }
      const data = await res.json();
      setInterpretation(data.interpretation);
      setInterpretSummary(data.summary);
      setPhase('interpreted');
      onReadingComplete({
        type: 'tarot',
        summary: data.summary,
        content: data.interpretation,
      });
      toast({
        title: 'Reading complete',
        description: 'Your tarot interpretation is ready.',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setPhase('reveal');
      toast({
        title: 'Interpretation failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const redraw = () => {
    if (spread) startDraw(spread);
  };

  if (view === 'workspace') {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-border/50 bg-card/40 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('reading')}
              className="text-muted-foreground"
            >
              <Layers className="w-4 h-4 mr-2" />
              Tarot Reading
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Reader Workspace
            </Button>
          </div>
        </div>
        <TarotReaderSection />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 mb-3">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Tarot Reading Service
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          AI Tarot Reading
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose a spread, draw from the 78-card Rider-Waite deck, and let the
          AI weave a narrative interpretation of the cards in their positions.
        </p>

        <div className="flex justify-center mt-6">
          <div className="inline-flex rounded-lg border border-border/50 bg-card/40 p-1">
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <Layers className="w-4 h-4 mr-2" />
              Tarot Reading
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('workspace')}
              className="text-muted-foreground"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Reader Workspace
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* Phase 1: Select spread */}
        {phase === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SPREADS.map((s) => (
                <Card
                  key={s.id}
                  className="bg-card/60 backdrop-blur border-border/50 hover:border-primary/50 transition-all p-5 cursor-pointer group"
                  onClick={() => startDraw(s)}
                >
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-display text-lg font-semibold mb-1">
                    {s.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {s.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/70 text-muted-foreground">
                      {s.cardCount} card{s.cardCount > 1 ? 's' : ''}
                    </span>
                    <span className="text-primary text-sm flex items-center group-hover:translate-x-1 transition-transform">
                      Draw <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="bg-card/40 border-border/50 p-5">
              <label className="text-sm font-medium mb-2 block">
                Optional: Ask a question
              </label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What energy should I focus on this month?"
                className="bg-background/40 border-border/50 min-h-[80px] resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-2">
                If you provide a question, the AI will weave it into the
                interpretation. Otherwise, the reading offers general guidance.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Phase 2: Drawing (shuffle) */}
        {phase === 'drawing' && (
          <motion.div
            key="drawing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 text-center"
          >
            <div className="relative w-48 h-64 mx-auto">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-xl border border-primary/40 bg-gradient-to-br from-secondary/80 to-background/80 shadow-xl"
                  style={{
                    transformOrigin: 'bottom center',
                  }}
                  animate={{
                    rotate: [
                      i * 4 - 8,
                      i * 4 + 8,
                      i * 4 - 8,
                    ],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                >
                  <div className="h-full w-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary/60" />
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="font-display text-xl mt-8 mb-2">Shuffling the deck…</p>
            <p className="text-sm text-muted-foreground">
              Drawing {spread?.cardCount} card{spread && spread.cardCount > 1 ? 's' : ''} for the{' '}
              {spread?.name}
            </p>
          </motion.div>
        )}

        {/* Phase 3: Reveal */}
        {(phase === 'reveal' ||
          phase === 'interpreting' ||
          phase === 'interpreted') && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                  <span>{spread?.icon}</span>
                  {spread?.name}
                </h2>
                {question && (
                  <p className="text-sm text-muted-foreground italic mt-1">
                    &ldquo;{question}&rdquo;
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redraw}
                  disabled={phase === 'interpreting'}
                  className="border-border/50"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Redraw
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  disabled={phase === 'interpreting'}
                >
                  <Undo2 className="w-3.5 h-3.5 mr-1.5" />
                  New spread
                </Button>
              </div>
            </div>

            {/* Cards */}
            <div
              className={cn(
                'grid gap-3',
                draw.length === 1 && 'grid-cols-1 max-w-xs mx-auto',
                draw.length === 3 && 'grid-cols-1 sm:grid-cols-3',
                draw.length === 10 && 'grid-cols-2 sm:grid-cols-5'
              )}
            >
              {draw.map((d, i) => (
                <TarotCardView key={i} drawn={d} index={i} />
              ))}
            </div>

            {/* Interpretation */}
            <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-display text-lg font-semibold">
                  AI Interpretation
                </h3>
              </div>

              {!interpretation && phase !== 'interpreting' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    The cards have been drawn. When you&apos;re ready, invoke
                    the AI to weave a narrative interpretation across all{' '}
                    {draw.length} positions.
                  </p>
                  <Button
                    onClick={interpret}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Interpretation
                  </Button>
                </div>
              )}

              {phase === 'interpreting' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Weaving the narrative…
                  </div>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 rounded shimmer"
                      style={{ width: `${90 - i * 15}%` }}
                    />
                  ))}
                </div>
              )}

              {interpretation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <p className="text-sm italic text-foreground/90">
                      {interpretSummary}
                    </p>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {interpretation.split('\n').map((line, i) => (
                      <p
                        key={i}
                        className="text-sm text-muted-foreground leading-relaxed mb-3 whitespace-pre-wrap"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={interpret}
                    className="border-border/50"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Re-interpret
                  </Button>
                </motion.div>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                  {error}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TarotCardView({
  drawn,
  index,
}: {
  drawn: DrawnCard;
  index: number;
}) {
  const { card, orientation, position } = drawn;
  const reversed = orientation === 'reversed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: 'easeOut',
      }}
      className="flex flex-col"
    >
      <div className="text-xs uppercase tracking-wider text-primary text-center mb-1.5 font-medium">
        {position}
      </div>
      <div
        className={cn(
          'relative aspect-[2/3.4] rounded-lg overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-secondary/80 via-background/80 to-secondary/60 p-3 flex flex-col items-center justify-between shadow-xl',
          reversed && 'tarot-reversed'
        )}
        style={{
          backgroundImage:
            'radial-gradient(ellipse at top, oklch(0.55 0.18 290 / 0.3), transparent), radial-gradient(ellipse at bottom, oklch(0.6 0.16 320 / 0.2), transparent)',
        }}
      >
        <div className="w-full text-center">
          <div className="text-[10px] uppercase tracking-wider text-primary/80 font-medium">
            {card.arcana === 'major' ? 'Major Arcana' : card.suit}
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
                : 'bg-primary/20 text-primary'
            )}
          >
            {orientation}
          </div>
        </div>

        {/* decorative corner stars */}
        <div className="absolute top-1 left-1 text-primary/40 text-xs">✦</div>
        <div className="absolute top-1 right-1 text-primary/40 text-xs">✦</div>
        <div className="absolute bottom-1 left-1 text-primary/40 text-xs">✦</div>
        <div className="absolute bottom-1 right-1 text-primary/40 text-xs">✦</div>
      </div>
      <div className="mt-2 text-[11px] text-center text-muted-foreground leading-snug px-1">
        {card.keywords.slice(0, 3).join(' · ')}
      </div>
    </motion.div>
  );
}
