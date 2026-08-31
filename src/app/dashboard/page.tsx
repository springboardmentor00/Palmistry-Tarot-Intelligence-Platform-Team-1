'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarRange,
  CheckCircle2,
  Dot,
  Hand,
  HeartPulse,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Starfield } from '@/components/starfield';

const metrics = [
  { label: 'Active Clients', value: '12.8k', delta: '+18.4%', tone: 'primary' },
  { label: 'AI Insights', value: '3.4k', delta: '+9.2%', tone: 'accent' },
  { label: 'Readings Today', value: '482', delta: '+12.6%', tone: 'success' },
  { label: 'Satisfaction', value: '96.2%', delta: '+4.1%', tone: 'warning' },
];

const recentReadings = [
  { name: 'Aarav Sharma', type: 'Palm Reading', time: '10:30 AM', status: 'Completed' },
  { name: 'Meera Kapoor', type: 'Tarot Spread', time: '11:05 AM', status: 'In Review' },
  { name: 'Riya Verma', type: 'AI Guidance', time: '12:15 PM', status: 'New' },
  { name: 'Ethan Cole', type: 'Palm Analysis', time: '1:45 PM', status: 'Completed' },
];

const focusAreas = [
  'Career clarity',
  'Relationship guidance',
  'Emotional wellness',
  'Spiritual growth',
  'Life direction',
];

const activityFeed = [
  'New palm intake received from 4 clients in the last hour.',
  'Tarot interpretation quality score improved by 7.8%.',
  '2 specialist reviews were completed and approved.',
  'Client re-engagement campaign is trending above baseline.',
];

const toneStyles: Record<string, string> = {
  primary: 'bg-primary/10 text-primary ring-1 ring-primary/20',
  accent: 'bg-accent/10 text-accent ring-1 ring-accent/20',
  success: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
};

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <Starfield count={70} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="border-primary/40 bg-background/70 text-foreground hover:border-primary/60 hover:bg-primary/5"
          >
            <Bell className="mr-2 h-4 w-4" />
            Live dashboard
          </Button>
        </header>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Dashboard
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Welcome back, Maya.
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your spiritual intelligence operations are running smoothly across all channels.
                </p>
              </div>

              <Badge className="w-fit border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                System healthy
              </Badge>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => (
              <Card
                key={item.label}
                className="border-border/60 bg-card/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-foreground">{item.value}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${toneStyles[item.tone]}`}>
                    {item.delta}
                  </span>
                </div>
              </Card>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
            <Card className="border-border/60 bg-card/80 p-5 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Performance overview
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-foreground">Readings & client engagement</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  +14.8% this month
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Client growth
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold text-foreground">68%</span>
                    <span className="mb-1 text-xs text-emerald-400">+11.2%</span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary/60">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-primary via-primary to-accent" />
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <HeartPulse className="h-4 w-4 text-primary" />
                    Wellness index
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold text-foreground">89</span>
                    <span className="mb-1 text-xs text-emerald-400">+5.4%</span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary/60">
                    <div className="h-full w-[89%] rounded-full bg-gradient-to-r from-emerald-500 via-primary to-accent" />
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {focusAreas.map((item, index) => (
                  <div key={item}>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item}</span>
                      <span>{72 + index * 8}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-secondary/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-accent/80"
                        style={{ width: `${72 + index * 8}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/60 bg-card/80 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Activity feed
                </p>
              </div>

              <div className="space-y-3">
                {activityFeed.map((activity) => (
                  <div key={activity} className="flex gap-3 rounded-2xl border border-border/60 bg-background/50 p-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-sm text-muted-foreground">{activity}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="border-border/60 bg-card/80 p-5 backdrop-blur-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Recent readings
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-foreground">Latest client queue</h2>
                </div>
                <Button variant="outline" size="sm" className="border-border/60 bg-background/50 text-foreground">
                  View all
                </Button>
              </div>

              <div className="space-y-3">
                {recentReadings.map((item) => (
                  <div
                    key={`${item.name}-${item.time}`}
                    className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {item.type.includes('Palm') ? <Hand className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${
                          item.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                            : item.status === 'In Review'
                              ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                              : 'bg-primary/10 text-primary ring-1 ring-primary/20'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/60 bg-card/80 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Today snapshot
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Dot className="h-6 w-6 text-primary" />
                    Pending review
                  </div>
                  <p className="text-3xl font-semibold text-foreground">24</p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Dot className="h-6 w-6 text-emerald-400" />
                    Completed today
                  </div>
                  <p className="text-3xl font-semibold text-foreground">138</p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Dot className="h-6 w-6 text-amber-400" />
                    Response time
                  </div>
                  <p className="text-3xl font-semibold text-foreground">08m</p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
