# Magical Codex Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the interactive reading experience into a smooth, flicker-free, non-scrollable physical codex with organic character-level handwriting, pure pages devoid of meta-tags, 3D leaf turning, and deep co-writing narrative continuity.

**Architecture:** Pure CSS 3D physics for tome opening and page turning (`rotateY`, `perspective`, traveling gutter shadows); character-level stream generator with micro-pauses at punctuation and liquid ink diffusion for handwriting; strict scoping of ambient candlelight to background desk layers; prompt and template refactoring for empathetic mirroring of user confessions in subsequent chapters.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Web Audio API, Cloudflare Pages Functions, Google GenAI SDK.

**Spec:** `docs/superpowers/specs/2026-11-04-magical-codex-refinements-design.md`

## Global Constraints
- **Zero Token Cost Default:** Must run with $0 runtime cost using the smart behavioral fallback when offline or without an API key.
- **Pure Manuscript Pages:** Absolutely zero dialogue boxes, chat balloons, or meta labels (`DIARIUM VIVUM`, `پرسش زنده`, `دست‌خط شما`, etc.) on the parchment sheets.
- **Non-Scrollable Viewport:** The reading view must fit `h-[100dvh]` without browser scrollbars.
- **RTL Integrity:** Persian typography and right-to-left spine binding must be preserved across both single and double-page views.

## Review Focus
- **Input text during handwriting stream:** Fast user clicks or keypresses during active streaming must cleanly fast-forward to full text without visual artifacts.
- **Mobile vs Desktop orientation switches:** Toggling between landscape (double-page) and portrait (single-page) must not drop current user inscription or coaching response.
- **Subsequent chapter continuity:** Module 2, 3, 4 must visibly acknowledge the user's specific answers from Module 1.
- **Flicker isolation:** Candlelight toggle must never cause the text on the open book page to oscillate in opacity or blur.
- **Page turn boundary:** Flipping leaves rapidly must not get stuck mid-rotation.

---

### Task 1: Isolate Candle Glow & Eliminate Page Surface Flicker

**Files:**
- Modify: `src/index.css:35-46`
- Modify: `src/App.tsx:110-140`

**Interfaces:**
- Consumes: `isCandlelit: boolean` from `App.tsx` state.
- Produces: Scoped `.desk-ambient-glow` class that applies solely to desk background orbs, leaving `#f4eee0` parchment folios 100% static.

- [ ] **Step 1: Update `src/index.css` to scope candle flicker to desk ambiance only**
  Replace `.candle-glow` on `body` with `.desk-ambient-glow` keyframe applied exclusively to background ambient gradient divs. Ensure book container has zero opacity/filter flicker.

- [ ] **Step 2: Update `src/App.tsx` container classes**
  Remove `candle-glow` from the outer root wrapper and assign `.desk-ambient-glow` solely to background candlelight gradient divs.

- [ ] **Step 3: Verify flicker isolation**
  Run: `npm run build`
  Expected: Clean compilation; verify visually that toggling candlelight does not cause text on `#f4eee0` parchment to jitter.

- [ ] **Step 4: Commit**
  ```bash
  git add src/index.css src/App.tsx
  git commit -m "fix: isolate candlelight glow to desk ambiance and remove page flicker"
  ```

---

### Task 2: Smooth Character-Level Living Handwriting (`LivingInkText.tsx`)

**Files:**
- Modify: `src/components/LivingInkText.tsx`
- Modify: `src/index.css:70-95`

**Interfaces:**
- Consumes: `text: string`, `speedMs?: number`, `inkColor?: string`, `onComplete?: () => void`.
- Produces: Continuous character-by-character handwriting stream with organic micro-pauses at spaces/punctuation and liquid ink seepage.

- [ ] **Step 1: Refactor `LivingInkText.tsx` to character stream with human cadence**
  Instead of splitting by words with `setInterval(..., 35)`, iterate character-by-character using `setTimeout` with variable delays:
  - Letters: `12ms`
  - Spaces: `28ms`
  - Punctuation (`.`, `،`, `؛`, `!`, `؟`): `110ms`
  Apply `.ink-seep` animation to newly revealed characters so they diffuse from faint translucent blur into sharp permanent ink.

- [ ] **Step 2: Ensure fast-forward on click remains smooth**
  Allow the user to click anywhere on the text block to immediately reveal the complete text without waiting.

- [ ] **Step 3: Verify handwriting stream**
  Run: `npm run build`
  Expected: Clean build with zero TypeScript errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/LivingInkText.tsx src/index.css
  git commit -m "feat: implement gentle character-level living handwriting with organic cadence"
  ```

---

### Task 3: Smooth 2-Phase 3D Book Drag-Out & Opening Animation (`BookSelector.tsx`)

**Files:**
- Modify: `src/components/BookSelector.tsx:20-40, 420-480`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `openingBook: BookCurriculum | null`.
- Produces: Smooth 2-phase 3D transition: spine elevation from shelf (~280ms) followed by center cover swing opening (`rotateY(-160deg)`, ~500ms) before handoff to reader.

- [ ] **Step 1: Define smooth 3D book opening keyframes in `src/index.css`**
  Add `@keyframes bookCoverSwing` with `cubic-bezier(0.2, 0.8, 0.2, 1)` and traveling shadow across inner pages.

- [ ] **Step 2: Refactor opening state in `BookSelector.tsx`**
  Implement the two-phase timing:
  - `phase: 'lifting'` (spine lifts and expands, 280ms)
  - `phase: 'opening'` (cover peels back, 500ms)
  - Seamless handoff to `onSelectBook(book)` at 780ms.

- [ ] **Step 3: Verify book opening animation**
  Run: `npm run build`
  Expected: Clean compilation with fluid visual opening.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/BookSelector.tsx src/index.css
  git commit -m "feat: implement fluid 2-phase 3D book drag-out and cover opening animation"
  ```

---

### Task 4: Pure Manuscript Pages & 3D Page Turn Leaf Curl (`ModuleReader.tsx`)

**Files:**
- Modify: `src/components/ModuleReader.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `currentModule: ModuleData`, `userState: Record<string, any>`, `coachingResult: DynamicCoachingResult | null`.
- Produces: Pure manuscript folios without any meta-tags, ruled notebook lines for handwriting, and 3D spine-centered leaf turn animation.

- [ ] **Step 1: Strip all meta-labels from `ModuleReader.tsx`**
  Remove labels: `DIARIUM VIVUM`, `پرسش زندهٔ کتاب`, `دست‌خط شما بر اوراق کتاب`, `پاسخ زندهٔ مربی به این صفحه`, and `« گام بعدی: ... »`.
  Render the question directly in iron-gall ink (`#1c2430`), the ruled writing lines with natural placeholder, and the mentor's response in deep indigo (`#162744`).

- [ ] **Step 2: Implement smooth 3D leaf curl animation for page turns**
  Replace flat opacity dip with `rotateY` page curl:
  - Leaf rotates on spine axis (`transform-origin: left center` on right page; `transform-origin: right center` on left page).
  - Synchronize with Web Audio paper rustle (`playPageTurnSound()`).

- [ ] **Step 3: Embed user's previous inputs into subsequent chapter diagrams**
  In Module 2, 3, 4, dynamically replace generic diagram labels with the user's previously inscribed cue or routine if present in `userState`.

- [ ] **Step 4: Verify pure page and page turn mechanics**
  Run: `npm run build`
  Expected: Clean build; confirm no meta-tags remain on the page.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/ModuleReader.tsx src/index.css
  git commit -m "feat: strip meta-tags, implement 3D page curl, and embed user context into diagram"
  ```

---

### Task 5: Co-Writing Narrative Continuity & Empathetic Mirroring (`geminiService.ts` & `functions/api/coach.ts`)

**Files:**
- Modify: `src/services/geminiService.ts:180-240`
- Modify: `functions/api/coach.ts:25-75`

**Interfaces:**
- Consumes: `userInput: string`, `currentUserState: Record<string, any>`, `book: BookCurriculum`, `module: ModuleData`.
- Produces: AI coaching response that explicitly acknowledges the user's specific words and life context, framing the subsequent lesson as being authored around their confession.

- [ ] **Step 1: Update system prompt in `geminiService.ts`**
  Add explicit instructions:
  - "ابتدا کلمات و بافت واقعی موقعیت کاربر را بازتاب دهید تا کاربر عمیقاً احساس کند پیامش شنیده و فهمیده شده است."
  - "نشان دهید که صفحات بعدی این کتاب بر اساس همین اعتراف کاربر در حال نگارش است."
  - "از پاسخ‌های کلی و قالبی پرهیز کنید؛ مستقیماً به جزئیات مطرح‌شده بپردازید."

- [ ] **Step 2: Update matching system prompt in `functions/api/coach.ts`**
  Ensure identical empathetic mirroring and co-writing continuity instructions are executed on Cloudflare edge.

- [ ] **Step 3: Update offline fallback in `geminiService.ts` to mirror user input**
  Enhance `generateOfflineCoachingResponse` to dynamically interpolate `cleanInput` into the feedback message so offline testing also feels deeply personalized.

- [ ] **Step 4: Verify prompt and build**
  Run: `npm run build`
  Expected: Clean compilation.

- [ ] **Step 5: Commit**
  ```bash
  git add src/services/geminiService.ts functions/api/coach.ts
  git commit -m "feat: enhance AI prompt and offline coach for deep empathetic mirroring and co-writing continuity"
  ```

---

### Task 6: Build Verification, Live Cloudflare Deployment & Git Push

**Files:**
- All modified project files.

- [ ] **Step 1: Run production build**
  Run: `npm run build`
  Expected: Zero TypeScript errors, bundle completed in <3s.

- [ ] **Step 2: Deploy to Cloudflare Pages**
  Run: `npx wrangler pages deploy dist --project-name=engaged-learning --commit-dirty=true`
  Expected: Deployment complete to `magicbooks.imansaraei.com`.

- [ ] **Step 3: Verify live URL**
  Run: `curl -ILs https://magicbooks.imansaraei.com`
  Expected: `HTTP/2 200 OK`.

- [ ] **Step 4: Push to GitHub**
  Run: `git push origin main`
  Expected: All commits pushed cleanly to `imansaraei/learning-coach`.
