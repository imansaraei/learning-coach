# Generative Living Chapter Synthesis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the codex from a static textbook into a living manuscript where each subsequent chapter's entire lesson, diagram, and inquiry are authored dynamically by the AI around the reader's personal confession.

**Architecture:** Extend `/api/coach` and `geminiService` with a Chapter Synthesis contract that takes the next milestone scaffold (`nextModule`) and generates the complete tailored `GeneratedModuleContent`. `App.tsx` stores authored modules in persisted book state, and `ModuleReader.tsx` dynamically renders the personalized folio with smooth `LivingInkText` streaming and 3D page curl.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4, Cloudflare Pages Functions (Edge Workers), Google Gemini API (`gemini-2.5-flash`).

**Spec:** `docs/superpowers/specs/2026-11-04-living-chapter-generation-design.md`

## Global Constraints

- Never use raw chat bubbles, dialog modals, or generic markdown dumps on book pages; folios must strictly preserve classical parchment aesthetics (`#f4eee0`, iron-gall ink `#1c2430`, scholar indigo ink `#162744`).
- Written inscriptions on parchment are permanent physical records; pages lock once inscribed, and re-authoring is done via "شروع مجدد کتاب" (Restart Book).
- Maximum generated concept narrative length: 140–180 words in authentic author persona (Angela Duckworth for *Situated*, Charles Duhigg for *The Power of Habit*, James Clear for *Atomic Habits*, Daniel Kahneman for *Thinking, Fast and Slow*).
- Complete offline / keyless parity: deterministic behavioral synthesizer must produce tailored `generated_next_module` without crashes when disconnected.

## Review Focus

1. **Final chapter transition**: On final module of curriculum, `nextModule` is `null`; verify no undefined property access and proper transition to Golden Blueprint.
2. **Parchment page-turn state persistence**: Flipping backward to previously authored chapters and forward again must not re-trigger API calls or overwrite existing custom folios.
3. **Persian text layout stability in dynamic diagrams**: Verify generated diagram step labels and descriptions do not overflow or cause scrollbars on double-page or single-page view.
4. **Offline fallback data completeness**: Test that offline mode returns valid `generated_next_module` containing all required fields (`headline`, `concept`, `keyTakeaway`, `question`, `diagramSteps`).
5. **Fast-forward on dynamic stream**: Verify clicking dynamically generated `LivingInkText` immediately displays full personalized text without glitching.

---

### Task 1: Extend Types & Chapter Synthesis Contracts

**Files:**
- Modify: `src/types/index.ts:1-70`

**Interfaces:**
- Consumes: Existing `ModuleData`, `BookCurriculum`, `DynamicCoachingResult`.
- Produces: `GeneratedModuleContent`, updated `DynamicCoachingResult`, updated `generateCoachingResponse` signature.

- [ ] **Step 1: Define `GeneratedModuleContent` interface in `src/types/index.ts`**
  ```typescript
  export interface GeneratedModuleContent {
    headline: string;
    concept: string;
    keyTakeaway: string;
    question: string;
    placeholder?: string;
    diagramSteps?: Array<{
      label: string;
      desc: string;
    }>;
  }
  ```

- [ ] **Step 2: Update `DynamicCoachingResult` in `src/types/index.ts`**
  Add optional `generated_next_module?: GeneratedModuleContent;` to `DynamicCoachingResult`.

- [ ] **Step 3: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/types/index.ts
  git commit -m "feat: add GeneratedModuleContent schema and extend DynamicCoachingResult"
  ```

---

### Task 2: Implement Edge Function Chapter Synthesis (`functions/api/coach.ts`)

**Files:**
- Modify: `functions/api/coach.ts:1-125`

**Interfaces:**
- Consumes: `{ book, module, nextModule?: ModuleData | null, userInput, currentUserState, clientApiKey }`.
- Produces: JSON response adhering to `DynamicCoachingResult` with `generated_next_module` when `nextModule` is present.

- [ ] **Step 1: Update input payload extraction & response schema in `functions/api/coach.ts`**
  Extract `nextModule` from request JSON. If `nextModule` is present:
  - Add `generated_next_module` object schema to Gemini `generationConfig.responseSchema`:
    ```json
    "generated_next_module": {
      "type": "OBJECT",
      "properties": {
        "headline": { "type": "STRING", "description": "تیتر جذاب فصل بعد پیرامون موقعیت کاربر" },
        "concept": { "type": "STRING", "description": "متن عمیق و روان درس بعدی با لحن نویسنده کتاب (حداکثر ۱۶۰ کلمه فارسی)" },
        "keyTakeaway": { "type": "STRING", "description": "پیام کلیدی یک‌خطی" },
        "question": { "type": "STRING", "description": "پرسش کاوش‌گرانه بعدی" },
        "diagramSteps": {
          "type": "ARRAY",
          "items": {
            "type": "OBJECT",
            "properties": {
              "label": { "type": "STRING" },
              "desc": { "type": "STRING" }
            },
            "required": ["label", "desc"]
          }
        }
      },
      "required": ["headline", "concept", "keyTakeaway", "question"]
    }
    ```

- [ ] **Step 2: Update systemInstruction & prompt directives**
  Instruct Gemini:
  - When `nextModule` is provided, author Chapter $N+1$ directly around the user's struggle.
  - Explain how the user's specific entities (e.g. morning PS5 gaming, kitchen dishes, phone in bed) fit into the theoretical milestone (`nextModule.title`, `nextModule.staticCoreLesson.headline`).
  - When `nextModule` is `null` (final module), mark `is_final_blueprint: true` and omit `generated_next_module`.

- [ ] **Step 3: Verify TypeScript build**
  Run: `npm run build`
  Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add functions/api/coach.ts
  git commit -m "feat: implement edge function living chapter synthesis with Gemini 2.5 Flash"
  ```

---

### Task 3: Client Gemini Service & Deep Offline Synthesis Fallback (`src/services/geminiService.ts`)

**Files:**
- Modify: `src/services/geminiService.ts:1-280`

**Interfaces:**
- Consumes: `book: BookCurriculum`, `module: ModuleData`, `nextModule?: ModuleData | null`, `userInput: string`, `currentUserState: Record<string, any>`.
- Produces: `Promise<DynamicCoachingResult>` with `generated_next_module`.

- [ ] **Step 1: Update `generateCoachingResponse` signature & payload dispatch**
  Add `nextModule?: ModuleData | null` to parameter list.
  Pass `nextModule` in the `fetch('/api/coach', ...)` request body.
  Update client-side fallback Gemini SDK call schema and prompt to match `functions/api/coach.ts`.

- [ ] **Step 2: Implement dynamic offline chapter synthesizer in `generateOfflineCoachingResponse`**
  When `nextModule` is provided, synthesize tailored `GeneratedModuleContent`:
  - Tailored headline: e.g. for Situated Learning: `«کالبدشکافی ریشه رفتاری در موقعیت ${cleanInput}»`.
  - Tailored concept: Write 2–3 flowing Persian paragraphs weaving `cleanInput` into the next framework milestone (e.g. Box 1 objective environment, Habit cue, Atomic Habit stacking).
  - Tailored diagram steps: Replace generic step labels with the user's actual behavior and physical cue.
  - Tailored next question: Pointing to the next upstream layer.

- [ ] **Step 3: Verify offline output via isolated node/test check**
  Run: `npm run build`
  Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/services/geminiService.ts
  git commit -m "feat: wire nextModule scaffold in geminiService and add dynamic offline chapter generator"
  ```

---

### Task 4: Dynamic Folio State & Manuscript Rendering (`src/App.tsx` & `src/components/ModuleReader.tsx`)

**Files:**
- Modify: `src/App.tsx:60-175`
- Modify: `src/components/ModuleReader.tsx:1-490`

**Interfaces:**
- Consumes: `authoredModules: Record<number, GeneratedModuleContent>` stored in book session state.
- Produces: Fully personalized folios rendered seamlessly across double-page / single-page layouts.

- [ ] **Step 1: Manage `authoredModules` state in `src/App.tsx`**
  - In `handleCompleteModuleTurn(result: DynamicCoachingResult)`:
    If `result.generated_next_module` exists, store it into `savedStates[currentBook.id].authoredModules[currentModuleIndex + 1]`.
  - Pass `authoredModules={activeUserState.authoredModules || {}}` to `ModuleReader`.
  - Ensure `handleRestartBook` clears `authoredModules`.

- [ ] **Step 2: Update `ModuleReader.tsx` to display generated module content**
  - Accept `authoredModules?: Record<number, GeneratedModuleContent>` in `ModuleReaderProps`.
  - Derive effective lesson data:
    ```typescript
    const effectiveLesson = authoredModules?.[moduleIndex]
      ? {
          headline: authoredModules[moduleIndex].headline,
          concept: authoredModules[moduleIndex].concept,
          keyTakeaway: authoredModules[moduleIndex].keyTakeaway,
          diagramSteps: authoredModules[moduleIndex].diagramSteps || currentModule.staticCoreLesson.diagramSteps,
        }
      : currentModule.staticCoreLesson;

    const effectivePrompt = authoredModules?.[moduleIndex]
      ? {
          question: authoredModules[moduleIndex].question,
          placeholder: authoredModules[moduleIndex].placeholder || currentModule.interactivePrompt.placeholder,
        }
      : currentModule.interactivePrompt;
    ```
  - Pass `nextModule={book.modules[moduleIndex + 1] || null}` into `generateCoachingResponse` call when submitting confession.
  - When user clicks "ورق زدن به فصل بعد", advance to next module: Leaf A streams `effectiveLesson.concept` via `LivingInkText` with smooth page curl!

- [ ] **Step 3: Verify build and layout rendering**
  Run: `npm run build`
  Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/App.tsx src/components/ModuleReader.tsx
  git commit -m "feat: render dynamically authored folios in ModuleReader with seamless state persistence"
  ```

---

### Task 5: End-to-End Build Verification, Live Cloudflare Deploy & Verification

**Files:**
- Execute: Build, deploy, verify.

- [ ] **Step 1: Run production build**
  Run: `npm run build`
  Expected: Clean compilation, 0 TypeScript errors, bundle size within limits.

- [ ] **Step 2: Deploy to Cloudflare Pages**
  Run: `npx wrangler pages deploy dist --project-name=engaged-learning --commit-dirty=true`
  Expected: Deployment successfully uploaded and deployed to `magicbooks.imansaraei.com`.

- [ ] **Step 3: Verify live URL**
  Run: `curl -ILs https://magicbooks.imansaraei.com`
  Expected: `HTTP/2 200 OK`.

- [ ] **Step 4: Push to GitHub**
  Run: `git push origin main`
  Expected: All commits pushed cleanly to `imansaraei/learning-coach`.
