'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  User, 
  Star, 
  Compass, 
  Loader2, 
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthedFetch } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';

interface OnboardingSectionProps {
  onComplete: () => void;
}

// Exact options from your profile page
const ageGroups = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55+'];
const relationshipOptions = ['Single', 'In a Relationship', 'Married', 'Complicated', 'Prefer not to say'];
const zodiacOptions = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const spiritualOptions = ['Tarot', 'Palmistry', 'Astrology', 'Meditation', 'Spirituality', 'Self Growth', 'Mindfulness', 'Numerology'];
const lifeGoalOptions = ['Career Growth', 'Relationships', 'Personal Growth', 'Financial Stability', 'Emotional Wellbeing', 'Spiritual Development', 'Life Direction'];
const secondaryGoalOptions = ['Career Growth', 'Relationships', 'Personal Growth', 'Finance', 'Wellness', 'Spiritual Growth'];
const guidanceOptions = ['Personality', 'Relationships', 'Career', 'Finance', 'Wellness', 'Personal Growth', 'Life Opportunities'];
const topicOptions = ['Personality', 'Relationships', 'Career', 'Finance', 'Wellness', 'Personal Growth', 'Life Opportunities'];

export function OnboardingSection({ onComplete }: OnboardingSectionProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const authedFetch = useAuthedFetch();

  // State strictly matches the Profile table image
  const [profile, setProfile] = useState({
    birthDate: '',
    ageGroup: '18–24',
    zodiacSign: '',
    relationshipStatus: 'Single',
    bio: '',
    primaryLifeGoal: '', // Maps to primaryGoal in DB via backend
    secondaryGoals: [] as string[],
    spiritualInterests: [] as string[],
    guidanceAreas: [] as string[],
    preferredTopics: [] as string[],
  });

  const updateField = (key: string, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'secondaryGoals' | 'spiritualInterests' | 'guidanceAreas' | 'preferredTopics', value: string) => {
    setProfile((prev) => {
      const list = prev[key];
      if (list.includes(value)) {
        return { ...prev, [key]: list.filter((item) => item !== value) };
      }
      return { ...prev, [key]: [...list, value] };
    });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await authedFetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      toast({
        title: 'Initiation Complete',
        description: 'Welcome to your personalized Mystica experience.',
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Validation guards
  const isStep1Valid = profile.birthDate !== '';
  const isStep2Valid = profile.primaryLifeGoal !== '';

  return (
    <div className="max-w-3xl mx-auto pt-6 pb-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 mb-4 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs uppercase tracking-wider text-primary font-medium">
            Seeker Initiation
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Tell us about your journey
        </h1>
        <p className="text-muted-foreground text-sm">
          Step {step} of 3
        </p>
      </div>

      <Card className="p-6 md:p-8 border-border/50 bg-card/40 backdrop-blur min-h-[450px] flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: THE VESSEL */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 space-y-6"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">The Vessel</h2>
                  <p className="text-xs text-muted-foreground mt-1">Your core identity in the physical realm.</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Date of Birth *</label>
                  <Input
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    className="bg-background/50 border-border/70"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Age Group</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                    value={profile.ageGroup}
                    onChange={(e) => updateField('ageGroup', e.target.value)}
                  >
                    {ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Zodiac Sign</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                    value={profile.zodiacSign}
                    onChange={(e) => updateField('zodiacSign', e.target.value)}
                  >
                    <option value="">I don't know</option>
                    {zodiacOptions.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Relationship Status</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                    value={profile.relationshipStatus}
                    onChange={(e) => updateField('relationshipStatus', e.target.value)}
                  >
                    {relationshipOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => updateField('bio', e.target.value.slice(0, 300))}
                    className="min-h-[90px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                    placeholder="Tell us a little about yourself..."
                  />
                  <div className="flex justify-end text-xs text-muted-foreground">{profile.bio.length}/300</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: THE PATH */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 space-y-6"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                <Compass className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">The Path</h2>
                  <p className="text-xs text-muted-foreground mt-1">What seeks you as you seek it?</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Primary Life Goal *</label>
                <select
                  className="flex h-11 w-full rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/40"
                  value={profile.primaryLifeGoal}
                  onChange={(e) => updateField('primaryLifeGoal', e.target.value)}
                >
                  <option value="">Select your main focus...</option>
                  {lifeGoalOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Secondary Goals (Select multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {secondaryGoalOptions.map((goal) => {
                    const active = profile.secondaryGoals.includes(goal);
                    return (
                      <button
                        key={`sec-${goal}`}
                        onClick={() => toggleArrayItem('secondaryGoals', goal)}
                        className={cn("px-3 py-1.5 rounded-full border text-xs transition-all", active ? "border-primary bg-primary/15 text-primary" : "border-border/60 hover:border-primary/40")}
                      >
                        {goal}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">Spiritual Interests</label>
                <div className="flex flex-wrap gap-2">
                  {spiritualOptions.map((opt) => {
                    const active = profile.spiritualInterests.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleArrayItem('spiritualInterests', opt)}
                        className={cn("px-3 py-1.5 rounded-full border text-xs transition-all", active ? "border-primary bg-primary/15 text-primary" : "border-border/60 hover:border-primary/40")}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: THE ORACLE */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 space-y-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
                  <Eye className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-xl font-semibold">The Oracle</h2>
                    <p className="text-xs text-muted-foreground mt-1">What areas require guidance?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Guidance Areas (Select multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {guidanceOptions.map((opt) => {
                      const active = profile.guidanceAreas.includes(opt);
                      return (
                        <button key={`guide-${opt}`} onClick={() => toggleArrayItem('guidanceAreas', opt)} className={cn("px-3 py-1.5 rounded-full border text-xs transition-all", active ? "border-primary bg-primary/15 text-primary" : "border-border/60 hover:border-primary/40")}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Preferred Topics</label>
                  <div className="flex flex-wrap gap-2">
                    {topicOptions.map((opt) => {
                      const active = profile.preferredTopics.includes(opt);
                      return (
                        <button key={`top-${opt}`} onClick={() => toggleArrayItem('preferredTopics', opt)} className={cn("px-3 py-1.5 rounded-full border text-xs transition-all", active ? "border-primary bg-primary/15 text-primary" : "border-border/60 hover:border-primary/40")}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl border border-primary/30 bg-primary/5 text-center">
                <Star className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
                <h3 className="text-lg font-semibold text-primary">Your alignment is complete.</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px] mx-auto">
                  Click 'Enter Mystica' to lock in your energy signature and unlock the platform.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={step === 1 || loading}
            className="text-muted-foreground hover:text-foreground"
          >
            Back
          </Button>
          
          {step < 3 ? (
            <Button 
              onClick={handleNext} 
              disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
            >
              Next <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-lg shadow-primary/20">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? 'Aligning...' : 'Enter Mystica'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}