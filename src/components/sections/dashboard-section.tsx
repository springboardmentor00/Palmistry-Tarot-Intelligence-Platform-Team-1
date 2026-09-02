'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sun,
  Heart,
  Briefcase,
  Activity,
  Star,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Zap,
  Gem,
  Feather
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/auth-provider';
import { Progress } from '@/components/ui/progress';

interface Review {
  name: string;
  rating: number;
  comment: string;
  time: string;
}

interface DashboardData {
  role: string;
  specialistStats?: {
    satisfactionRate: number;
    avgReviewTime: string;
    completedReviews: number;
    practitionerEnergy: number;
    rating: number;
    reviewCount: number;
    recentReviews: Review[];
  };
  astrology?: {
    sign: string;
    rashi: string;
    element: string;
    rulingPlanet: string;
    overview: string;
    career: string;
    love: string;
    health: string;
    remedy: string;
    luckyNumber: string;
    luckyColor: string;
    auspiciousTime: string;
    mantra: string;
    energyScores: {
      intuition: number;
      clarity: number;
      vitality: number;
    };
  };
}

export function DashboardSection() {
  const { user, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = (user?.role || 'user').toLowerCase();
  const isSpecialist = role.includes('palm') || role.includes('tarot') || role.includes('spiritual');

  useEffect(() => {
    if (!user) return; // Wait until AuthProvider loads the user

    const fetchDashboard = async () => {
      try {
        const currentToken = token || localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;

        const response = await fetch('/api/dashboard', { headers });
        
        if (!response.ok) throw new Error('Failed to fetch real-time dashboard data');
        
        const dashboardData = await response.json();
        setData(dashboardData.dashboard);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [user, token]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Synchronizing with intelligence platform...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-rose-500 border border-rose-500/20 rounded-xl bg-rose-500/5">Error loading dashboard: {error}</div>;
  }

  // =====================================================================
  // SPECIALIST VIEW (Powered by Real DB Queries)
  // =====================================================================
  if (isSpecialist && data.specialistStats) {
    const specialistRoleName = role.includes('palm') ? 'Palmistry Master' : role.includes('tarot') ? 'Tarot Master' : 'Spiritual Guide';
    const stats = data.specialistStats;

    return (
      <div className="space-y-8 pb-16">
        {/* Practitioner Header */}
        <header className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">Specialist Terminal</span>
                  <span className="opacity-40">•</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified Practitioner
                  </Badge>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-foreground">
                  Welcome, {user?.name || 'Master Consultant'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Your {specialistRoleName} workspace is primed. Intuitive field resonance is optimal today.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Overall Rating</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-base font-bold text-foreground">{stats.rating.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">({stats.reviewCount} reviews)</span>
                </div>
              </div>
              <Avatar className="w-12 h-12 border border-primary/30">
                <AvatarFallback className="bg-secondary text-primary font-bold">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'SP'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Operational Statistics */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Satisfaction Rate</p>
                <p className="text-3xl font-display font-bold mt-2 text-foreground">{stats.satisfactionRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-400/90 mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Updated Live
            </p>
          </Card>

          <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Avg Review Time</p>
                <p className="text-3xl font-display font-bold mt-2 text-foreground">{stats.avgReviewTime}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">High throughput speed</p>
          </Card>

          <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Completed Reviews</p>
                <p className="text-3xl font-display font-bold mt-2 text-foreground">{stats.completedReviews}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-primary/90 mt-3">Lifetime verified readings</p>
          </Card>

          <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Practitioner Energy</p>
                <p className="text-3xl font-display font-bold mt-2 text-foreground">{stats.practitionerEnergy}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-amber-400 mt-3">High intuitive clarity</p>
          </Card>
        </section>

        {/* Specialist Cosmic Grounding & Reviews */}
        <div className="grid lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 bg-card/60 backdrop-blur border-border/50 p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <Feather className="w-5 h-5 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground">Daily Practitioner Alignment</h3>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                Solar Transit Active
              </Badge>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed">
              Today&apos;s planetary currents favor deep discernment and clarity. When interpreting complex symbols or broken fate lines, anchor your intuition in constructive, empowering remedies for the seeker.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Intuitive Channel</p>
                <p className="text-sm font-semibold text-foreground">High Sensitivity</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Recommended Crystal</p>
                <p className="text-sm font-semibold text-foreground">Grounding Quartz</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Chakra Focus</p>
                <p className="text-sm font-semibold text-foreground">Third Eye</p>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-5 bg-card/60 backdrop-blur border-border/50 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <h3 className="font-display text-base font-bold text-foreground">Recent Seeker Reviews</h3>
              </div>
              <span className="text-xs text-muted-foreground">Latest {stats.recentReviews.length}</span>
            </div>

            <div className="space-y-3">
              {stats.recentReviews.length > 0 ? (
                stats.recentReviews.map((rev, i) => (
                  <div key={i} className="p-3 rounded-xl bg-background/40 border border-border/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{rev.name}</span>
                      <div className="flex text-amber-400 text-[10px]">
                        {[...Array(Math.round(rev.rating))].map((_, idx) => (
                          <Star key={idx} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                    <p className="text-[10px] text-muted-foreground/60 text-right">{rev.time}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-6">No recent reviews yet.</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // =====================================================================
  // SEEKER (USER) VIEW (Powered by Gemini + Database)
  // =====================================================================
  if (data.astrology) {
    const userZodiac = data.astrology;

    return (
      <div className="space-y-8 pb-20">
        <header className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Sun className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                    Daily Astrological Forecast & Guidance
                  </span>
                  <span className="opacity-40">•</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    {userZodiac.rashi}
                  </Badge>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-foreground">
                  Greetings, {user?.name || 'Seeker'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  {userZodiac.overview}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ruling Planet</p>
                <p className="text-sm font-bold text-foreground">{userZodiac.rulingPlanet}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Element</p>
                <p className="text-sm font-bold text-primary">{userZodiac.element}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Today&apos;s Astrological Forecast</h2>
              <p className="text-xs text-muted-foreground">Planetary transits mapped to your energy centers</p>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" /> AI Insights Active
            </Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-3 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Karma & Career</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{userZodiac.career}</p>
            </Card>

            <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-3 hover:border-rose-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Love & Relationships</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{userZodiac.love}</p>
            </Card>

            <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-3 hover:border-emerald-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Health & Vitality</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{userZodiac.health}</p>
            </Card>
          </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 bg-card/60 backdrop-blur border-border/50 p-6 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <Gem className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Personalized Remedy (Daily Action)</h3>
                <p className="text-xs text-muted-foreground">Actionable cosmic guidance to dissolve obstacles</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-xs uppercase font-semibold text-primary tracking-wider">Prescribed Action</p>
              <p className="text-sm text-foreground/90 leading-relaxed font-medium">{userZodiac.remedy}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Chant / Affirmation of the Day</p>
              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/40 font-mono text-xs text-primary font-semibold flex items-center justify-between">
                <span>{userZodiac.mantra}</span>
                <Sparkles className="w-4 h-4 text-primary shrink-0 ml-2" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Lucky Number</p>
                <p className="text-base font-bold text-foreground mt-0.5">{userZodiac.luckyNumber}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Auspicious Color</p>
                <p className="text-base font-bold text-primary mt-0.5">{userZodiac.luckyColor}</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/40 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Auspicious Time</p>
                <p className="text-xs font-bold text-emerald-400 mt-1">{userZodiac.auspiciousTime}</p>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-5 bg-card/60 backdrop-blur border-border/50 p-6 space-y-5 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Cosmic Energy Gauge</h3>
                <p className="text-xs text-muted-foreground">Calculated daily chakra alignment</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Intuitive Sensitivity</span>
                  <span className="font-mono font-bold text-primary">{userZodiac.energyScores.intuition}%</span>
                </div>
                <Progress value={userZodiac.energyScores.intuition} className="h-2 bg-secondary/60" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Mental Clarity (Alignment)</span>
                  <span className="font-mono font-bold text-sky-400">{userZodiac.energyScores.clarity}%</span>
                </div>
                <Progress value={userZodiac.energyScores.clarity} className="h-2 bg-secondary/60" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Prana & Physical Stamina</span>
                  <span className="font-mono font-bold text-emerald-400">{userZodiac.energyScores.vitality}%</span>
                </div>
                <Progress value={userZodiac.energyScores.vitality} className="h-2 bg-secondary/60" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 text-xs text-muted-foreground flex items-center gap-2 mt-2">
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Lunar phase: Waxing Crescent. Ideal for setting new spiritual intentions.</span>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  return null;
}