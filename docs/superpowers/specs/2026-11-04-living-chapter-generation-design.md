# Design: Generative Living Chapter Synthesis

## 1. Intent and The Why

In the current application, turning to Chapter 2, 3, or 4 presents static, pre-written book paragraphs from `bookCurricula.ts`. While the AI provides a brief coaching remark on the inscription page, the core reading material remains static and predetermined.

The reference interaction ([Gemini Shared Gem: Escaping the Trap of Willpower](https://gemini.google.com/share/a59e7a1de3f8)) demonstrates a fundamentally different model: **the book itself is written in real time around the reader's confession**. When a reader admits to playing PS5 instead of cleaning the kitchen, the next chapter directly integrates their DualSense controller and kitchen counter into the Three-Boxes psychological framework (Box 3 $\rightarrow$ Box 2 $\rightarrow$ Box 1).

The goal of this design is to transform the codex from a static textbook with a chatbot commentary into a living, generative manuscript where every subsequent chapter is authored dynamically by the book's persona around the reader's specific struggle.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
1. **Dynamic Folio Synthesis**: When the user records an inscription in Chapter $N$, the AI generates Chapter $N+1$'s complete contents:
   - Dynamic headline and personalized takeaway.
   - Core concept narrative (120–180 words) in the author's authentic voice, embedding the user's specific entities, actions, and environment into the psychological framework.
   - Socratic prompt question digging into the next upstream layer.
   - Diagram steps tailored with the user's real context.
2. **Permanent Leaf Binding**: Generated chapters are committed to state and stored in `localStorage` under the book session. Navigating backward and forward across turned pages displays the previously generated text without re-fetching or flickering. Inscriptions are immutable once written on parchment; restarting a book clears authored modules cleanly.
3. **Seamless Transition**: While the reader views the mentor's acknowledgment on Leaf B, Chapter $N+1$ is synthesized in the background. When the reader clicks "ورق زدن به فصل بعد", the leaf curls open to reveal the tailored chapter, inscribed smoothly via `LivingInkText`.
4. **Offline / Fallback Parity**: When no API key is set or offline, a deterministic behavioral synthesis engine generates high-fidelity tailored chapters matching the same schema using the user's inputs.

### Non-Goals
- Free-form open chat: The book maintains a guided philosophical structure (e.g. Box 3 $\rightarrow$ Box 2 $\rightarrow$ Box 1 in Situated Learning; Cue $\rightarrow$ Craving $\rightarrow$ Routine $\rightarrow$ Reward in Power of Habit). It does not become an unstructured chat room.
- Infinite endless chapters: Books retain their 3-to-4 chapter arc leading to the final Golden Blueprint.

### Anti-Goals
- "Mad Libs" template fill: Do not simply replace `{user_input}` in fixed sentences. The narrative must read like genuine literary and psychological analysis.
- Blocking page turns with raw spinners: No generic loading dialogs or sudden jumps. Text appears naturally as handwritten ink on parchment.

---

## 3. Approaches Considered

### Approach A: Generative Chapter Synthesizer (Selected)
- **Mechanism**: The Edge function `/api/coach` and client `geminiService` receive the static scaffold for Chapter $N+1$ (`nextModule: ModuleData`) along with user input and state, and return the tailored payload for the subsequent module (`generated_next_module`).
- **Pros**:
  - Grounded in canonical psychological milestones (no hallucinated frameworks).
  - Validated by Gemini JSON schema.
  - Zero latency during page turn because generation occurs during the user's reading of the coaching response on Leaf B.
  - Retains full compatibility with diagrams, audio narration, and `LivingInkText`.
- **Cons**:
  - Slightly larger JSON response payload (~1.5KB).

### Approach B: Raw Text Streaming on Leaf Turn
- **Mechanism**: On page turn, Leaf A connects to an SSE streaming endpoint that writes raw markdown directly to the parchment.
- **Pros**:
  - Immediate time-to-first-token.
- **Cons**:
  - Fragile schema handling: difficult to render diagrams, structured headers, and clean page borders reliably.
  - Jittery experience if network hiccups mid-stream.

### Approach C: Pure Client-Side Static Interpolation
- **Mechanism**: Use static templates with placeholder slots filled on client.
- **Pros**:
  - No API needed.
- **Cons**:
  - Feels mechanical and fails the user's core requirement for deep personalization.

**Decision**: Approach A is selected.

---

## 4. Architecture & Data Flow

### 4.1 Schema Extension (`src/types/index.ts`)

```typescript
export interface GeneratedModuleContent {
  headline: string;
  concept: string; // The deep psychological narrative weaving the user's struggle
  keyTakeaway: string;
  question: string; // Next upstream inquiry
  placeholder?: string;
  diagramSteps?: Array<{
    label: string;
    desc: string;
  }>;
}

export interface DynamicCoachingResult {
  coaching_response: string;
  next_question: string;
  updated_user_state: Record<string, any>;
  is_final_blueprint?: boolean;
  generated_next_module?: GeneratedModuleContent;
}
```

### 4.2 Edge Function & Prompt Update (`functions/api/coach.ts` & `src/services/geminiService.ts`)

- **Payload Input Contract**: The API receives `{ book, module, nextModule, userInput, currentUserState, clientApiKey }`.
- When `nextModule` exists (non-final chapter), Gemini receives:
  - Theoretical milestone of next chapter: `nextModule.title`, `nextModule.staticCoreLesson.headline`, `nextModule.staticCoreLesson.concept`.
  - Directive:
    > «شما فصل بعدی کتاب را مستقیماً پیرامون کشمکش و موقعیت اختصاصی کاربر بازنویسی و تالیف می‌کنید. مفهوم تئوریک فصل بعد (${nextModule.title}) را بگیرید و توضیح دهید که چگونه کلمات، ابزارها و محیط واقعی کاربر در این مدل جای می‌گیرند. لحن شما باید لحن اصیل نویسنده کتاب باشد. فصل جدید را در فیلد `generated_next_module` بازگردانید.»
- On the final module ($N = \text{total}$), `nextModule` is `null`. The prompt generates the final coaching response, marks `is_final_blueprint: true`, and omits `generated_next_module`.

### 4.3 State Management & Module Resolution (`src/components/ModuleReader.tsx` & `src/App.tsx`)

- Each book session in `App.tsx` maintains:
  `authoredModules: Record<number, GeneratedModuleContent>`.
- Chapter 0 uses the introductory anchor from `bookCurricula.ts`.
- For Module $K \ge 1$:
  - If `authoredModules[K]` exists, `ModuleReader` displays the tailored content for headlines, concept narrative, diagram steps, and inquiry.
  - Fallback to `book.modules[K]` if offline without generation.
- **Immutability Policy**: Written inscriptions are permanent on parchment (locked once submitted). Resetting or re-branching is handled via "شروع مجدد کتاب" (Restart Book).
- All `authoredModules` are stored in `savedStates[book.id]` in `localStorage`.

### 4.4 Inscription & Page Turn UX Flow
1. User writes confession on Leaf B and taps "ثبت بر صفحه".
2. Edge function / Gemini API generates:
   - `coaching_response`: Immediate empathetic acknowledgment on Leaf B.
   - `generated_next_module`: Synthesized next chapter stored in state.
3. User reads living response in scholar indigo ink.
4. Button activates: "ورق زدن به فصل بعد".
5. User clicks: 3D leaf curls smoothly across the spine binding (`playPageTurnSound()`).
6. New chapter opens: Leaf A contains the freshly synthesized concept narrative, streaming gently via `LivingInkText`.

---

## 5. Builder Verification Points
- Offline synthesis fallback generator returning customized `generated_next_module` objects even when disconnected or using no API key.
- Ensuring dynamic diagram steps handle varying text lengths without causing overflow in the physical folio frame.
