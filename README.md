# Visual AI Workflow System

A visual, node-based workflow system built with **Next.js**, **React Flow** (`@xyflow/react`), **Inngest**, and **OpenAI/OpenRouter**.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ 
- **npm** (or `pnpm` / `yarn` / `bun`)

### 2. Environment Setup

Copy `.env.example` to `.env.local` and set your credentials:

```bash
cp .env.example .env.local
```

Ensure `.env.local` contains:
```env
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=openrouter/free
INNGEST_EVENT_KEY=local
INNGEST_SIGNING_KEY=local
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Running the Project

#### Run the Next.js Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

#### Run Inngest Dev Server (Optional / Background Workflows):
```bash
npx inngest-cli@latest dev
```
Open [http://localhost:8288](http://localhost:8288) to view the Inngest local development dashboard.

---

## 🛠️ Stack & Dependencies

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS, Shadcn UI
- **Workflow Canvas:** `@xyflow/react` (React Flow)
- **Orchestration:** `inngest`
- **AI Integration:** `openai` (configured with OpenRouter endpoint)
- **UI Icons & Utilities:** `lucide-react`, `clsx`, `tailwind-merge`

---

## 📁 Key Directory Structure

- `src/app/api/inngest/route.ts` - Inngest API serve handler
- `src/inngest/client.ts` - Inngest client configuration
- `src/components/ui/` - Shadcn UI components
