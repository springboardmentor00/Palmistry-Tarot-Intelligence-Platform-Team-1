'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  Hand,
  Layers,
  Brain,
  TrendingUp,
  ArrowRight,
  Moon,
  Star,
  Eye,
  Zap,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SectionId } from '@/app/page';
import { useAuth } from '@/components/auth/auth-provider';

interface HomeSectionProps {
  onNavigate: (s: SectionId) => void;
  savedCount: number;
}

const FEATURES = [
  {
    icon: Hand,
    title: 'AI Palm Analysis',
    description:
      'Upload a photo of your palm and a vision-language model reads your heart, head, life, and fate lines — then synthesizes a personality portrait.',
    accent: 'from-rose-500/30 to-amber-500/20',
    iconColor: 'text-rose-300',
    cta: 'Read my palm' as const,
    target: 'palm' as SectionId,
  },
  {
    icon: Layers,
    title: 'AI Tarot Reading',
    description:
      'Draw from the full 78-card Rider-Waite deck across five spreads — single, three-card, mind-body-spirit, situation-action-outcome, and the Celtic Cross.',
    accent: 'from-violet-500/30 to-fuchsia-500/20',
    iconColor: 'text-violet-300',
    cta: 'Draw the cards' as const,
    target: 'tarot' as SectionId,
  },
  {
    icon: Brain,
    title: 'Synthesized Insights',
    description:
      'Combine palm + tarot readings into a holistic insight report: personality profile, life trends, personalized recommendations, and an affirmation.',
    accent: 'from-emerald-500/30 to-teal-500/20',
    iconColor: 'text-emerald-300',
    cta: 'See my insights' as const,
    target: 'insights' as SectionId,
  },
];

const STATS = [
  { label: 'Cards in deck', value: '78', icon: Layers },
  { label: 'Spread types', value: '5', icon: Sparkles },
  { label: 'Palm lines read', value: '4', icon: Hand },
  { label: 'AI models', value: '2', icon: Zap },
];

const PLATFORM_HIGHLIGHTS = [
  {
    icon: Eye,
    title: 'Vision LLM',
    text: 'GLM-5V Turbo reads palm geometry from your uploaded image.',
  },
  {
    icon: Brain,
    title: 'Text LLM',
    text: 'GLM-4.5 weaves narrative interpretations of every spread.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure JWT Auth',
    text: 'Your account and readings are protected with JWT-based authentication.',
  },
  {
    icon: TrendingUp,
    title: 'Trend Tracking',
    text: 'Insights accumulate into a longitudinal view of your spiritual journey.',
  },
];

export function HomeSection({ onNavigate, savedCount }: HomeSectionProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero */}
      <section className="relative pt-6 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
            <Moon className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium tracking-wider uppercase text-primary">
              AI-Powered Mystical Intelligence
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent">
              Mystica
            </span>
            <span className="block text-foreground mt-2 text-3xl md:text-5xl">
              Palmistry & Tarot Platform
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            An intelligent platform where ancient divination meets modern AI.
            Upload your palm, draw the cards, and let vision-language models
            synthesize personalized spiritual insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {user ? (
              <Button
                size="lg"
                onClick={() => onNavigate('palm')}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity px-8 h-12 text-base"
              >
                <Hand className="w-4 h-4 mr-2" />
                Begin a Palm Reading
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => onNavigate('palm')}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity px-8 h-12 text-base"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Begin
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('tarot')}
              className="border-primary/40 hover:bg-secondary/40 h-12 px-8 text-base"
            >
              <Layers className="w-4 h-4 mr-2" />
              Draw the Tarot
            </Button>
          </div>

          {user && savedCount > 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              <Star className="inline w-3.5 h-3.5 text-primary mr-1.5" />
              You have {savedCount} reading{savedCount > 1 ? 's' : ''} ready for
              insight synthesis.{' '}
              <button
                onClick={() => onNavigate('insights')}
                className="text-primary underline-offset-4 hover:underline"
              >
                View insights →
              </button>
            </p>
          )}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-14 max-w-4xl mx-auto"
        >
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.label}
                className="bg-card/60 backdrop-blur border-border/50 p-4 text-center"
              >
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="font-display text-2xl font-bold text-foreground">
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </Card>
            );
          })}
        </motion.div>
      </section>

      {/* Feature cards */}
      <section>
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Three Pillars of Insight
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each pillar is backed by a dedicated AI model. Combine them for a
            complete picture of your inner landscape.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Card
                  className={cn(
                    'relative overflow-hidden h-full p-6 bg-card/60 backdrop-blur border-border/50 hover:border-primary/40 transition-all group cursor-pointer'
                  )}
                  onClick={() => onNavigate(f.target)}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity',
                      f.accent
                    )}
                  />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-background/70 border border-border/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className={cn('w-6 h-6', f.iconColor)} />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {f.description}
                    </p>
                    <div className="flex items-center text-sm text-primary font-medium">
                      {f.cta}
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Platform highlights */}
      <section>
        <Card className="bg-card/40 backdrop-blur border-border/50 p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 mb-4">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Platform Capabilities
                </span>
              </div>
              <h2 className="font-display text-3xl font-bold mb-4">
                Mystical Wisdom, Engineered
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Mystica pairs ancient divination traditions with modern AI. A
                vision-language model reads your palm; a text LLM weaves tarot
                narratives; an insight engine synthesizes both into actionable
                guidance. All secured behind JWT authentication, with every
                reading persistently stored to your private history.
              </p>
              {user ? (
                <Button
                  variant="outline"
                  onClick={() => onNavigate('history')}
                  className="border-primary/40 hover:bg-secondary/40"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View My Reading History
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onNavigate('palm')}
                  className="border-primary/40 hover:bg-secondary/40"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Create an Account
                </Button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {PLATFORM_HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div
                    key={h.title}
                    className="rounded-lg border border-border/50 bg-background/40 p-4"
                  >
                    <Icon className="w-5 h-5 text-primary mb-2" />
                    <div className="font-semibold text-sm mb-1">{h.title}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {h.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </section>

      {/* Closing CTA */}
      <section className="text-center py-8">
        <p className="font-display text-2xl md:text-3xl text-foreground/90 italic mb-6 max-w-2xl mx-auto">
          &ldquo;The hand holds the map of a life; the cards reveal the
          weather. Read both, and walk wisely.&rdquo;
        </p>
        <Button
          size="lg"
          variant="ghost"
          onClick={() => onNavigate(user ? 'palm' : 'palm')}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          {user ? 'Begin Your Reading' : 'Sign In to Begin'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>
    </div>
  );
}
