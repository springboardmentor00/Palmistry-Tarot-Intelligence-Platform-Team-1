'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Sparkles, Hand, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth, useAuthedFetch } from '@/components/auth/auth-provider';

import { ConsultationQueue, type PalmConsultationTicket } from '@/components/consultation/consultation-queue';
import { PalmInspection } from '@/components/consultation/palm-inspection';
import { ConfidenceScores } from '@/components/consultation/confidence-scores';
import { GeminiSynthesis } from '@/components/consultation/gemini-synthesis';
import { SpecialistNotes } from '@/components/consultation/specialist-notes';

interface PalmConsultationSectionProps {
  onBack?: () => void;
}

const AUTHORIZED_ROLES = ['Palm Reader', 'Palm Reader Specialist', 'PalmReader', 'Administrator'];

export function PalmConsultationSection({ onBack }: PalmConsultationSectionProps) {
  const { user } = useAuth();
  const authedFetch = useAuthedFetch();

  const [tickets, setTickets] = useState<PalmConsultationTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch('/api/consultations/pending');
      if (!res.ok) {
        throw new Error('Failed to load pending consultation queue');
      }
      const data = await res.json();
      const loadedTickets: PalmConsultationTicket[] = data.tickets || [];
      setTickets(loadedTickets);

      // Auto-select first pending ticket if none selected or current is no longer pending
      if (loadedTickets.length > 0) {
        setSelectedTicketId((prev) => {
          const stillExists = loadedTickets.some((t) => t.id === prev);
          return stillExists ? prev : loadedTickets[0].id;
        });
      } else {
        setSelectedTicketId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching pending tickets.');
    } finally {
      setLoading(false);
    }
  }, [authedFetch]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSelectTicket = (ticket: PalmConsultationTicket) => {
    setSelectedTicketId(ticket.id);
  };

  const handleCompleteReview = async (ticketId: string, notes: string) => {
    const res = await authedFetch(`/api/consultations/${ticketId}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specialistNotes: notes }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update review' }));
      throw new Error(err.detail || err.error || 'Failed to complete review');
    }

    // Optimistically update ticket status in state
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'Completed', specialistNotes: notes } : t))
    );

    // Select next pending ticket if available
    const remainingPending = tickets.filter((t) => t.id !== ticketId && t.status === 'Pending');
    if (remainingPending.length > 0) {
      setSelectedTicketId(remainingPending[0].id);
    } else {
      setSelectedTicketId(null);
    }
  };

  // ROLE SECURITY GUARD
  const isAuthorized = user && AUTHORIZED_ROLES.includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <Card className="bg-card/60 backdrop-blur border-destructive/30 p-8 space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto text-destructive">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            The Palm Consultation Workspace is strictly reserved for authenticated{' '}
            <span className="text-primary font-medium">Palm Reader Specialists</span>.
          </p>
          <div className="p-3 rounded-lg bg-secondary/40 text-xs text-muted-foreground">
            Current role: <span className="font-semibold text-foreground">{user?.role || 'Guest'}</span>
          </div>
        </Card>
      </div>
    );
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Hand className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                Specialist Console
              </span>
              <span className="opacity-40">•</span>
              <span className="text-xs text-muted-foreground font-mono">{user?.name}</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Palm Consultation Workspace
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={loading}
            className="border-border/60 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Queue
          </Button>
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="text-xs text-muted-foreground">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>
          )}
        </div>
      </div>

      {/* Workspace Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Consultation Queue */}
        <div className="lg:col-span-4 h-full">
          <ConsultationQueue
            tickets={tickets}
            selectedTicketId={selectedTicketId}
            onSelectTicket={handleSelectTicket}
            loading={loading}
            error={error}
            onRefresh={fetchTickets}
          />
        </div>

        {/* Right Column: Selected Consultation Detail Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTicket ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTicket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* 1. Palm Inspection View */}
                <PalmInspection ticket={selectedTicket} />

                {/* 2. Detected Palm Line Confidence */}
                <ConfidenceScores linesConfidence={selectedTicket.linesConfidence} />

                {/* 3. Gemini Initial Synthesis */}
                <GeminiSynthesis synthesis={selectedTicket.geminiSynthesis} />

                {/* 4. Specialist Interpretation & Notes */}
                <SpecialistNotes ticket={selectedTicket} onCompleteReview={handleCompleteReview} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <Card className="bg-card/60 backdrop-blur border-border/50 p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[450px]">
              <Hand className="w-12 h-12 mb-4 opacity-30 text-primary" />
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                No Ticket Selected
              </h3>
              <p className="text-xs max-w-sm">
                Select a pending consultation ticket from the queue on the left to begin reviewing.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
