'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hand,
  Upload,
  Loader2,
  Sparkles,
  Heart,
  Brain,
  Activity,
  Compass,
  RotateCcw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PalmAnalysisResult {
  summary: string;
  lifeLine: string;
  heartLine: string;
  headLine: string;
  fateLine: string;
  personality: string;
  recommendations: string[];
  rawAnalysis?: string;
  id?: string;
}

interface PalmSectionProps {
  onReadingComplete: (r: {
    type: 'palm';
    summary: string;
    content: string;
  }) => void;
}

const DEMO_USER_ID = 'demo-user';

export function PalmSection({ onReadingComplete }: PalmSectionProps) {
  const [image, setImage] = useState<string | null>(null);
  const [handType, setHandType] = useState<'left' | 'right'>('right');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PalmAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file (PNG, JPG, WebP).',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image under 8 MB.',
        variant: 'destructive',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const analyze = async () => {
    if (!image) {
      toast({
        title: 'No image',
        description: 'Please upload a palm image first.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/palm-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          handType,
          userId: DEMO_USER_ID,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Analysis failed');
      }
      const data = (await res.json()) as PalmAnalysisResult;
      setResult(data);
      onReadingComplete({
        type: 'palm',
        summary: data.summary,
        content: data.rawAnalysis ?? data.summary,
      });
      toast({
        title: 'Reading complete',
        description: 'Your palm analysis is ready.',
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      toast({
        title: 'Analysis failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 mb-3">
          <Hand className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Palm Analysis Service
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          AI Palm Reading
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload a clear photo of your palm. A vision-language model examines
          the four major lines — heart, head, life, and fate — and synthesizes a
          personality portrait.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload + preview */}
        <Card className="bg-card/60 backdrop-blur border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Your Palm</h2>
            {image && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="text-muted-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {!image ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/20'
              )}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mx-auto mb-4 float">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <p className="font-medium mb-1">Drop palm image here</p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to browse · PNG, JPG, WebP · max 8MB
              </p>
              <Button type="button" variant="outline" size="sm">
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-border/50 bg-background/40">
                {/* Uploaded palm preview */}
                <img
                  src={image}
                  alt="Uploaded palm"
                  className="w-full max-h-80 object-contain"
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-xs flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Uploaded
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                  Which hand?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['left', 'right'] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => setHandType(h)}
                      className={cn(
                        'px-4 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all',
                        handType === h
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border bg-background/40 text-muted-foreground hover:bg-secondary/40'
                      )}
                    >
                      {h} hand
                      <span className="block text-[10px] opacity-70 mt-0.5">
                        {h === 'right' ? 'conscious self' : 'inner self'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={analyze}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reading the lines...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Reveal My Palm Reading
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-destructive">Analysis failed</div>
                <div className="text-muted-foreground text-xs mt-0.5">{error}</div>
              </div>
            </div>
          )}
        </Card>

        {/* Result panel */}
        <Card className="bg-card/60 backdrop-blur border-border/50 p-6 min-h-[400px]">
          <h2 className="font-display text-xl font-semibold mb-4">
            Reading Result
          </h2>

          {!result && !loading && (
            <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground">
              <Hand className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">
                Your palm reading will appear here after analysis.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 rounded shimmer" />
                  <div className="h-12 w-full rounded shimmer" />
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs uppercase tracking-wider text-primary font-medium">
                      Overall Reading
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </div>

                <Tabs defaultValue="lines" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="lines">The Four Lines</TabsTrigger>
                    <TabsTrigger value="personality">Personality</TabsTrigger>
                  </TabsList>

                  <TabsContent value="lines" className="space-y-3 mt-4">
                    <LineReading
                      icon={Heart}
                      label="Heart Line"
                      text={result.heartLine}
                      color="text-rose-300"
                    />
                    <LineReading
                      icon={Brain}
                      label="Head Line"
                      text={result.headLine}
                      color="text-sky-300"
                    />
                    <LineReading
                      icon={Activity}
                      label="Life Line"
                      text={result.lifeLine}
                      color="text-emerald-300"
                    />
                    <LineReading
                      icon={Compass}
                      label="Fate Line"
                      text={result.fateLine}
                      color="text-amber-300"
                    />
                  </TabsContent>

                  <TabsContent value="personality" className="space-y-4 mt-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-primary">
                        Personality Synthesis
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {result.personality}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-primary">
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {result.recommendations?.map((r, i) => (
                          <li
                            key={i}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-primary mt-0.5">·</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>

                {result.id && (
                  <p className="text-[11px] text-muted-foreground/70 text-center pt-2">
                    Saved to your history · ID: {result.id.slice(0, 8)}…
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-card/40 border-border/50 p-6">
        <h3 className="font-display text-lg font-semibold mb-3">
          Tips for a Clear Reading
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-primary mb-1">Good lighting</div>
            <p className="text-muted-foreground">
              Natural daylight is best. Avoid harsh shadows across the palm.
            </p>
          </div>
          <div>
            <div className="font-medium text-primary mb-1">Open the hand</div>
            <p className="text-muted-foreground">
              Slightly cup the palm so all four major lines are visible.
            </p>
          </div>
          <div>
            <div className="font-medium text-primary mb-1">Frame the whole palm</div>
            <p className="text-muted-foreground">
              Include from wrist to base of fingers in the photo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function LineReading({
  icon: Icon,
  label,
  text,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  text: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-background/40 border border-border/50">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn('w-4 h-4', color)} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
