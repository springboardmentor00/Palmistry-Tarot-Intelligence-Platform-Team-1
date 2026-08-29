from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict

router = APIRouter(prefix="/api/consultations", tags=["Palm Consultations"])

class ReviewSubmission(BaseModel):
    specialistNotes: str

# In-memory store for consultation tickets in Python backend
MOCK_CONSULTATION_TICKETS = [
    {
        "id": "t-101",
        "ticketId": "PALM-2026-001",
        "clientName": "Aria Vance",
        "clientEmail": "aria.vance@example.com",
        "submissionDate": "Aug 29, 2026 14:15",
        "status": "Pending",
        "palmImageUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"500\" viewBox=\"0 0 400 500\"><rect width=\"100%\" height=\"100%\" fill=\"%230f172a\"/><path d=\"M120 420 C100 350, 90 280, 110 200 C115 150, 130 90, 140 70 C145 60, 155 60, 160 70 C165 100, 170 170, 175 210 C180 150, 195 70, 205 50 C210 40, 220 40, 225 50 C230 90, 235 170, 238 210 C245 150, 260 90, 270 70 C275 60, 285 60, 290 70 C295 110, 290 190, 285 240 C295 200, 310 160, 320 150 C325 145, 335 150, 335 160 C330 200, 305 280, 290 350 C270 420, 220 460, 170 460 C140 460, 125 440, 120 420 Z\" fill=\"%231e293b\" stroke=\"%236366f1\" stroke-width=\"3\"/><path d=\"M140 280 Q 200 330, 260 280\" fill=\"none\" stroke=\"%23ec4899\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M135 240 Q 210 240, 270 200\" fill=\"none\" stroke=\"%2338bdf8\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M160 380 Q 150 280, 210 220\" fill=\"none\" stroke=\"%2310b981\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M210 430 Q 215 320, 215 210\" fill=\"none\" stroke=\"%23f59e0b\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-dasharray=\"6,4\"/><path d=\"M255 360 Q 260 280, 262 230\" fill=\"none\" stroke=\"%23facc15\" stroke-width=\"3\" stroke-linecap=\"round\"/><circle cx=\"210\" cy=\"220\" r=\"6\" fill=\"%23a855f7\"/><circle cx=\"260\" cy=\"280\" r=\"6\" fill=\"%23ec4899\"/><circle cx=\"270\" cy=\"200\" r=\"6\" fill=\"%2338bdf8\"/><circle cx=\"160\" cy=\"380\" r=\"6\" fill=\"%2310b981\"/><text x=\"200\" y=\"480\" text-anchor=\"middle\" fill=\"%2394a3b8\" font-family=\"sans-serif\" font-size=\"12\">Client Palm Scan #PALM-2026-001</text></svg>",
        "handType": "right",
        "linesConfidence": {
            "lifeLine": 0.92,
            "headLine": 0.87,
            "heartLine": 0.90,
            "fateLine": 0.76,
            "sunLine": 0.81
        },
        "geminiSynthesis": "Initial Vision Synthesis:\nThe right hand exhibits a deep, unbroken Life Line (92% confidence) indicating strong vitality and resilience. The Head Line (87% confidence) slopes gently towards the Mount of Moon, suggesting creative intelligence and intuitive analytical skill. Heart Line (90%) is curved towards Jupiter, signaling deep emotional loyalty. Fate Line (76%) and Sun Line (81%) point towards strong career autonomy and creative realization."
    },
    {
        "id": "t-102",
        "ticketId": "PALM-2026-002",
        "clientName": "Julian Hayes",
        "clientEmail": "julian.h@example.com",
        "submissionDate": "Aug 29, 2026 15:40",
        "status": "Pending",
        "palmImageUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"500\" viewBox=\"0 0 400 500\"><rect width=\"100%\" height=\"100%\" fill=\"%230f172a\"/><path d=\"M120 420 C100 350, 90 280, 110 200 C115 150, 130 90, 140 70 C145 60, 155 60, 160 70 C165 100, 170 170, 175 210 C180 150, 195 70, 205 50 C210 40, 220 40, 225 50 C230 90, 235 170, 238 210 C245 150, 260 90, 270 70 C275 60, 285 60, 290 70 C295 110, 290 190, 285 240 C295 200, 310 160, 320 150 C325 145, 335 150, 335 160 C330 200, 305 280, 290 350 C270 420, 220 460, 170 460 C140 460, 125 440, 120 420 Z\" fill=\"%231e293b\" stroke=\"%2338bdf8\" stroke-width=\"3\"/><path d=\"M140 290 Q 200 340, 260 290\" fill=\"none\" stroke=\"%23f43f5e\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M135 250 Q 210 230, 270 190\" fill=\"none\" stroke=\"%230ea5e9\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M155 390 Q 145 290, 205 230\" fill=\"none\" stroke=\"%2310b981\" stroke-width=\"4\" stroke-linecap=\"round\"/><path d=\"M210 420 Q 210 330, 210 220\" fill=\"none\" stroke=\"%23d97706\" stroke-width=\"3\" stroke-linecap=\"round\"/><path d=\"M255 350 Q 258 290, 260 240\" fill=\"none\" stroke=\"%23eab308\" stroke-width=\"3\" stroke-linecap=\"round\"/><text x=\"200\" y=\"480\" text-anchor=\"middle\" fill=\"%2394a3b8\" font-family=\"sans-serif\" font-size=\"12\">Client Palm Scan #PALM-2026-002</text></svg>",
        "handType": "left",
        "linesConfidence": {
            "lifeLine": 0.89,
            "headLine": 0.94,
            "heartLine": 0.85,
            "fateLine": 0.80,
            "sunLine": 0.75
        },
        "geminiSynthesis": "Initial Vision Synthesis:\nJulian’s left hand demonstrates a exceptionally straight Head Line (94% confidence), reflecting sharp pragmatic focus and objective logic. The Life Line (89%) curves gracefully around the Venus mount. Fate line is unbroken up to Saturn, suggesting early career stability."
    },
    {
        "id": "t-103",
        "ticketId": "PALM-2026-003",
        "clientName": "Evelyn Thorne",
        "clientEmail": "evelyn.t@example.com",
        "submissionDate": "Aug 29, 2026 17:05",
        "status": "Pending",
        "palmImageUrl": "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"500\" viewBox=\"0 0 400 500\"><rect width=\"100%\" height=\"100%\" fill=\"%230f172a\"/><path d=\"M120 420 C100 350, 90 280, 110 200 C115 150, 130 90, 140 70 C145 60, 155 60, 160 70 C165 100, 170 170, 175 210 C180 150, 195 70, 205 50 C210 40, 220 40, 225 50 C230 90, 235 170, 238 210 C245 150, 260 90, 270 70 C275 60, 285 60, 290 70 C295 110, 290 190, 285 240 C295 200, 310 160, 320 150 C325 145, 335 150, 335 160 C330 200, 305 280, 290 350 C270 420, 220 460, 170 460 C140 460, 125 440, 120 420 Z\" fill=\"%231e293b\" stroke=\"%23a855f7\" stroke-width=\"3\"/><path d=\"M140 280 Q 200 320, 260 270\" fill=\"none\" stroke=\"%23f43f5e\" stroke-width=\"4\" stroke-linecap="round\"/><path d=\"M135 240 Q 210 250, 270 210\" fill="none" stroke=\"%2338bdf8\" stroke-width=\"4\" stroke-linecap="round\"/><path d=\"M160 380 Q 150 270, 210 210\" fill="none" stroke=\"%2310b981\" stroke-width=\"4\" stroke-linecap="round\"/><path d=\"M210 430 Q 215 320, 215 210\" fill="none" stroke=\"%23f59e0b\" stroke-width=\"3\" stroke-linecap="round\"/><path d=\"M255 360 Q 260 280, 262 230\" fill="none" stroke=\"%23facc15\" stroke-width=\"3\" stroke-linecap="round\"/><text x=\"200\" y=\"480\" text-anchor=\"middle\" fill=\"%2394a3b8\" font-family=\"sans-serif\" font-size=\"12\">Client Palm Scan #PALM-2026-003</text></svg>",
        "handType": "right",
        "linesConfidence": {
            "lifeLine": 0.95,
            "headLine": 0.88,
            "heartLine": 0.92,
            "fateLine": 0.82,
            "sunLine": 0.85
        },
        "geminiSynthesis": "Initial Vision Synthesis:\nEvelyn’s right hand features a prominent Sun Line (85%) intersecting with the Fate Line, indicating strong artistic leadership and public recognition. Heart Line (92%) exhibits warmth and high emotional empathy."
    }
]

@router.get("/pending")
async def get_pending_consultations():
    pending = [t for t in MOCK_CONSULTATION_TICKETS if t["status"] == "Pending"]
    return {"tickets": pending}

@router.get("/{ticket_id}")
async def get_consultation_details(ticket_id: str):
    ticket = next((t for t in MOCK_CONSULTATION_TICKETS if t["id"] == ticket_id or t["ticketId"] == ticket_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Consultation ticket not found")
    return {"ticket": ticket}

@router.put("/{ticket_id}/review")
async def complete_consultation_review(ticket_id: str, submission: ReviewSubmission):
    if not submission.specialistNotes.strip():
        raise HTTPException(status_code=400, detail="Specialist Interpretation & Notes cannot be empty")
    
    ticket = next((t for t in MOCK_CONSULTATION_TICKETS if t["id"] == ticket_id or t["ticketId"] == ticket_id), None)
    if not ticket:
        raise HTTPException(status_code=404, detail="Consultation ticket not found")
    
    ticket["status"] = "Completed"
    ticket["specialistNotes"] = submission.specialistNotes
    return {
        "message": "Palm consultation review completed successfully.",
        "ticket": ticket
    }
