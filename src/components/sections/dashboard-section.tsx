'use client';

import React, { useMemo } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Compass,
  Heart,
  Briefcase,
  Activity,
  Star,
  Flame,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Brain,
  Zap,
  Award,
  Gem,
  Bell,
  RefreshCw,
  Eye,
  Feather
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/auth-provider';

// =====================================================================
// 1. ASTROLOGICAL & HOROSCOPE ENGINE (RASHIBHAVISHYA)
// =====================================================================

interface ZodiacInsight {
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
}

const ZODIAC_DATA: Record<string, ZodiacInsight> = {
  Aries: {
    sign: 'Aries',
    rashi: 'Mesh (मेष)',
    element: 'Fire',
    rulingPlanet: 'Mars',
    overview: 'High solar vitality surrounds your chart today. Action taken with calm intention yields immediate breakthroughs.',
    career: 'Favorable planetary alignment for initiating negotiations, leading discussions, and pitching bold ideas.',
    love: 'Clear communication dissolves lingering hesitations. Express appreciation openly.',
    health: 'High physical stamina; channel excess energy into grounding exercise or breathwork.',
    remedy: 'Offer water to the rising sun and wear red or coral tones to fortify resolve.',
    luckyNumber: '9 & 18',
    luckyColor: 'Crimson & Gold',
    auspiciousTime: '10:15 AM – 11:45 AM',
    mantra: 'Om Kram Kreem Kroum Sah Bhaumaya Namah',
    energyScores: { intuition: 84, clarity: 92, vitality: 96 },
  },
  Taurus: {
    sign: 'Taurus',
    rashi: 'Vrishabha (वृषभ)',
    element: 'Earth',
    rulingPlanet: 'Venus',
    overview: 'A stabilizing lunar transit invites patient building. Trust slow, deliberate progress over rushed shortcuts.',
    career: 'Financial and tactical plans gain steady support. Ideal time for reviewing investments and commitments.',
    love: 'Warm, grounding energy brings harmony into home and partner connections.',
    health: 'Focus on posture and vocal cord relaxation; herbal infusions support calm.',
    remedy: 'Light a sandalwood incense stick during evening reflection.',
    luckyNumber: '6 & 15',
    luckyColor: 'Emerald Green & White',
    auspiciousTime: '02:00 PM – 03:30 PM',
    mantra: 'Om Shum Shukraya Namah',
    energyScores: { intuition: 88, clarity: 89, vitality: 82 },
  },
  Scorpio: {
    sign: 'Scorpio',
    rashi: 'Vrischika (वृश्चिक)',
    element: 'Water',
    rulingPlanet: 'Mars / Pluto',
    overview: 'Deep intuitive clarity is heightened. Subtle signs in conversations reveal the true path forward.',
    career: 'Research and deep analytical tasks flow effortlessly. Uncover hidden advantages.',
    love: 'Intense emotional resonance; cultivate trust through vulnerability.',
    health: 'Restorative sleep and hydration will keep internal heat balanced.',
    remedy: 'Keep a small quartz or tiger-eye stone nearby for energetic grounding.',
    luckyNumber: '4 & 8',
    luckyColor: 'Deep Maroon & Silver',
    auspiciousTime: '06:30 PM – 08:00 PM',
    mantra: 'Om Namah Shivaya',
    energyScores: { intuition: 97, clarity: 91, vitality: 85 },
  },
  Default: {
    sign: 'Celestial Seeker',
    rashi: 'Universal Transit (सर्वराशी)',
    element: 'Ether & Light',
    rulingPlanet: 'Jupiter',
    overview: 'The celestial transits today favor conscious introspection and alignment between your intentions and actions.',
    career: 'Steady momentum surrounds strategic tasks. Keep goals clear and documented.',
    love: 'Empathy and mutual respect create deep, nourishing bonds today.',
    health: 'Maintain balanced hydration and take brief moments for mindful pause.',
    remedy: 'Practice 5 minutes of mindful breathwork before starting major tasks.',
    luckyNumber: '3 & 7',
    luckyColor: 'Royal Indigo & Amber',
    auspiciousTime: '11:00 AM – 12:30 PM',
    mantra: 'Om Gam Ganapataye Namaha',
    energyScores: { intuition: 90, clarity: 88, vitality: 87 },
  },
};

export function DashboardSection() {
  const { user } = useAuth();

  const role = (user?.role || 'user').toLowerCase();
  const isSpecialist = role.includes('palm') || role.includes('tarot') || role.includes('spiritual');

  // Pick horoscope data based on profile zodiac or default
  const userZodiac = useMemo(() => {
    const zodiacKey = (user as any)?.profile?.zodiacSign;
    if (zodiacKey && ZODIAC_DATA[zodiacKey]) return ZODIAC_DATA[zodiacKey];
    return ZODIAC_DATA['Aries']; // Default curated profile
  }, [user]);

  // =====================================================================
  // SPECIALIST VIEW
  // =====================================================================
  if (isSpecialist) {
    const specialistRoleName = role.includes('palm')
      ? 'Palmistry Master'
      : role.includes('tarot')
      ? 'Tarot Master'
      : 'Spiritual Guide';

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
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                    Specialist Terminal
                  </span>
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
                  <span className="text-base font-bold text-foreground">4.94</span>
                  <span className="text-xs text-muted-foreground">(142 reviews)</span>
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
                <p className="text-3xl font-display font-bold mt-2 text-foreground">98.6%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-400/90 mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +2.1% from last month
            </p>
          </Card>

          <Card className="bg-card/60 backdrop-blur border-border/50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Avg Review Time</p>
                <p className="text-3xl font-display font-bold mt-2 text-foreground">12 min</p>
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
                <p className="text-3xl font-display font-bold mt-2 text-foreground">284</p>
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
                <p className="text-3xl font-display font-bold mt-2 text-foreground">94%</p>
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
          {/* Reader Cosmic Climate */}
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
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Recommended Upay</p>
                <p className="text-sm font-semibold text-foreground">Grounding Quartz</p>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/40 space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase font-medium">Chakra Focus</p>
                <p className="text-sm font-semibold text-foreground">Ajna (Third Eye)</p>
              </div>
            </div>
          </Card>

          {/* Client Feedback & Ratings Feed */}
          <Card className="lg:col-span-5 bg-card/60 backdrop-blur border-border/50 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <h3 className="font-display text-base font-bold text-foreground">Recent Seeker Reviews</h3>
              </div>
              <span className="text-xs text-muted-foreground">Latest 3</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Ananya R.', rating: 5, comment: 'The specialist notes gave me immense peace of mind regarding my career pivot.', time: '2 hours ago' },
                { name: 'Rohan M.', rating: 5, comment: 'Spot-on palm analysis. The guidance on life balance was truly transformative.', time: 'Yesterday' },
                { name: 'Meera K.', rating: 5, comment: 'Clear, empathetic, and deeply intuitive tarot interpretation. Highly recommend!', time: '2 days ago' },
              ].map((rev, i) => (
                <div key={i} className="p-3 rounded-xl bg-background/40 border border-border/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{rev.name}</span>
                    <div className="flex text-amber-400 text-[10px]">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                  <p className="text-[10px] text-muted-foreground/60 text-right">{rev.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // =====================================================================
  // SEEKER (USER) VIEW — RICH HOROSCOPE & PERSONALIZED ADVICE
  // =====================================================================
  return (
    <div className="space-y-8 pb-20">
      {/* Cosmic Seeker Header */}
      <header className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
              <Sun className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                  Daily Rashibhavishya &amp; Guidance
                </span>
                <span className="opacity-40">•</span>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  {userZodiac.rashi}
                </Badge>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-foreground">
                Pranaam, {user?.name || 'Seeker'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Here is your astrological forecast, cosmic alignment, and personalized spiritual remedies for today.
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

      {/* Rashibhavishya: Three Pillars */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Today&apos;s Astrological Forecast</h2>
            <p className="text-xs text-muted-foreground">Planetary transits mapped to your energy centers</p>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Sparkles className="w-3 h-3 mr-1" /> Live Cosmic Sync
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Career Pillar */}
          <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-3 hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Karma &amp; Career</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{userZodiac.career}</p>
          </Card>

          {/* Love Pillar */}
          <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-3 hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Love &amp; Relationships</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{userZodiac.love}</p>
          </Card>

          {/* Health Pillar */}
          <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Health &amp; Vitality</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{userZodiac.health}</p>
          </Card>
        </div>
      </section>

      {/* Personalized Spiritual Remedies & Daily Auspicious Details */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Daily Spiritual Remedies (Upay) */}
        <Card className="lg:col-span-7 bg-card/60 backdrop-blur border-border/50 p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/40">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Gem className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Personalized Remedy (दैनिक उपाय)</h3>
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
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Shubh Muhurat</p>
              <p className="text-xs font-bold text-emerald-400 mt-1">{userZodiac.auspiciousTime}</p>
            </div>
          </div>
        </Card>

        {/* Vitality & Prana Meters */}
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
                <span className="text-muted-foreground font-medium">Mental Clarity (Budh Alignment)</span>
                <span className="font-mono font-bold text-sky-400">{userZodiac.energyScores.clarity}%</span>
              </div>
              <Progress value={userZodiac.energyScores.clarity} className="h-2 bg-secondary/60" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground font-medium">Prana &amp; Physical Stamina</span>
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