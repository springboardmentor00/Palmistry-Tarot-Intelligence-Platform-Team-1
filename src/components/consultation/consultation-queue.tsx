'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Clock, 
  User, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export interface PalmConsultationTicket {
  id: string;
  ticketId: string;
  clientName: string;
  clientEmail?: string;
  submissionDate: string;
  status: 'Pending' | 'Completed';
  palmImageUrl: string;
  handType: 'left' | 'right';
  linesConfidence: {
    lifeLine: number;
    headLine: number;
    heartLine: number;
    fateLine: number;
    sunLine: number;
  };
  geminiSynthesis: string;
  specialistNotes?: string;
}

interface ConsultationQueueProps {
  tickets: PalmConsultationTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticket: PalmConsultationTicket) => void;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function ConsultationQueue({
  tickets,
  selectedTicketId,
  onSelectTicket,
  loading,
  error,
  onRefresh,
}: ConsultationQueueProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const pendingTickets = tickets.filter(
    (t) =>
      t.status === 'Pending' &&
      (t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide">
              Pending Queue
            </h2>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Fetching tickets...' : `${pendingTickets.length} pending consultations`}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 w-8 border-border/60 hover:bg-secondary/40 shrink-0"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Search Input */}
      <div className="mt-4 relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by ticket or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-8 text-xs bg-background/40 border-border/50"
        />
      </div>

      {/* Queue Items List */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1 max-h-[580px]">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 rounded-xl border border-border/40 bg-background/30 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center space-y-2 my-4">
            <AlertCircle className="w-6 h-6 text-destructive mx-auto" />
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="text-xs h-7">
              Retry
            </Button>
          </div>
        ) : pendingTickets.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/80" />
            <p className="font-medium text-sm text-foreground">Queue Empty</p>
            <p className="text-xs max-w-[200px] mx-auto">
              No pending palm consultation tickets at the moment.
            </p>
          </div>
        ) : (
          pendingTickets.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectTicket(ticket)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group relative ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                    : 'border-border/50 bg-background/40 hover:border-primary/40 hover:bg-secondary/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {ticket.ticketId}
                  </span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0">
                    Pending
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      {ticket.clientName}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {ticket.submissionDate}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isSelected ? 'default' : 'secondary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTicket(ticket);
                    }}
                    className="h-8 px-3 text-xs shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Review
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}
