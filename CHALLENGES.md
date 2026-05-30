# ⚔️ Challenges I Ran Into While Building DevNexus

> Building a full-stack AI developer command center during a hackathon sprint was one of the most technically demanding challenges I've taken on. Below are the specific bugs, architectural hurdles, and design decisions that nearly broke the project — and exactly how I got over each one.

---

## 🧱 Challenge 1 — NextAuth Session Token Lost in Async Callbacks

### What Happened
The biggest early blocker was TypeScript's strict type narrowing inside React's `setState` callback closures. In `hackathons/page.tsx`, the pattern looked like this:

```tsx
const handleToggle = async () => {
  if (!session?.accessToken) return; // ✅ narrowed here
  
  setHackathons(prev => prev.map(hack => {
    updateHackathon(id, data, session.accessToken); // ❌ TypeScript error: possibly undefined
    // ...
  }));
};
```

TypeScript correctly warned that inside the `setHackathons` callback (which runs asynchronously and is a new closure scope), `session.accessToken` could theoretically be re-evaluated as `undefined` — even though we had checked it just two lines above. The Next.js production build would **hard fail** with `Type 'string | undefined' is not assignable to type 'string'`.

### How I Fixed It
The solution was simple once I understood TypeScript's closure scoping rules: capture the token into a **local variable before the closure** so TypeScript can guarantee it's narrowed throughout the entire function scope:

```tsx
const handleToggle = async () => {
  const token = session?.accessToken; // ✅ captured as string | undefined
  if (!token) return;                  // ✅ narrowed to string
  
  setHackathons(prev => prev.map(hack => {
    updateHackathon(id, data, token); // ✅ always string inside closure
  }));
};
```

This pattern was then applied consistently across all 5 sub-pages as a convention.

---

## 🧱 Challenge 2 — Supabase Database Column Mismatch Breaking the Narrator Service

### What Happened
The background narrator service that generates daily chronicles was completely broken in production. The `narrator_service.py` was trying to fetch users' GitHub tokens from Supabase with this query:

```python
supabase.table("users").select("github_token, github_username").eq("id", user_id)
```

But the actual Supabase schema had columns named `github_access_token` and `username` — not `github_token` and `github_username`. The service was silently returning `None, None` for every user and then short-circuiting the entire chronicle pipeline. No error was thrown — it just generated empty chronicles silently.

This was incredibly difficult to debug because:
1. The FastAPI server started fine
2. No exception was logged (the `except` block returned `None, None`)
3. The chronicles table in Supabase was filling with empty records

### How I Fixed It
After reading the Supabase table schema directly, I corrected the column names:

```python
# BEFORE (wrong):
.select("github_token, github_username")

# AFTER (correct):
.select("github_access_token, username")
```

Additionally, I added explicit logging at every stage of the pipeline so failures would surface immediately in the future, rather than silently returning empty data.

---

## 🧱 Challenge 3 — Gemini API Returning Raw Text Instead of JSON

### What Happened
The Gemini 1.5 Flash model is fast, but it doesn't always respect JSON output instructions strictly. When I first built the chronicle generation endpoint, Gemini would occasionally wrap its JSON response in markdown code fences:

```
```json
{
  "headline": "...",
  "narrative": "...",
  "mood": "..."
}
```
```

This caused `json.loads()` to throw a `JSONDecodeError` because the backticks and the word `json` were included in the string. Since this happened intermittently (not on every call), it was a nightmare to reproduce consistently.

### How I Fixed It
I implemented a defensive stripping pattern before parsing, and wrapped every Gemini JSON call in a robust fallback:

```python
text = response.text.replace("```json", "").replace("```", "").strip()
try:
    return json.loads(text)
except json.JSONDecodeError:
    # Graceful fallback: return a structured default instead of crashing
    return {
        "headline": "Code, Eat, Sleep, Repeat",
        "narrative": response.text.strip(),
        "mood": "Focused"
    }
```

This was applied to all six Gemini service functions that return structured JSON.

---

## 🧱 Challenge 4 — The Narrator Scheduler Saving to a Non-Existent Table

### What Happened
The weekly arc generator was persisting its output to a `weekly_arcs` table:

```python
supabase.table("weekly_arcs").insert(data).execute()
```

This table **did not exist** in Supabase. The schema only had a single `chronicles` table with a `type` column (`'daily'` or `'weekly'`). The scheduler was silently failing every Sunday, generating no weekly summaries, and no error was surfaced because the Supabase client would return an error object instead of raising an exception.

### How I Fixed It
Rewrote the `_save_weekly_arc` function to use the existing `chronicles` table with the correct `type` discriminator:

```python
data = {
    "user_id": user_id,
    "date": arc["week_start"],
    "type": "weekly",  # ← discriminator column
    "content": json.dumps(content_data),
    "is_roast_mode": False,
}
supabase.table("chronicles").insert(data).execute()  # ✅ correct table
```

---

## 🧱 Challenge 5 — The Dashboard Overview Page Was Showing a Duplicate Activity Feed

### What Happened
The main dashboard route (`/dashboard/page.tsx`) had been overwritten with an activity feed component — essentially the same content as `/dashboard/activity`. So the main overview page showed a raw GitHub event stream instead of the intended Chronicle + Stats overview. Users landing on the dashboard for the first time saw a wall of raw events with no orientation.

### How I Fixed It
Completely rewrote `page.tsx` to serve as a true **overview hub**:
- 4 live metric cards (streak, stars, todos, hackathons) fetching from 3 different API endpoints concurrently using `Promise.all`.
- The NEXUS AI Chronicle section with a "Generate" CTA if no chronicle exists yet.
- ThemeSelector and Vibe Mode trigger buttons for immediate customization.
- Two quick-access cards pointing to the most important sub-pages.

The previous activity stream was preserved at `/dashboard/activity` where it belongs.

---

## 🧱 Challenge 6 — Persistent Components Disappearing on Navigation

### What Happened
The `NexusSidebar`, `CommandPalette`, and `VibeMode` components were originally placed inside individual page components. This meant every time you navigated to a new page, React unmounted and remounted them — losing all chat history in the AI sidebar and stopping the Vibe Mode music player mid-song.

### How I Fixed It
Moved all three persistent components to the **dashboard layout** (`layout.tsx`) instead of individual pages. In Next.js, the layout component persists across route changes within its scope — so the components mount once and stay mounted:

```tsx
// layout.tsx
return (
  <div className="flex h-screen overflow-hidden bg-background">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
    <NexusSidebar />     {/* ← mounted once, persists across routes */}
    <CommandPalette />   {/* ← mounted once, persists across routes */}
    <VibeMode />         {/* ← music keeps playing across page changes */}
  </div>
);
```

---

## 🧱 Challenge 7 — Vibe Mode Could Not Be Triggered from the Header

### What Happened
After moving `VibeMode` to the layout, the Header's music button needed to toggle it — but the Header and VibeMode were sibling components (not parent/child), making direct prop passing impossible without either a global state store or an event bus.

### How I Fixed It
Used the **browser's native CustomEvent API** as a lightweight zero-dependency event bus:

```tsx
// Header.tsx — dispatches the event
<button onClick={() => document.dispatchEvent(new CustomEvent('vibe:activate'))}>
  <Music />
</button>

// VibeMode.tsx — listens for the event
useEffect(() => {
  const handler = () => { setIsActive(true); setIsPlaying(true); };
  document.addEventListener('vibe:activate', handler);
  return () => document.removeEventListener('vibe:activate', handler);
}, []);
```

The same pattern was used for the CommandPalette (`nexus:open`) and the Ctrl+K global shortcut. No Zustand store overhead needed for simple UI triggers.

---

## 🧱 Challenge 8 — The Command Palette Navigated Nowhere

### What Happened
The original `CommandPalette.tsx` was a pure UI shell — three hardcoded `<div>` elements that displayed "Go to GitHub", "Go to TODOs", and "Generate Daily Chronicle" but had zero click handlers attached. Clicking them did nothing.

### How I Fixed It
Rewrote the component with:
- A live **search filter** that fuzzy-matches against all available commands.
- `useRouter` from Next.js to handle actual navigation.
- Custom event dispatchers for non-navigation commands (open Nexus sidebar, activate Vibe Mode).
- Proper Escape / click-outside handling.

```tsx
const handleSelect = (cmd: Command) => {
  if (cmd.path) router.push(cmd.path);
  else if (cmd.action) cmd.action();
  setOpen(false);
};
```

---

## 🧱 Challenge 9 — Chronicle Content Stored as Raw String, Not Parseable JSON

### What Happened
When the AI narrator saved chronicles to Supabase, it was saving the entire Gemini response as a raw text string in the `content` column. But when the frontend fetched the chronicle via `GET /ai/chronicle`, it expected a structured object with `headline`, `narrative`, and `mood` keys.

This caused the overview page to display `undefined` for all chronicle fields — a completely blank chronicle card despite records existing in the database.

### How I Fixed It
Added defensive JSON parsing on the read path:

```python
try:
    content = json.loads(c["content"])  # parse stored JSON string
except Exception:
    # graceful fallback for legacy plain-text records
    content = {
        "headline": "Daily Log",
        "narrative": c["content"],
        "mood": "focused"
    }
```

And on the write path, always serialized the structured dict to JSON before saving:

```python
supabase.table("chronicles").insert({
    "content": json.dumps({
        "headline": chronicle.get("headline", ""),
        "narrative": chronicle.get("narrative", ""),
        "mood": chronicle.get("mood", "")
    })
})
```

---

## 🧱 Challenge 10 — NexusSidebar Had No Imports (Silent Runtime Failure)

### What Happened
The `NexusSidebar.tsx` component was written without importing `React`, `useState`, `useEffect`, `AnimatePresence`, `motion`, or any Lucide icons. The component referenced `useState`, `Sparkles`, `Bot`, `Loader2`, `Send`, `X`, and `AnimatePresence` — all undefined at runtime — causing the entire dashboard layout to silently crash in the browser with a blank white screen and a ReferenceError in the console.

### How I Fixed It
Added the complete import block at the top of the file:

```tsx
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { sendChatToNexus } from '@/lib/api-client';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Bot, Loader2, Send, X } from 'lucide-react';
```

This was a reminder to never assume auto-import works in a production build environment without verification.

---

## Final Reflection

Most of these bugs shared a common root cause: **optimistic assumptions** — assuming the database schema matched the code, assuming Gemini would always return valid JSON, assuming TypeScript's type narrowing works inside closures, assuming a component had its imports. 

The lesson: **always verify at the boundary**. Every integration point (Supabase schema, AI response, session token, component imports) needs explicit defensive handling. The build pipeline (`npx turbo run build`) was the final source of truth that surfaced all remaining issues before they reached users.
