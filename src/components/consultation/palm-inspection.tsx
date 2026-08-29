'use client';

import { useState } from 'react';
import { 
  User, 
  Clock, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  Hand, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { PalmConsultationTicket } from './consultation-queue';

interface PalmInspectionProps {
  ticket: PalmConsultationTicket;
}

export function PalmInspection({ ticket }: PalmInspectionProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 p-6 space-y-6">
      {/* Client Details Section */}
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

      {/* Palm Image View */}
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

      {/* Lightbox / Full Screen Modal */}
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
