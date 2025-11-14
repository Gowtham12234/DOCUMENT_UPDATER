# Document Summary Assistant

A web application that accepts PDFs and scanned images, extracts text (PDF parsing + OCR), and generates smart summaries (short / medium / long). Built for a technical assessment.

## Features
- Upload PDF and image files (drag-and-drop or file picker)
- PDF text extraction (preserves basic formatting)
- OCR for images (Tesseract or cloud OCR)
- Smart summaries with three length options (short / medium / long)
- Highlight key points in the original document view
- Loading states and basic error handling
- Mobile-responsive UI

## Tech stack (example)
- Frontend: React (or Next.js / Vite)
- Backend: Node.js + Express (or Flask)
- OCR: Tesseract (local) or Google Cloud / OCR.space (optional)
- Summarization: OpenAI / Hugging Face / local algorithm
- Hosting: Vercel (frontend) + Render / Railway (backend)

## Local setup (example fullstack)
> Assumes repo has `/frontend` and `/backend`

### 1) Backend
```bash
cd backend
# create .env with required variables (see .env.example)
npm install
npm run dev         # starts on http://localhost:5000
