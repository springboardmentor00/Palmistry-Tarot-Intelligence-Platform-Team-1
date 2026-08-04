'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Loader2,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Heart,
  Wand2,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const DEMO_USER_ID = 'demo-user';

interface InsightResult {
  personality: { title: string; content: string };
  trends: { title: string; content: string };
  recommendations: { title: string; content: string };
  affirmation: string;
}

interface InsightsSectionProps {
  readings: { type: 'palm' | 'tarot'; summary: string; content: string }[];
}

export function InsightsSection({ readings }: InsightsSectionProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InsightResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generate = async () => {
    if (readings.length === 0) {
      toast({
        title: 'No readings yet',
        description:
          'Complete a palm reading or tarot reading first to synthesize insights.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readings, userId: DEMO_USER_ID }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || 'Failed to generate insights');
      }
      const data = (await res.json()) as InsightResult;
      setResult(data);
      toast({
        title: 'Insights synthesized',
        description: 'Your personalized insight report is ready.',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      toast({
        title: 'Synthesis failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 mb-3">
          <Brain className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            AI Interpretation Service
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          Synthesized Insights
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The AI takes all your completed palm and tarot readings and weaves
          them into a holistic insight report: personality profile, life trends,
          recommendations, and an affirmation.
        </p>
      </header>

      {/* Source readings */}
      <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Source Readings
          </h2>
          <span className="text-sm text-muted-foreground">
            {readings.length} reading{readings.length !== 1 ? 's' : ''} this
            session
          </span>
        </div>

        {readings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              No readings yet this session. Visit the{' '}
              <span className="text-primary">Palm Reading</span> or{' '}
              <span className="text-primary">Tarot Reading</span> tab to begin.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {readings.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-background/40 border border-border/50 flex items-start gap-3"
              >
                <div
                  className={
                    'text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ' +
                    (r.type === 'palm'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-violet-500/20 text-violet-300')
                  }
                >
                  {r.type}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {r.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={generate}
          disabled={loading || readings.length === 0}
          size="lg"
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 h-12 px-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Synthesizing insights…
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Insight Report
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-4"
          >
            <InsightCard
              icon={Brain}
              title={result.personality.title}
              content={result.personality.content}
              accent="from-violet-500/20 to-fuchsia-500/10"
              iconColor="text-violet-300"
            />
            <InsightCard
              icon={TrendingUp}
              title={result.trends.title}
              content={result.trends.content}
              accent="from-emerald-500/20 to-teal-500/10"
              iconColor="text-emerald-300"
            />
            <InsightCard
              icon={Lightbulb}
              title={result.recommendations.title}
              content={result.recommendations.content}
              accent="from-amber-500/20 to-orange-500/10"
              iconColor="text-amber-300"
            />

            <Card className="md:col-span-3 bg-gradient-to-br from-primary/15 to-accent/15 border-primary/30 p-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/60 mb-3">
                <Heart className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs uppercase tracking-wider text-primary">
                  Your Affirmation
                </span>
              </div>
              <p className="font-display text-xl md:text-2xl italic text-foreground">
                &ldquo;{result.affirmation}&rdquo;
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  content,
  accent,
  iconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string;
  accent: string;
  iconColor: string;
}) {
  return (
    <Card
      className={`relative overflow-hidden bg-card/60 backdrop-blur border-border/50 p-6`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-50 pointer-events-none`}
      />
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-background/60 border border-border/50 flex items-center justify-center mb-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {content}
        </p>
      </div>
    </Card>
  );
}
