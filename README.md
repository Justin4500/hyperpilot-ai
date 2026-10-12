# HyperPilot AI — Autonomous Web Agent Platform

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.2+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-Free_Tier-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://hyperpilot-web.vercel.app)

<br/>

**HyperPilot AI is a modern full-stack autonomous web agent platform that converts natural language instructions into real-world browser execution via Chrome DevTools Protocol (CDP) and Google's Gemini LLMs.**

*Zero Paid Cloud Subscriptions • 100% Free Tier AI Integration • Dark Mode Telemetry Control Center • Safety Guardrails*

</div>

---

## 📌 Overview

HyperPilot AI transforms autonomous browser automation into an accessible, production-ready web application. Instead of writing brittle Selenium, Puppeteer, or Playwright scripts that break whenever web layouts change, users describe their objective in plain English.

HyperPilot automatically spins up a local Chromium session, inspects DOM elements, reasons about multi-step interaction plans, clicks buttons, scrolls pages, inputs text, extracts data, and returns structured results accompanied by live logs, action timelines, and viewport screenshot proofs.

### 🌟 Key Features

- 💬 **Natural Language Driven**: Type tasks like *"Find the top 3 books under £20 on books.toscrape.com and extract their prices"* — no selectors or XPath required.
- 🖥️ **Interactive Headful & Headless Modes**: Run Chrome silently in the background or watch the physical browser navigate, click, and extract live on your desktop.
- ⚡ **Real-Time Telemetry & Progress Stream**: Live status indicators, action timelines, duration timers, console logs, and final viewport screenshots.
- 🛡️ **Enterprise Safety Guardrails**: Built-in SSRF loopback protections (blocking `localhost`, private subnets, and cloud metadata IPs) and consequential action gates (blocking unauthorized financial transactions).
- 💾 **Persistent SQLite Audit History**: Every task, prompt, visited URL, action breakdown, error log, and extracted output is stored locally in SQLite.
- 🆓 **100% Free Development Workflow**: Runs on Google's free-tier Gemini API (`gemini-3.5-flash-lite`, `gemini-3.5-flash`, etc.) with zero initial API key required to explore.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        HyperPilot Frontend                             │
│         React 19 + TypeScript + Vite + Tailwind CSS v4                 │
│  (Dashboard • Task Execution View • Audit History • Health Diagnostics)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST (Port 5173 -> 8000)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        HyperPilot Backend                              │
│             FastAPI + SQLAlchemy + SQLite (hyperpilot.db)              │
│  (Task Lifecycle • Safety Policy Gates • SSRF Validation • Polling)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Async Background Worker
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Browser Automation Engine                         │
│            Browser-Use Core + Chrome DevTools Protocol (CDP)           │
│                                                                        │
│   ┌───────────────────────────┐      ┌─────────────────────────────┐   │
│   │   Google Gemini LLM       │◄────►│   Chromium Browser Session  │   │
│   │  (gemini-3.5-flash-lite)  │      │  (Headless or Interactive)  │   │
│   └───────────────────────────┘      └─────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Clsx |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, SQLAlchemy, Pydantic v2, Pytest |
| **AI Engine** | Google Gemini API (`gemini-3.5-flash-lite`, `gemini-3.5-flash`), ChatGoogle |
| **Browser Engine**| Browser-Use, Chrome DevTools Protocol (CDP), Google Chrome |
| **Database** | SQLite (Embedded persistence, zero external DB setup) |

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- **Python**: 3.11 or newer (Python 3.13 recommended)
- **Node.js**: v18+ (Node v20 or v22 recommended)
- **Google Chrome**: Installed locally
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

---

### 2. Installation

#### Clone the Repository:
```bash
git clone https://github.com/<your-username>/hyperpilot-ai.git
cd hyperpilot-ai
```

#### Set Up Python Virtual Environment:
```bash
# Windows PowerShell
py -3.13 -m venv .venv
.\.venv\Scripts\activate

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

#### Install Backend Dependencies:
```bash
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
python -m pip install -e . --no-deps
```

#### Install Frontend Dependencies:
```bash
cd frontend
npm install
cd ..
```

---

### 3. Configure Your Free Gemini API Key

Create `backend/.env` (or copy from `backend/.env.example`):
```bash
# backend/.env
GEMINI_API_KEY=your_free_gemini_api_key_here
DEFAULT_MODEL=gemini-3.5-flash-lite
BROWSER_HEADLESS=false
TASK_TIMEOUT_SECONDS=180
MAX_STEPS=20
ALLOW_SENSITIVE_ACTIONS=false
```

> **Note**: You can also launch the app without an API key to explore mock tasks, review the interface, and inspect the database.

---

### 4. Running the Application

Open two terminal windows:

#### Terminal 1 — Start FastAPI Backend:
```powershell
# Windows
.\start-backend.ps1

# Or generic shell:
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at `http://127.0.0.1:8000` (Interactive docs at `/docs`).*

#### Terminal 2 — Start React Frontend:
```powershell
# Windows
.\start-frontend.ps1

# Or generic shell:
cd frontend
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🎯 Example Use Cases to Try

| Category | Example Prompt |
| :--- | :--- |
| **E-Commerce** | `Go to books.toscrape.com, find the first 3 books in the Travel category, and extract their titles and prices in GBP.` |
| **Research** | `Go to quotes.toscrape.com and extract all quotes by Albert Einstein along with their tags.` |
| **Form Navigation**| `Go to quotes.toscrape.com, click the Login button, and verify if username and password fields are present.` |
| **Tech Scout** | `Go to python.org, find the latest stable Python release version and release date, and summarize key updates.` |
| **Documentation** | `Go to docs.python.org/3/library/json.html and copy the code snippet demonstrating json.dumps().` |

---

## 🧪 Testing & Verification

Run the automated backend test suite:
```bash
pytest backend/tests/test_api.py -v
```

Tests cover:
- ✅ **API Health & Diagnostics**: Ensures Chrome detection and Gemini configuration reporting.
- ✅ **Task CRUD Lifecycle**: Creating, listing, retrieving, cancelling, and deleting tasks.
- ✅ **SSRF Protection**: Rejection of `127.0.0.1`, `localhost`, private LAN CIDRs, and AWS/GCP metadata IPs (`169.254.169.254`).
- ✅ **Safety Keyword Filtering**: Policy interceptors for unauthorized payment and account deletion prompts.

Verify the frontend build:
```bash
cd frontend
npm run build
```

---

## 💼 Resume Bullet Points (For Software / AI Engineer Roles)

Feel free to adapt these bullet points for your resume or LinkedIn:

- **HyperPilot AI — Autonomous Full-Stack Web Agent Platform** *(Python, FastAPI, React 19, TypeScript, CDP)*
  - Engineered an end-to-end autonomous web agent platform converting natural language directives into multi-step browser interactions using **FastAPI**, **React 19**, and the **Chrome DevTools Protocol (CDP)**.
  - Implemented an asynchronous background execution pipeline with **SQLAlchemy/SQLite** persistence, enabling real-time telemetry streaming, duration benchmarking, action history logging, and high-resolution viewport captures.
  - Integrated **Google Gemini free-tier LLMs** (`gemini-3.5-flash-lite`) with automated model fallback and DOM-level reasoning, reducing task execution latency from 75s+ down to under 15 seconds.
  - Built enterprise security guardrails including **SSRF prevention** against loopback and cloud metadata endpoints (`169.254.169.254`) alongside regex-based consequential action gates for sensitive transactions.
  - Designed a modern, responsive dark-mode developer UI in **Tailwind CSS v4** featuring categorized task prompts, live log streams, step timelines, and system health monitors.

---

## 📄 License & Attribution

- Built on top of the open-source [Browser-Use](https://github.com/browser-use/browser-use) engine (MIT License, Copyright © 2024 Gregor Zunic).
- Full-stack architecture, FastAPI REST API, SQLite ORM models, React 19 dashboard, security guardrails, and Gemini free-tier optimizations created for HyperPilot AI.
- Distributed under the **MIT License**.
