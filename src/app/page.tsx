'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Hand,
  Layers,
  Brain,
  History,
  Menu,
  X,
  LogOut,
  LogIn,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Starfield } from '@/components/starfield';
import { HomeSection } from '@/components/sections/home-section';
import { PalmSection } from '@/components/sections/palm-section';
import { TarotSection } from '@/components/sections/tarot-section';
import { InsightsSection } from '@/components/sections/insights-section';
import { HistorySection } from '@/components/sections/history-section';
import { AuthScreen } from '@/components/auth/auth-screen';
import { useAuth } from '@/components/auth/auth-provider';

export type SectionId = 'home' | 'palm' | 'tarot' | 'insights' | 'history';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Sparkles },
  { id: 'palm', label: 'Palm Reading', icon: Hand, requiresAuth: true },
  { id: 'tarot', label: 'Tarot Reading', icon: Layers, requiresAuth: true },
  { id: 'insights', label: 'AI Insights', icon: Brain, requiresAuth: true },
  { id: 'history', label: 'History', icon: History, requiresAuth: true },
];

export default function Home() {
  const [section, setSection] = useState<SectionId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedReadings, setSavedReadings] = useState<
    { type: 'palm' | 'tarot'; summary: string; content: string }[]
  >([]);

  const { user, loading, logout } = useAuth();

  const navigate = (id: SectionId) => {
    setSection(id);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addReading = (r: {
    type: 'palm' | 'tarot';
    summary: string;
    content: string;
  }) => {
    setSavedReadings((prev) => [...prev, r]);
  };

  const handleNav = (id: SectionId) => {
    // If the section requires auth and user isn't logged in, stay on home (auth screen will show)
    if (NAV_ITEMS.find((n) => n.id === id)?.requiresAuth && !user) {
      // Show auth screen by switching to a virtual 'auth' state via the gating below
      setSection(id); // Set the section; the render will fall back to AuthScreen
      setMobileMenuOpen(false);
      return;
    }
    navigate(id);
  };

  const handleLogout = async () => {
    await logout();
    setSection('home');
    setSavedReadings([]);
  };

  // Show global loading screen while auth state resolves
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Starfield count={50} />
        <div className="relative z-10 text-center">
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/80 via-accent/70 to-primary/60 flex items-center justify-center glow-pulse mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground tracking-wider">
            Loading Mystica…
          </p>
        </div>
      </div>
    );
  }

  // Determine if current section requires auth and user is missing
  const currentNavItem = NAV_ITEMS.find((n) => n.id === section);
  const requiresAuth = currentNavItem?.requiresAuth ?? false;
  const showAuthScreen = requiresAuth && !user;

  return (
    <div className="relative min-h-screen flex flex-col">
      <Starfield count={70} />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-3 group"
            aria-label="Mystica home"
          >
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 via-accent/70 to-primary/60 flex items-center justify-center glow-pulse">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <div className="font-display text-lg font-bold tracking-wider text-foreground">
                MYSTICA
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground -mt-0.5">
                Palmistry · Tarot · AI
              </div>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              const locked = item.requiresAuth && !user;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={cn(
                    'relative px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
                    active
                      ? 'text-primary-foreground'
                      : locked
                        ? 'text-muted-foreground/60 hover:text-muted-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/90 to-accent/80"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                  {locked && (
                    <LockIcon className="w-3 h-3 relative z-10 opacity-60" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Auth controls */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/50">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSection('palm')}
                className="border-primary/40 hover:bg-primary/10 hidden lg:flex"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Sign In
              </Button>
            )}

            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border/50 bg-background/95"
            >
              <div className="container mx-auto px-4 py-2 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = section === item.id;
                  const locked = item.requiresAuth && !user;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={cn(
                        'px-4 py-2.5 rounded-md text-sm font-medium transition-all flex items-center gap-3',
                        active
                          ? 'bg-secondary text-primary'
                          : 'text-muted-foreground hover:bg-secondary/40'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                      {locked && <LockIcon className="w-3 h-3 opacity-60 ml-auto" />}
                    </button>
                  );
                })}
                {!user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSection('palm');
                      setMobileMenuOpen(false);
                    }}
                    className="mt-2 border-primary/40"
                  >
                    <LogIn className="w-3.5 h-3.5 mr-1.5" />
                    Sign In / Register
                  </Button>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={showAuthScreen ? 'auth' : section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {showAuthScreen ? (
              <AuthScreen />
            ) : section === 'home' ? (
              <HomeSection onNavigate={handleNav} savedCount={savedReadings.length} />
            ) : section === 'palm' ? (
              <PalmSection onReadingComplete={addReading} />
            ) : section === 'tarot' ? (
              <TarotSection onReadingComplete={addReading} />
            ) : section === 'insights' ? (
              <InsightsSection readings={savedReadings} />
            ) : section === 'history' ? (
              <HistorySection />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-border/50 bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-display tracking-wide">MYSTICA</span>
            <span className="opacity-60">·</span>
            <span>AI-Powered Palmistry & Tarot Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Vision LLM · GLM-5V</span>
            <span className="opacity-60">·</span>
            <span>Text LLM · GLM-4.5</span>
            <span className="opacity-60">·</span>
            <span>JWT Authenticated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
