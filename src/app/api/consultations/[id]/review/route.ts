import { NextRequest, NextResponse } from 'next/server';
import { updateTicketInStore } from '../../pending/route';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { specialistNotes } = body;

    if (!specialistNotes || typeof specialistNotes !== 'string' || !specialistNotes.trim()) {
      return NextResponse.json(
        { error: 'Specialist Interpretation & Notes cannot be empty' },
        { status: 400 }
      );
    }

    const updated = updateTicketInStore(id, specialistNotes);
    if (!updated) {
      return NextResponse.json(
        { error: `Consultation ticket ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Palm consultation review completed successfully.',
      ticket: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to complete review' },
      { status: 500 }
    );
  }
}
