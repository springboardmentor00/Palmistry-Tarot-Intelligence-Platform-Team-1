'use client';

import { useState } from 'react';
import { FileEdit, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { PalmConsultationTicket } from './consultation-queue';

interface SpecialistNotesProps {
  ticket: PalmConsultationTicket;
  onCompleteReview: (ticketId: string, notes: string) => Promise<void>;
}

export function SpecialistNotes({ ticket, onCompleteReview }: SpecialistNotesProps) {
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
            <h3 className="font-display text-lg font-bold text-foreground">
              Specialist Review
            </h3>
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
