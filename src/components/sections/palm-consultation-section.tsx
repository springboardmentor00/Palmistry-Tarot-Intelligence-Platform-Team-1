'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileEdit,
  FileText,
  Hand,
  Heart,
  Loader2,
  Maximize2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useAuthedFetch } from '@/components/auth/auth-provider';

interface PalmConsultationTicket {
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

interface PalmInspectionProps {
  ticket: PalmConsultationTicket;
}

interface ConfidenceScoresProps {
  linesConfidence: PalmConsultationTicket['linesConfidence'];
}

interface GeminiSynthesisProps {
  synthesis: string;
}

interface SpecialistNotesProps {
  ticket: PalmConsultationTicket;
  onCompleteReview: (ticketId: string, notes: string) => Promise<void>;
}

// Added backend roles to match your Prisma schema
const AUTHORIZED_ROLES = ['palm_reader', 'admin', 'Palm Reader', 'Palm Reader Specialist', 'PalmReader', 'Administrator'];

const INITIAL_TICKETS: PalmConsultationTicket[] = [
  {
    id: 't-101',
    ticketId: 'PALM-2026-001',
    clientName: 'Aria Vance',
    clientEmail: 'aria.vance@example.com',
    submissionDate: 'Aug 29, 2026 14:15',
    status: 'Pending',
    palmImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%230f172a"/><path d="M120 420 C100 350, 90 280, 110 200 C115 150, 130 90, 140 70 C145 60, 155 60, 160 70 C165 100, 170 170, 175 210 C180 150, 195 70, 205 50 C210 40, 220 40, 225 50 C230 90, 235 170, 238 210 C245 150, 260 90, 270 70 C275 60, 285 60, 290 70 C295 110, 290 190, 285 240 C295 200, 310 160, 320 150 C325 145, 335 150, 335 160 C330 200, 305 280, 290 350 C270 420, 220 460, 170 460 C140 460, 125 440, 120 420 Z" fill="%231e293b" stroke="%236366f1" stroke-width="3"/><path d="M140 280 Q 200 330, 260 280" fill="none" stroke="%23ec4899" stroke-width="4" stroke-linecap="round"/><path d="M135 240 Q 210 240, 270 200" fill="none" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><path d="M160 380 Q 150 280, 210 220" fill="none" stroke="%2310b981" stroke-width="4" stroke-linecap="round"/><path d="M210 430 Q 215 320, 215 210" fill="none" stroke="%23f59e0b" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,4"/><path d="M255 360 Q 260 280, 262 230" fill="none" stroke="%23facc15" stroke-width="3" stroke-linecap="round"/><circle cx="210" cy="220" r="6" fill="%23a855f7"/><circle cx="260" cy="280" r="6" fill="%23ec4899"/><circle cx="270" cy="200" r="6" fill="%2338bdf8"/><circle cx="160" cy="380" r="6" fill="%2310b981"/><text x="200" y="480" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="12">Client Palm Scan #PALM-2026-001</text></svg>',
    handType: 'right',
    linesConfidence: {
      lifeLine: 0.92,
      headLine: 0.87,
      heartLine: 0.90,
      fateLine: 0.76,
      sunLine: 0.81,
    },
    geminiSynthesis:
      'Initial Vision Synthesis:\nThe right hand exhibits a deep, unbroken Life Line (92% confidence) indicating strong vitality and resilience. The Head Line (87% confidence) slopes gently towards the Mount of Moon, suggesting creative intelligence and intuitive analytical skill. Heart Line (90%) is curved towards Jupiter, signaling deep emotional loyalty. Fate Line (76%) and Sun Line (81%) point towards strong career autonomy and creative realization.',
  },
  {
    id: 't-102',
    ticketId: 'PALM-2026-002',
    clientName: 'Julian Hayes',
    clientEmail: 'julian.h@example.com',
    submissionDate: 'Aug 29, 2026 15:40',
    status: 'Pending',
    palmImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%230f172a"/><path d="M120 420 C100 350, 90 280, 110 200 C115 150, 130 90, 140 70 C145 60, 155 60, 160 70 C165 100, 170 170, 175 210 C180 150, 195 70, 205 50 C210 40, 220 40, 225 50 C230 90, 235 170, 238 210 C245 150, 260 90, 270 70 C275 60, 285 60, 290 70 C295 110, 290 190, 285 240 C295 200, 310 160, 320 150 C325 145, 335 150, 335 160 C330 200, 305 280, 290 350 C270 420, 220 460, 170 460 C140 460, 125 440, 120 420 Z" fill="%231e293b" stroke="%2338bdf8" stroke-width="3"/><path d="M140 290 Q 200 340, 260 290" fill="none" stroke="%23f43f5e" stroke-width="4" stroke-linecap="round"/><path d="M135 250 Q 210 230, 270 190" fill="none" stroke="%230ea5e9" stroke-width="4" stroke-linecap="round"/><path d="M155 390 Q 145 290, 205 230" fill="none" stroke="%2310b981" stroke-width="4" stroke-linecap="round"/><path d="M210 420 Q 210 330, 210 220" fill="none" stroke="%23d97706" stroke-width="3" stroke-linecap="round"/><path d="M255 350 Q 258 290, 260 240" fill="none" stroke="%23eab308" stroke-width="3" stroke-linecap="round"/><text x="200" y="480" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="12">Client Palm Scan #PALM-2026-002</text></svg>',
    handType: 'left',
    linesConfidence: {
      lifeLine: 0.89,
      headLine: 0.94,
      heartLine: 0.85,
      fateLine: 0.80,
      sunLine: 0.75,
    },
    geminiSynthesis:
      'Initial Vision Synthesis:\nJulian’s left hand demonstrates an exceptionally straight Head Line (94% confidence), reflecting sharp pragmatic focus and objective logic. The Life Line (89%) curves gracefully around the Venus mount. Fate line is unbroken up to Saturn, suggesting early career stability.',
  },
  {
    id: 't-103',
    ticketId: 'PALM-2026-003',
    clientName: 'Evelyn Thorne',
    clientEmail: 'evelyn.t@example.com',
    submissionDate: 'Aug 29, 2026 17:05',
    status: 'Pending',
    palmImageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%230f172a"/><path d="M120 420 C100 350, 90 280, 110 200 C115 150, 130 90, 140 70 C145 60, 155 60, 160 70 C165 100, 170 170, 175 210 C180 150, 195 70, 205 50 C210 40, 220 40, 225 50 C230 90, 235 170, 238 210 C245 150, 260 90, 270 70 C275 60, 285 60, 290 70 C295 110, 290 190, 285 240 C295 200, 310 160, 320 150 C325 145, 335 150, 335 160 C330 200, 305 280, 290 350 C270 420, 220 460, 170 460 C140 460, 125 440, 120 420 Z" fill="%231e293b" stroke="%23a855f7" stroke-width="3"/><path d="M140 280 Q 200 320, 260 270" fill="none" stroke="%23f43f5e" stroke-width="4" stroke-linecap="round"/><path d="M135 240 Q 210 250, 270 210" fill="none" stroke="%2338bdf8" stroke-width="4" stroke-linecap="round"/><path d="M160 380 Q 150 270, 210 210" fill="none" stroke="%2310b981" stroke-width="4" stroke-linecap="round"/><path d="M210 430 Q 215 320, 215 210" fill="none" stroke="%23f59e0b" stroke-width="3" stroke-linecap="round"/><path d="M255 360 Q 260 280, 262 230" fill="none" stroke="%23facc15" stroke-width="3" stroke-linecap="round"/><text x="200" y="480" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="12">Client Palm Scan #PALM-2026-003</text></svg>',
    handType: 'right',
    linesConfidence: {
      lifeLine: 0.95,
      headLine: 0.88,
      heartLine: 0.92,
      fateLine: 0.82,
      sunLine: 0.85,
    },
    geminiSynthesis:
      'Initial Vision Synthesis:\nEvelyn’s right hand features a prominent Sun Line (85%) intersecting with the Fate Line, indicating strong artistic leadership and public recognition. Heart Line (92%) exhibits warmth and high emotional empathy.',
  },
];

function ConsultationQueue({
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
      <div className="flex items-center justify-between pb-4 border-b border-border/50 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide">Pending Queue</h2>
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

      <div className="mt-4 relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by ticket or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-8 text-xs bg-background/40 border-border/50"
        />
      </div>

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
                  <span className="font-mono text-xs font-semibold text-primary">{ticket.ticketId}</span>
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

function PalmInspection({ ticket }: PalmInspectionProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));

  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {ticket.ticketId}
            </span>
            <Badge
              variant="outline"
              className={
                ticket.status === 'Pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }
            >
              {ticket.status}
            </Badge>
            <Badge variant="secondary" className="text-[11px] capitalize">
              {ticket.handType} Hand Scan
            </Badge>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {ticket.clientName}
          </h2>
          {ticket.clientEmail && (
            <p className="text-xs text-muted-foreground mt-0.5">{ticket.clientEmail}</p>
          )}
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Submitted: {ticket.submissionDate}
          </div>
          <div className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Identity Verified
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Hand className="w-4 h-4 text-primary" />
            Uploaded Palm Image
          </h3>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              className="h-7 w-7 border-border/50 text-muted-foreground hover:text-foreground"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-mono w-10 text-center text-muted-foreground">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              className="h-7 w-7 border-border/50 text-muted-foreground hover:text-foreground"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-7 px-2 text-xs border-border/50 text-muted-foreground hover:text-foreground ml-1"
            >
              <Maximize2 className="w-3 h-3 mr-1" />
              Full Screen
            </Button>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-black/40 min-h-[300px] flex items-center justify-center p-4 group">
          <div className="overflow-auto max-h-[420px] w-full flex items-center justify-center">
            <img
              src={ticket.palmImageUrl}
              alt={`${ticket.clientName}'s palm`}
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[380px] w-auto object-contain transition-transform duration-200 ease-out rounded-lg shadow-2xl"
            />
          </div>

          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur border border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary" />
            High-Resolution Vision Capture
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border-border/60 p-6 flex flex-col items-center">
          <DialogTitle className="text-base font-display font-semibold flex items-center justify-between w-full pb-3 border-b border-border/50">
            <span>Palm Image Inspection - {ticket.clientName} ({ticket.ticketId})</span>
          </DialogTitle>
          <div className="relative w-full flex items-center justify-center p-4 max-h-[75vh] overflow-auto">
            <img
              src={ticket.palmImageUrl}
              alt={`${ticket.clientName}'s palm detailed view`}
              className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function ConfidenceScores({ linesConfidence }: ConfidenceScoresProps) {
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

function GeminiSynthesis({ synthesis }: GeminiSynthesisProps) {
  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Gemini Initial Synthesis</h3>
            <p className="text-xs text-muted-foreground">
              AI-generated structural analysis based on vision line confidence
            </p>
          </div>
        </div>

        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-xs px-2.5 py-1 flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5" />
          AI Initial Output
        </Badge>
      </div>

      <div className="p-4.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <span>Automated Reading Baseline</span>
          <span className="opacity-40">•</span>
          <span className="text-[11px] text-muted-foreground normal-case font-normal">
            For Palm Specialist Review & Refinement
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-200 font-normal whitespace-pre-line">
          {synthesis}
        </p>
      </div>

      <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Note: This synthesis was auto-generated by Gemini 3.6 Flash. Specialist interpretation is required to finalize the reading.
        </span>
      </div>
    </Card>
  );
}

function SpecialistNotes({ ticket, onCompleteReview }: SpecialistNotesProps) {
  const [notes, setNotes] = useState(ticket.specialistNotes || '');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleComplete = async () => {
    if (!notes.trim()) {
      setValidationError('Specialist Interpretation & Notes cannot be empty.');
      return;
    }
    setValidationError(null);
    setSubmitting(true);
    try {
      await onCompleteReview(ticket.id, notes);
      toast({
        title: 'Review Completed',
        description: 'Palm consultation review completed successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Submission Error',
        description: err.message || 'Failed to complete review.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <FileEdit className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Specialist Review</h3>
            <p className="text-xs text-muted-foreground">
              Add your expert palmistry observations, guidance & final diagnosis
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialist-notes" className="text-xs uppercase tracking-wider font-semibold text-foreground">
          Specialist Interpretation & Notes
        </Label>
        <Textarea
          id="specialist-notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (validationError) setValidationError(null);
          }}
          placeholder="Enter your expert interpretation, line corrections, personal insights, and consultation guidance for the client..."
          className="min-h-[160px] bg-background/50 border-border/60 focus:border-primary text-sm leading-relaxed"
        />
        {validationError && (
          <div className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            {validationError}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          onClick={handleComplete}
          disabled={submitting}
          className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 px-6 h-11 text-sm font-semibold shadow-lg shadow-primary/20"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Completing Review...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Review
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

// 1. Converted to a standard exported component
export function PalmConsultationSection() {
  const { user } = useAuth();
  const authedFetch = useAuthedFetch();
  const [tickets, setTickets] = useState<PalmConsultationTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authedFetch('/api/consultations');
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();
      
      // Map the PostgreSQL Database Consultation to the UI's Ticket interface
      const formattedTickets: PalmConsultationTicket[] = data.map((t: any) => {
        let rawData: any = {};
        try { rawData = typeof t.reading?.rawData === 'string' ? JSON.parse(t.reading.rawData) : (t.reading?.rawData || {}); } catch(e) {}
        
        const lines = rawData.lines || {};
        const getConf = (key: string) => (lines[key]?.confidence || 0.85); // fallback to 85% if missing

        return {
          id: t.id,
          ticketId: `PALM-${t.id.substring(0, 8).toUpperCase()}`,
          clientName: t.client?.name || 'Seeker',
          clientEmail: t.client?.email || 'seeker@mystica.com',
          submissionDate: new Date(t.createdAt).toLocaleString(),
          status: t.status === 'Completed' ? 'Completed' : 'Pending',
          palmImageUrl: t.reading?.imageUrl || '/sample-palm.jpg', // Fallback image
          handType: rawData.handType || 'right',
          linesConfidence: {
            lifeLine: getConf('life_line'),
            headLine: getConf('head_line'),
            heartLine: getConf('heart_line'),
            fateLine: getConf('fate_line'),
            sunLine: getConf('sun_line'),
          },
          geminiSynthesis: t.reading?.personalitySynthesis || t.reading?.summary || 'No AI synthesis available for this older record.',
          specialistNotes: t.specialistNotes ? JSON.parse(t.specialistNotes).notes : '',
        };
      });

      setTickets(formattedTickets);
      
      // Auto-select the first pending ticket if none is selected
      const pending = formattedTickets.filter(t => t.status === 'Pending');
      if (pending.length > 0) {
        setSelectedTicketId(pending[0].id);
      } else {
        setSelectedTicketId(null);
      }
    } catch (err: any) {
      setError(err.message);
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
    // 1. Send the review to PostgreSQL
    const res = await authedFetch(`/api/consultations/${ticketId}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        specialistNotes: notes, 
        summary: "Specialist has completed the review of your palm lines.", 
        rating: 5 
      })
    });

    if (!res.ok) {
      throw new Error("Failed to save review to the database.");
    }

    // 2. Update local UI state
    setTickets((prev) => {
      // FIX: Added `as 'Completed'` to strictly satisfy TypeScript
      const updated = prev.map((t) => (t.id === ticketId ? { ...t, status: 'Completed' as 'Completed', specialistNotes: notes } : t));
      
      // Auto-select the next pending ticket in the queue
      const remainingPending = updated.filter((t) => t.id !== ticketId && t.status === 'Pending');
      if (remainingPending.length > 0) {
        setSelectedTicketId(remainingPending[0].id);
      } else {
        setSelectedTicketId(null);
      }
      return updated;
    });
  };

  const isAuthorized = !!user && AUTHORIZED_ROLES.includes(user.role);

  return (
    // 3. Removed the `relative min-h-screen` and `<Starfield />` background
    <div className="relative z-10 w-full pb-20">
      {!isAuthorized ? (
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
      ) : (
        <div className="space-y-6">
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
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
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

            <div className="lg:col-span-8 space-y-6">
              {selectedTicketId ? (
                (() => {
                  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
                  return selectedTicket ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedTicket.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        <PalmInspection ticket={selectedTicket} />
                        <ConfidenceScores linesConfidence={selectedTicket.linesConfidence} />
                        <GeminiSynthesis synthesis={selectedTicket.geminiSynthesis} />
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
                  );
                })()
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
      )}
    </div>
  );
}