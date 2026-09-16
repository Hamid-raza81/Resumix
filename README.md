# Resumix AI

A MERN-style AI interview preparation application based on the architecture of the tutorial project by Ankur Prajapati, adapted for Resumix.

## Features

- JWT authentication with HTTP-only cookies
- MongoDB persistence
- PDF resume text extraction
- Gemini structured interview report generation
- Match score, technical questions, behavioral questions, skill gaps and preparation roadmap
- ATS-oriented tailored resume PDF generation with Puppeteer
- Protected React routes
- Vite proxy for local frontend/backend development

## Requirements

- Node.js 20+ recommended
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Internet connection during dependency installation and Gemini/Puppeteer usage

## Local setup

### 1. Backend

```bash
cd Resumix/Backend
cp .env.example .env
npm install
npm run dev
```

Edit `.env` before starting the server.

### 2. Frontend

Open another terminal:

```bash
cd Resumix/Frontend
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`.

### 3. Test backend

Open `http://localhost:3000/api/health`. You should see:

```json
{"ok":true,"service":"resumix-backend"}
```

## Environment variables

See `Backend/.env.example`. Never commit `.env`.

## User flow

1. Register.
2. Login.
3. Upload a text-based PDF resume.
4. Paste the target job description.
5. Add a short self-description.
6. Generate the AI report.
7. Review match score, questions, skill gaps and roadmap.
8. Download the tailored resume PDF.
