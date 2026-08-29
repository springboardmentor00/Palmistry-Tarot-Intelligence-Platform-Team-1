'use client';

import { Activity, Brain, Heart, Compass, Sun, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { PalmConsultationTicket } from './ConsultationQueue';

interface ConfidenceScoresProps {
  linesConfidence: PalmConsultationTicket['linesConfidence'];
}

export function ConfidenceScores({ linesConfidence }: ConfidenceScoresProps) {
  const lines = [
    {
      name: 'Life Line',
      score: linesConfidence.lifeLine,
      icon: Activity,
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      name: 'Head Line',
      score: linesConfidence.headLine,
      icon: Brain,
      textColor: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    },
    {
      name: 'Heart Line',
      score: linesConfidence.heartLine,
      icon: Heart,
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    },
    {
      name: 'Fate Line',
      score: linesConfidence.fateLine,
      icon: Compass,
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    },
    {
      name: 'Sun Line',
      score: linesConfidence.sunLine,
      icon: Sun,
      textColor: 'text-yellow-400',
      badgeBg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    },
  ];

  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div>
          <h3 className="font-display text-base font-bold text-foreground tracking-wide">
            Detected Palm Line Confidence
          </h3>
          <p className="text-xs text-muted-foreground">
            Computer vision detection clarity & line strength metrics
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs px-2.5 py-0.5">
          <CheckCircle2 className="w-3 h-3 mr-1 text-primary" />
          5 Lines Analyzed
        </Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {lines.map((line) => {
          const Icon = line.icon;
          const pct = Math.round(line.score * 100);
          return (
            <div
              key={line.name}
              className="p-3.5 rounded-xl border border-border/50 bg-background/40 hover:bg-secondary/30 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${line.textColor}`} />
                  <span className="text-xs font-semibold text-foreground">{line.name}</span>
                </div>
                <span className="font-mono text-xs font-bold text-foreground">{pct}%</span>
              </div>

              <div className="space-y-1.5">
                <Progress value={pct} className="h-2 bg-secondary/60" />
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${line.badgeBg}`}>
                    {pct >= 85 ? 'High Confidence' : pct >= 70 ? 'Moderate' : 'Faint'}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
