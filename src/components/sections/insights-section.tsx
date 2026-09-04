'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Loader2,
  Sparkles,
  MessageCircle,
  Send,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthedFetch } from '@/components/auth/auth-provider';

interface InsightsSectionProps {
  readings: { type: 'palm' | 'tarot'; summary: string; content: string }[];
}

export function InsightsSection({ readings }: InsightsSectionProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const authedFetch = useAuthedFetch();

  const askGuide = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      // We ONLY send the question. The backend fetches the past 7 days of context securely.
      const res = await authedFetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed' }));
        throw new Error(err.detail || 'Failed to consult the guide');
      }
      
      const data = await res.json();
      setAnswer(data.answer);
      
      toast({
        title: 'Guidance Received',
        description: 'Your spiritual guide has answered.',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      toast({
        title: 'Connection failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 mb-3">
          <Brain className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Spiritual Intelligence Guide
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          Ask Your Guide
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          The AI remembers the past 7 days of your Palm and Tarot readings. 
          Ask a specific question about your life path, and it will answer using your history as context.
        </p>
      </header>

      {/* Source Readings Context (Visual Only) */}
      <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Recent Memory
          </h2>
          <span className="text-sm text-muted-foreground">
            {readings.length} reading{readings.length !== 1 ? 's' : ''} this session
          </span>
        </div>

        {readings.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">
              The guide has no readings from this session, but will pull from your past 7 days of history if available.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {readings.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-background/40 border border-border/50 flex items-start gap-3"
              >
                <div
                  className={
                    'text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium shrink-0 ' +
                    (r.type === 'palm'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-violet-500/20 text-violet-300')
                  }
                >
                  {r.type}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {r.summary}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Chat Input */}
      <form onSubmit={askGuide} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Based on my recent readings, should I change careers?"
          className="w-full h-14 pl-5 pr-14 rounded-xl bg-background border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !question.trim()}
          className="absolute right-1.5 top-1.5 h-11 w-11 bg-primary text-primary-foreground hover:opacity-90 rounded-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </Button>
      </form>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      {/* AI Answer Display */}
      <AnimatePresence>
        {answer && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  {/* Split by newlines to render paragraphs cleanly */}
                  {answer.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && <p key={idx} className="leading-relaxed text-foreground">{paragraph}</p>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}