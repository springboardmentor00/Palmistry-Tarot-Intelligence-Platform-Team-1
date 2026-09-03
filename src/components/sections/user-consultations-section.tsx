'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileText,
  User,
  Star,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuthedFetch } from '@/components/auth/auth-provider';

export function UserConsultationsSection() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  const authedFetch = useAuthedFetch();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await authedFetch('/api/consultations');
        if (res.ok) {
          const data = await res.json();
          // Parse the JSON string from specialistNotes
          const parsedTickets = data.map((t: any) => {
            let parsedNotes = { notes: '', summary: '', rating: 0 };
            if (t.specialistNotes) {
              try { parsedNotes = JSON.parse(t.specialistNotes); } catch (e) {}
            }
            return { ...t, parsedNotes };
          });
          setTickets(parsedTickets);
        }
      } catch (e) {
        console.error("Failed to load tickets", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [authedFetch]);

  return (
    <div className="relative z-10 w-full pb-20 space-y-8">
      <header className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <MessageSquare className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-foreground">
              My Consultations
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Track your pending requests and read personalized insights from our human specialists.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading your inbox...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur border-border/50 p-12 text-center flex flex-col items-center">
            <MessageSquare className="w-12 h-12 mb-4 opacity-30 text-primary" />
            <h3 className="font-display text-lg font-semibold text-foreground">No Consultations Yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Send a reading for expert review to get started.
            </p>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="bg-card/60 backdrop-blur border-border/50 overflow-hidden transition-all hover:border-primary/40">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      TICKET-{ticket.id.substring(0, 8).toUpperCase()}
                    </span>
                    <Badge variant="outline" className={ticket.status.toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}>
                      {ticket.status.toLowerCase() === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {ticket.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground capitalize">{ticket.specialistType.replace('_', ' ')} Review</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {ticket.specialist?.name || 'Pending Assignment'}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setSelectedTicket(ticket)}
                  disabled={ticket.status.toLowerCase() !== 'completed'}
                  className={ticket.status.toLowerCase() === 'completed' ? 'bg-primary text-primary-foreground' : ''}
                  variant={ticket.status.toLowerCase() === 'completed' ? 'default' : 'secondary'}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {ticket.status.toLowerCase() === 'completed' ? 'Read Reply' : 'Pending Review'}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Reply Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        {selectedTicket && (
          <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-border/60">
            <DialogTitle className="flex items-center gap-2 text-xl font-display border-b border-border/50 pb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              Specialist Insights
            </DialogTitle>
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Reviewed By</p>
                  <p className="font-semibold text-foreground mt-1">{selectedTicket.specialist?.name}</p>
                  <p className="text-xs text-primary capitalize">{selectedTicket.specialistType.replace('_', ' ')}</p>
                </div>
                {selectedTicket.parsedNotes?.rating > 0 && (
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Guidance Rating</p>
                    <div className="flex text-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < selectedTicket.parsedNotes.rating ? 'fill-primary' : 'opacity-30'}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <FileText className="w-4 h-4 text-primary" /> Specialist Notes
                </h4>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.parsedNotes?.notes || "No additional notes provided."}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Executive Summary
                </h4>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.parsedNotes?.summary || "No executive summary provided."}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}