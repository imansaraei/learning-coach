# Design Spec: Magical Codex Refinements (Approach A)

**Date:** 2026-11-04  
**Status:** Ready for Review  
**Topic:** Smooth 3D Opening, Gentle Living Handwriting, Page Turn Mechanics, Pure Manuscript Layout & Co-Writing Narrative Continuity

---

## 1. Intent & Context
The user wants the reading and coaching experience to feel like a true enchanted physical codex (reminiscent of Tom Riddle's Diary in Harry Potter) rather than a digital app. All abrupt transitions, flickering page surfaces, and intrusive software labels must be eliminated. The book must actively listen to the user and weave their exact words into the living manuscript.

---

## 2. Key Requirements & Adjustments

### A. Smooth 3D Book Opening Transition (`BookSelector.tsx`)
- **Problem:** Previous opening animation had jerky timing and a sudden jump.
- **Solution:** A fluid 2-phase 3D opening:
  1. *Phase 1 (Draw from shelf):* Selected tome lifts vertically from the shelf with a soft upward translation and perspective elevation (~280ms).
  2. *Phase 2 (Open cover):* The volume floats to center desk position, expanding into full folio proportions while the leather cover swings open smoothly on its spine axis (`rotateY(-160deg)`, `cubic-bezier(0.2, 0.8, 0.2, 1)`) revealing the parchment inner pages with traveling inner spine shadow (~500ms).
  3. Seamlessly mounts the open codex view.

### B. Gentle Living Handwriting (`LivingInkText.tsx`)
- **Problem:** Text previously appeared in discrete 2-word bursts via `setInterval`, feeling like a typewriter.
- **Solution:** True handwriting flow:
  - Character-by-character continuous rendering.
  - Organic variable cadence: fast strokes for standard characters (10–14ms), gentle micro-pauses for punctuation and spaces (80–120ms).
  - Liquid ink diffusion: newly inscribed characters start with soft translucent blur (`filter: blur(1.5px); opacity: 0.2`) and settle into rich iron-gall or indigo permanence over 180ms (`filter: blur(0px); opacity: 1`).
  - Living quill nib marks the active stroke, then rests.

### C. Remove Light Flicker from Opened Book Pages (`index.css` & `App.tsx`)
- **Problem:** Candle flicker keyframes applied globally or bled into the text, causing eye strain and jitter.
- **Solution:** Scope `candleFlicker` strictly to background desk ambient gradients (`.desk-ambient-glow`). The open book paper canvas (`#f4eee0`) and all typography remain 100% stable, sharp, and flicker-free.

### D. Pure Manuscript Pages: Remove Meta-Tags (`ModuleReader.tsx`)
- **Problem:** Labels like `DIARIUM VIVUM`, `پرسش زندهٔ کتاب`, `دست‌خط شما`, and `پاسخ زندهٔ مربی` felt like software UI.
- **Solution:** Remove all meta-tags completely:
  - The book's prompt appears directly in dark iron-gall ink.
  - The handwriting lines are plain, ruled notebook lines without field headers.
  - The scholar's commentary appears directly underneath in deep indigo or golden sepia ink.
  - Only the main content exists on the page.

### E. Smooth & Gentle 3D Page-Turning (`ModuleReader.tsx`)
- **Problem:** Page turn was a crude scale/opacity dip.
- **Solution:** A genuine 3D page curl transition:
  - Leaf rotates along the central spine binding axis (`transform-origin: center right / center left`, `rotateY(0deg -> -90deg -> 0deg)`).
  - A subtle traveling shadow gradient moves across the gutter during the flip.
  - Synchronized with the Web Audio paper rustle synthesis.

### F. Co-Writing Narrative Continuity & Empathetic Mirroring (`geminiService.ts`, `functions/api/coach.ts`, `ModuleReader.tsx`)
- **Problem:** AI feedback felt isolated, and subsequent modules didn't reflect that the book is being co-written based on the user's confessions.
- **Solution:**
  1. *Prompt Overhaul:* Instruct Gemini to explicitly mirror the user's specific context, acknowledge their exact emotional/behavioral dilemma, and show that the book's pages are being authored around their real life. Zero generic platitudes.
  2. *Dynamic Diagram & Lesson Context:* In subsequent modules and the final blueprint, interpolate the user's identified cues, routines, and situational obstacles directly into the manuscript diagram nodes and takeaway cards.

---

## 3. Scope & Files Touched
- `src/components/BookSelector.tsx`: Smooth 2-phase 3D opening animation.
- `src/components/LivingInkText.tsx`: Character-level handwriting diffusion with organic rhythm.
- `src/components/ModuleReader.tsx`: Tag stripping, pure parchment layout, 3D page-turn leaf curl, contextual interpolation.
- `src/services/geminiService.ts`: System prompt refinement for empathetic mirroring and co-writing continuity.
- `functions/api/coach.ts`: Matching Cloudflare edge prompt refinement.
- `src/index.css`: Isolate candle glow to desk background, smooth 3D page turn keyframes, ink seepage.
- `src/App.tsx`: Desk lighting isolation.

---

## 4. Verification Plan
1. **Visual smoothness:** Test book opening on desktop and mobile viewports.
2. **Typography feel:** Verify character-by-character handwriting flow without typewriter chunking.
3. **Purity check:** Inspect book pages to confirm zero meta-tags remain.
4. **Lighting test:** Verify the book sheet remains completely steady while the ambient desk retains warm mood.
5. **Continuity test:** Submit a specific answer (e.g., "چک کردن اینستاگرام در تختخواب") and verify the AI coach directly references this context and weaves it into the next page.
