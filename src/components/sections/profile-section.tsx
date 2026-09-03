'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  Heart,
  MoonStar,
  Sparkles,
  Target,
  Wand2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuthedFetch } from '@/components/auth/auth-provider';

type ReadingDepth = 'standard' | 'deep';
type ReadingStyle = 'short' | 'detailed';

type ProfileState = {
  fullName: string;
  birthDate: string;
  zodiacSign: string;
  ageGroup: string;
  relationshipStatus: string;
  bio: string;
  spiritualInterests: string[];
  primaryLifeGoal: string;
  secondaryGoals: string[];
  guidanceAreas: string[];
  readingDepth: ReadingDepth;
  readingStyle: ReadingStyle;
  preferredTopics: string[];
  dailyGuidance: boolean;
  readingReminders: boolean;
  insightUpdates: boolean;
  personalizedRecommendations: boolean;
  saveReadingHistory: boolean;
};

const ageGroups = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55+'];
const relationshipOptions = ['Single', 'In a Relationship', 'Married', 'Complicated', 'Prefer not to say'];
const zodiacOptions = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const spiritualOptions = ['Tarot', 'Palmistry', 'Astrology', 'Meditation', 'Spirituality', 'Self Growth', 'Mindfulness', 'Numerology'];
const lifeGoalOptions = ['Career Growth', 'Relationships', 'Personal Growth', 'Financial Stability', 'Emotional Wellbeing', 'Spiritual Development', 'Life Direction'];
const secondaryGoalOptions = ['Career Growth', 'Relationships', 'Personal Growth', 'Finance', 'Wellness', 'Spiritual Growth'];
const guidanceOptions = ['Personality', 'Relationships', 'Career', 'Finance', 'Wellness', 'Personal Growth', 'Life Opportunities'];
const topicOptions = ['Personality', 'Relationships', 'Career', 'Finance', 'Wellness', 'Personal Growth', 'Life Opportunities'];

const defaultProfile: ProfileState = {
  fullName: '',
  birthDate: '',
  zodiacSign: '',
  ageGroup: '18–24',
  relationshipStatus: 'Single',
  bio: '',
  spiritualInterests: [],
  primaryLifeGoal: '',
  secondaryGoals: [],
  guidanceAreas: [],
  readingDepth: 'standard',
  readingStyle: 'short',
  preferredTopics: [],
  dailyGuidance: true,
  readingReminders: true,
  insightUpdates: true,
  personalizedRecommendations: true,
  saveReadingHistory: true,
};

const toggleItem = (value: string, list: string[], max?: number) => {
  if (list.includes(value)) {
    return list.filter((item) => item !== value);
  }
  if (max && list.length >= max) {
    return [...list.slice(1), value];
  }
  return [...list, value];
};

export function ProfileSection() {
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [savedProfile, setSavedProfile] = useState<ProfileState>(defaultProfile);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [errors, setErrors] = useState<{ fullName?: string; birthDate?: string; primaryLifeGoal?: string }>({});

  const { toast } = useToast();
  const authedFetch = useAuthedFetch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authedFetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          
          const sanitizedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key, 
              value === null ? defaultProfile[key as keyof ProfileState] : value
            ])
          );
          
          const loaded = { ...defaultProfile, ...sanitizedData };
          setProfile(loaded as ProfileState);
          setSavedProfile(loaded as ProfileState);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setInitialLoad(false);
      }
    };
    fetchProfile();
  }, [authedFetch]);

  const updateField = <K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleToggle = (key: keyof Pick<ProfileState, 'dailyGuidance' | 'readingReminders' | 'insightUpdates' | 'personalizedRecommendations' | 'saveReadingHistory'>) => {
    setProfile((prev) => ({ ...prev, [key]: !prev[key] }));
    setIsSaved(false);
  };

  const handleMultiSelect = (key: 'spiritualInterests' | 'secondaryGoals' | 'guidanceAreas' | 'preferredTopics', value: string) => {
    setProfile((prev) => ({
      ...prev,
      [key]: toggleItem(value, prev[key]),
    }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    const nextErrors: { fullName?: string; birthDate?: string; primaryLifeGoal?: string } = {};

    if (!profile.fullName?.trim()) nextErrors.fullName = 'Full name is required.';
    if (!profile.birthDate) nextErrors.birthDate = 'Date of birth is required.';
    if (!profile.primaryLifeGoal) nextErrors.primaryLifeGoal = 'Please choose a primary life goal.';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await authedFetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile), 
      });

      if (!res.ok) throw new Error('Failed to save profile');
      
      setSavedProfile(profile);
      setIsSaved(true);
      toast({ title: 'Profile Updated', description: 'Your preferences have been saved.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save profile.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(savedProfile);
    setErrors({});
    setIsSaved(false);
  };

  if (initialLoad) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="relative z-10 mx-auto max-w-6xl pb-20">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Profile & Preferences
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Manage your personal information and customize your experience.
          </h1>
        </div>

        <div className="space-y-5 rounded-[28px] border border-border/60 bg-card/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm sm:p-6">
          <section className="rounded-3xl border border-border/60 bg-background/40 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MoonStar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Personal Information</p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">Your profile details</h2>
              </div>
            </div>

            <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-background/50 p-4 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 text-primary ring-1 ring-primary/30">
                  <Camera className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile photo</p>
                  <p className="text-base font-medium text-foreground">Upload a photo</p>
                </div>
              </div>

              <Button type="button" variant="outline" className="border-primary/40 bg-card/80 text-foreground hover:bg-primary/5">
                <Camera className="mr-2 h-4 w-4" />
                Change Photo
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Full Name</label>
                <input
                  value={profile.fullName || ''}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/10"
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Date of Birth</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={profile.birthDate || ''}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    className="w-full rounded-2xl border border-border/70 bg-background/80 py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                {errors.birthDate && <p className="mt-1 text-xs text-red-400">{errors.birthDate}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Age Group</label>
                <select
                  value={profile.ageGroup || '18-24'}
                  onChange={(e) => updateField('ageGroup', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/10"
                >
                  {ageGroups.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Zodiac Sign</label>
                <select
                  value={profile.zodiacSign || ''}
                  onChange={(e) => updateField('zodiacSign', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Select sign</option>
                  {zodiacOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Relationship Status</label>
                <select
                  value={profile.relationshipStatus || 'Single'}
                  onChange={(e) => updateField('relationshipStatus', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/10"
                >
                  {relationshipOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => updateField('bio', e.target.value.slice(0, 300))}
                className="min-h-[110px] w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/10"
                placeholder="Tell us a little about yourself..."
              />
              <div className="mt-2 flex justify-end text-xs text-muted-foreground">{(profile.bio || '').length}/300</div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/40 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Spiritual Profile</p>
                <h3 className="text-lg font-semibold text-foreground">Tell Mystica what interests and goals matter most to you.</h3>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Spiritual Interests</p>
                <div className="flex flex-wrap gap-2">
                  {spiritualOptions.map((option) => {
                    const active = profile.spiritualInterests?.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleMultiSelect('spiritualInterests', option)}
                        className={[
                          'rounded-full border px-3 py-1.5 text-sm font-medium transition',
                          active
                            ? 'border-primary/70 bg-primary/15 text-foreground shadow-[0_0_18px_rgba(244,196,94,0.18)]'
                            : 'border-border/70 bg-background/70 text-foreground hover:border-primary/40',
                        ].join(' ')}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">Primary Life Goal</label>
                <select
                  value={profile.primaryLifeGoal || ''}
                  onChange={(e) => updateField('primaryLifeGoal', e.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/80 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/80 focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Select your primary goal</option>
                  {lifeGoalOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.primaryLifeGoal && <p className="mt-1 text-xs text-red-400">{errors.primaryLifeGoal}</p>}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Secondary Goals</p>
                <div className="flex flex-wrap gap-2">
                  {secondaryGoalOptions.map((option) => {
                    const active = profile.secondaryGoals?.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleMultiSelect('secondaryGoals', option)}
                        className={[
                          'rounded-full border px-3 py-1.5 text-sm transition',
                          active
                            ? 'border-primary/70 bg-primary/15 text-foreground'
                            : 'border-border/70 bg-background/70 text-foreground hover:border-primary/40',
                        ].join(' ')}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Areas I Want Guidance On</p>
                <div className="flex flex-wrap gap-2">
                  {guidanceOptions.map((option) => {
                    const active = profile.guidanceAreas?.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleMultiSelect('guidanceAreas', option)}
                        className={[
                          'rounded-full border px-3 py-1.5 text-sm transition',
                          active
                            ? 'border-primary/70 bg-primary/15 text-foreground'
                            : 'border-border/70 bg-background/70 text-foreground hover:border-primary/40',
                        ].join(' ')}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/40 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Reading Preferences</p>
                <h3 className="text-lg font-semibold text-foreground">How would you like your readings to feel?</h3>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-medium text-muted-foreground">Reading Depth</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(['standard', 'deep'] as ReadingDepth[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateField('readingDepth', option)}
                      className={[
                        'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
                        profile.readingDepth === option
                          ? 'border-primary/70 bg-primary/15 text-foreground'
                          : 'border-border/70 bg-background/70 text-foreground hover:border-primary/40',
                      ].join(' ')}
                    >
                      {option === 'standard' ? 'Standard' : 'Deep'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-muted-foreground">Reading Style</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(['short', 'detailed'] as ReadingStyle[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateField('readingStyle', option)}
                      className={[
                        'rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
                        profile.readingStyle === option
                          ? 'border-primary/70 bg-primary/15 text-foreground'
                          : 'border-border/70 bg-background/70 text-foreground hover:border-primary/40',
                      ].join(' ')}
                    >
                      {option === 'short' ? 'Short & Simple' : 'Detailed & Insightful'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Preferred Reading Topics</p>
                <div className="flex flex-wrap gap-2">
                  {topicOptions.map((option) => {
                    const active = profile.preferredTopics?.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleMultiSelect('preferredTopics', option)}
                        className={[
                          'rounded-full border px-3 py-1.5 text-sm transition',
                          active
                            ? 'border-primary/70 bg-primary/15 text-foreground'
                            : 'border-border/70 bg-background/70 text-foreground hover:border-primary/40',
                        ].join(' ')}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/40 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Notifications & Personalization</p>
                <h3 className="text-lg font-semibold text-foreground">Stay connected to your spiritual journey.</h3>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'dailyGuidance', label: 'Daily Guidance', description: 'Receive a daily personalized spiritual insight.' },
                { key: 'readingReminders', label: 'Reading Reminders', description: 'Get reminders when it is time for your next reading.' },
                { key: 'insightUpdates', label: 'Insight Updates', description: 'Receive updates when new insights are available.' },
                { key: 'personalizedRecommendations', label: 'Personalized Recommendations', description: 'Use your profile context to personalize recommendations.' },
                { key: 'saveReadingHistory', label: 'Save Reading History', description: 'Keep your completed readings available in your history.' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {item.key === 'dailyGuidance' ? <Sparkles className="h-4 w-4" /> : item.key === 'readingReminders' ? <CalendarDays className="h-4 w-4" /> : item.key === 'insightUpdates' ? <Target className="h-4 w-4" /> : item.key === 'personalizedRecommendations' ? <Heart className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={profile[item.key as keyof ProfileState] as boolean}
                    onCheckedChange={() => handleToggle(item.key as keyof Pick<ProfileState, 'dailyGuidance' | 'readingReminders' | 'insightUpdates' | 'personalizedRecommendations' | 'saveReadingHistory'>)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="border-border/70 bg-background/60 text-foreground hover:bg-primary/5">
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground shadow-[0_0_25px_rgba(244,196,94,0.25)] hover:bg-primary/90">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isSaved ? <><Check className="mr-2 h-4 w-4" /> Saved</> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}