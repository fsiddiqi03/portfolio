# Astronaut Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sideways-scrolling landing page with one continuous zoom into the astronaut's chest, ending on a working terminal in the painted grid screen.

**Architecture:** Pure modules hold the terminal's file system and commands (`app/terminal/commands.ts`) and the zoom's geometry (`app/sceneMath.ts`). `Scene.tsx` applies that geometry each frame: it draws the astronaut on a canvas and moves the DOM background, name, light layer, and terminal. `Terminal.tsx` is real HTML attached to the same transform.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, plain CSS, Canvas 2D. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-18-astronaut-terminal-design.md`. Read it first. It holds the exact copy, commands, measurements, and visual requirements.

**Reference code:** the approved prototype is `app/prototype/Prototype.tsx`, `app/prototype/Terminal.tsx`, and `app/prototype/prototype.css`. Port its working behavior. Where this plan names a different structure, the plan wins.

## Global Constraints

- Work on branch `feature/astronaut-terminal`. Never push to `main`: a push to `main` deploys the live site.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- No new runtime or dev dependencies.
- Every file in `public/` is referenced through `asset()` from `app/asset.ts`.
- The repo has no test runner, and the spec keeps it that way. Each task's tests are `npx tsc --noEmit` plus the exact browser checks listed in it.
- Browser checks use the `site` preview (`http://localhost:3000`). The tab must be visible, because a hidden tab pauses `requestAnimationFrame`. When checking downloads, replace `HTMLAnchorElement.prototype.click` with a recorder so no file is saved.
- Colors: `#3fe8bd` phosphor, `#c9fff0` bright, `#35ad8f` faded.
- `overflow: clip`, not `hidden`, on the scene and terminal.

## Review Focus

1. Reloading partway down or at the end of the page: the scene lands at the right zoom, and the opening plays exactly once when the terminal is reached.
2. Resizing or rotating at the end of the zoom: the terminal stays inside the painted frame.
3. Opening the phone keyboard: the scene does not shift or re-zoom, and the prompt stays visible.
4. Odd input: `cd ../..` stays home, `cat projects/../about.txt` works, extra spaces and capitals work, and unknown paths give shell-style errors.
5. Clicking several names quickly: commands run in order, in the right folder, without duplicated or lost output.

---

### Task 1: Terminal content and commands

**Files:**
- Create: `app/terminal/content.ts`
- Create: `app/terminal/commands.ts`
- Add to the commit: `docs/superpowers/specs/2026-11-18-astronaut-terminal-design.md`, `docs/superpowers/plans/2026-11-18-astronaut-terminal.md`

**Interfaces:**
- Produces from `content.ts`:
  - `type Project = { file: string; title: string; about: string; url: string }`
  - `PROJECTS: Project[]`, in spec order
  - `ABOUT: { name: string; summary: string }`
  - `RESUME: { path: "/Resume.pdf"; filename: "Faris Siddiqi Resume.pdf" }`
- Produces from `commands.ts` (no DOM or React imports):
  - `type Kind = "dir" | "txt" | "pdf"`
  - `type Output = { type: "none" } | { type: "text"; text: string } | { type: "list"; dir: string } | { type: "about" } | { type: "project"; project: Project } | { type: "download" } | { type: "help" }`
  - `type Result = { cwd: string; output: Output; download?: boolean }`
  - `kindOf(path: string): Kind | null`
  - `resolve(cwd: string, arg: string): string`
  - `relative(cwd: string, target: string): string`
  - `execute(raw: string, cwd: string): Result`
  - `listItems(dir: string): { label: string; path: string }[]`
  - `promptFor(cwd: string): string`

- [ ] **Step 1: Create the branch**

Run: `git switch -c feature/astronaut-terminal`
Expected: `Switched to a new branch 'feature/astronaut-terminal'`. The untracked prototype and docs remain in the working tree.

- [ ] **Step 2: Write `content.ts`**

Copy the about text, project titles, descriptions, and links exactly from the spec's Content section. `url` values include `https://`.

- [ ] **Step 3: Write `commands.ts`**

Port the file-system and `execute` logic from `app/prototype/Terminal.tsx`. Paths are relative to home, and `""` is home. `execute` does not handle `clear`, which the terminal queue owns. `listItems("")` returns `about.txt`, `projects/`, `resume.pdf`; `listItems("projects")` returns `../` first, then the projects in order.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add app/terminal/content.ts app/terminal/commands.ts docs/superpowers
git commit -m "feat: add terminal content and commands" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Terminal component and styling

**Files:**
- Create: `app/terminal/Terminal.tsx`
- Create: `app/terminal/terminal.css`
- Modify temporarily: `app/prototype/Prototype.tsx` (import the new terminal), `app/prototype/prototype.css` (remove the rules moved to `terminal.css`)

**Interfaces:**
- Consumes: everything Task 1 produces.
- Produces: `export default function Terminal({ start }: { start: boolean })`. It renders `.terminal-tear` and `.terminal-body` as a fragment inside a parent `.terminal` element, which the scene provides along with the `--tw` and `--th` size variables.
- Produces in `terminal.css`: `.terminal` (screen box, clip, glass, scanlines), `.terminal-light` (blended layer) and `.terminal-glow`.

- [ ] **Step 1: Port the component**

Port `app/prototype/Terminal.tsx`, importing data and logic from Task 1. Keep the serial command queue, including its `cwdNow` ref. Scripted typing waits 240 ms, then 70 to 125 ms per character, 340 ms before output, and 460 ms after. Typed commands run with no animation. `downloadResume()` stays in this file and uses `asset(RESUME.path)`.

- [ ] **Step 2: Port the styles**

Move the terminal, cursor, list, help, scanline, flicker, tear, jitter, inner shadow, and glow rules from `prototype.css` into `terminal.css` with `terminal-` names. Keep `container-type: inline-size`, `clip-path: polygon(0 0, 96.6% 0, 100% 100%, 3.4% 100%)`, `overflow: clip`, and all reduced-motion rules. Import this file from `Terminal.tsx`.

- [ ] **Step 3: Point the prototype at the new terminal**

Change its markup and import so `/prototype` renders the new component, proving it in the real zoom before the scene is rebuilt.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Check commands in the browser at 1440×900**

At `/prototype/`, scroll to the end. Expected, in order:

| Action | Result |
| --- | --- |
| Wait for the opening | `cat about.txt` shows the name and summary, then `ls` shows `about.txt`, `projects/`, `resume.pdf`. The opening takes about 3 seconds. |
| Press Enter on the empty prompt | A new empty prompt line appears |
| Type `CD   PROJECTS`, Enter | Prompt becomes `faris@suit:~/projects$`, with no output |
| Type `ls`, Enter | `../`, then the six files in spec order |
| Type `cat ../projects/../about.txt`, Enter | About text |
| Type `cd ../..`, Enter, then `pwd`, Enter | `/home/faris` |
| Type `cat nope`, Enter | `cat: nope: No such file or directory` |
| Type `cd about.txt`, Enter | `cd: about.txt: Not a directory` |
| Type `contact`, Enter | `suit: contact: command not found` |
| Type `resume`, Enter, then `cd resume.pdf`, Enter | Two recorded downloads of `/Resume.pdf` named `Faris Siddiqi Resume.pdf`, each printing `downloading resume.pdf ... retry` |
| Type `clear`, Enter | History clears, and the folder is unchanged |

- [ ] **Step 6: Check clicking and rapid input**

Click `projects/`, then click `discord-aws-bot.txt` and `steam-flock-bot.txt` immediately after it appears. Expected: commands run in click order, each output appears once, the prompt ends in `~/projects`, and links open in a new tab with the spec's URLs. Click `../` and confirm it returns home and lists home.

- [ ] **Step 7: Check the look**

Force a glitch by setting `data-glitch` on `.terminal`. Expected: text splits red and blue, a light band shows, and removing the attribute restores the screen. With natural timing, a glitch appears every few seconds and the text stays readable.

- [ ] **Step 8: Commit**

```bash
git add app/terminal
git commit -m "feat: add suit terminal" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

The prototype stays untracked and is not committed.

---

### Task 3: Zoom scene on the landing page

**Files:**
- Create: `app/sceneMath.ts`
- Modify: `app/Scene.tsx` (replace), `app/globals.css`, `README.md`
- Move: `public/prototype/astro-small.webp` → `public/scene/astronaut-small.webp`, `astro-mid.webp` → `astronaut-mid.webp`, `astro-chest.webp` → `astronaut-chest.webp`, `astro-screen.webp` → `astronaut-screen.webp`
- Delete: `app/prototype/`, `public/prototype/`, `public/scene/background-left.webp`, `arrow.webp`, `resume.webp`, `spaceman.webp`, `astronaut.webp`

**Interfaces:**
- Consumes: `Terminal` from Task 2, with `.terminal`, `.terminal-light`, and `.terminal-glow`.
- Produces from `sceneMath.ts` (no DOM imports):
  - Constants `ART`, `ART_CENTER`, `FOCUS`, `SCREEN`, `CHEST_IMAGE`, `SCREEN_IMAGE`, `START_ANGLE`, `END_ANGLE`, with the prototype's values
  - `type Box = { left: number; top: number; width: number; height: number }`
  - `type View = { width: number; height: number; artWidth: number; artHeight: number; startScale: number; endScale: number; startPoint: { x: number; y: number }; endPoint: { x: number; y: number } }`
  - `computeView(painting: Box, width: number, height: number): View`
  - `type Frame = { scale: number; angle: number; x: number; y: number; floatX: number; floatY: number; backScale: number; nameOpacity: number; dimOpacity: number; power: number; interactive: boolean; arrived: boolean }`
  - `frameAt(view: View, progress: number, seconds: number, reducedMotion: boolean): Frame`
  - `imageLayers(scale: number, dpr: number): { base: "small" | "mid"; chest: number; screen: number }`

- [ ] **Step 1: Capture the current landing page**

Before changing anything, screenshot `/` at 1440×900 and 375×812, and keep both in the scratchpad as the comparison for Step 7.

- [ ] **Step 2: Write `sceneMath.ts`**

Move the geometry out of `Prototype.tsx` unchanged. `interactive` is `progress >= 0.9`; `arrived` is `progress >= 0.97`; `power` is `smooth((progress - 0.72) / 0.16)`. `imageLayers`: `base` is `"small"` below `scale * dpr = 0.14`; `chest = clamp((s - 0.5) / 0.3)`; `screen = clamp((s - 1.1) / 0.4)`.

- [ ] **Step 3: Rebuild `Scene.tsx`**

Port the loop from `Prototype.tsx`, using `sceneMath` for all numbers and the new image paths. Render: world (background, glow, name, hidden `.screen` probe), dim layer, canvas, `.terminal-light`, and the transform group containing `.terminal` and `<Terminal start={started} />`. Keep the 0.09 scroll easing, the `1.01` end-of-scroll factor, image decoding before use, and re-measuring on resize. Load the small image first.

- [ ] **Step 4: Update `globals.css`**

Remove the pan (`--p`), left plate, `.astro*`, `.resume*`, `.spaceman`, `.arrow`, and their keyframes. `.camera` becomes one painting screen at `left: var(--sx)`, `width: var(--sw)`. Keep the landing's background, glow, name, float, and portrait rules. Add the zoom classes from `prototype.css`, with `.track { height: 460vh }` and `.track .stage { overflow: clip }`.

- [ ] **Step 5: Move and delete files**

Confirm with a search that no code references the old image names, then delete the listed paths. In `README.md`, describe `app/terminal/` as the terminal and `app/terminal/content.ts` as the place to edit about and project text.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 7: Compare the landing view**

Screenshot `/` at both sizes and compare with Step 1. Expected: background, name, and astronaut position match, and the astronaut drifts and the beam pulses at rest.

- [ ] **Step 8: Check the zoom**

Scroll slowly forward and back at both sizes. Expected: no sideways movement; he rolls until the chest unit is level; the name fades early; the background goes dark; the terminal stays attached during the approach and lands inside the gray frame; speaker and housing stay visible at 1440×900; switches and lights stay visible at 375×812. Scrolling back returns exactly to the landing view, and the terminal keeps its history on returning.

- [ ] **Step 9: Check Review Focus items 1 to 3**

- Reload at 50% scroll: the zoom is at that position, with no opening yet. Scroll to the end: the opening plays once.
- Reload at the end: the terminal appears, and the opening plays once.
- At the end, resize from 1440×900 to 1024×768, then to 375×812: the screen stays inside its frame each time, with no sideways page scroll.
- At 375×812, focus the input and type a long command: `.stage` `scrollTop` stays 0, the terminal does not move, and the prompt line stays visible inside the screen.

- [ ] **Step 10: Commit**

```bash
git add -A app public/scene README.md
git commit -m "feat: zoom from the landing page into the suit terminal" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Before committing, run `git status --short` and confirm `public/prototype` and `app/prototype` are gone.

---

### Task 4: Accessible content and reduced motion

**Files:**
- Create: `app/HiddenSummary.tsx`
- Modify: `app/page.tsx`, `app/globals.css`, and the terminal only if a reduced-motion gap is found

**Interfaces:**
- Consumes: `ABOUT`, `PROJECTS`, `RESUME` from `content.ts`.
- Produces: `export default function HiddenSummary()`, a server component rendered after `<Scene />`.

- [ ] **Step 1: Write `HiddenSummary`**

Render a visually hidden section with `h2` headings under the scene's `h1`: about text, one link per project using its title, and a resume link with `download={RESUME.filename}`. Hide it with `position: fixed` so focusing a link does not scroll the page to the end. A focused link becomes visible near the top left with a solid background.

- [ ] **Step 2: Announce new terminal output**

Give the terminal an accessible name, and announce completed output politely without announcing each typed character. This is the builder's choice under the spec.

- [ ] **Step 3: Type-check and build**

Run: `npx tsc --noEmit`, then `npm run build`
Expected: both exit 0, and `out/index.html` contains `New grad Software Engineer at RRD` and `Finacial-Distress-Predictor`.

- [ ] **Step 4: Check keyboard and reduced motion**

At the top of the page, press Tab. Expected: each summary link appears when focused, in order. With reduced motion emulated: the zoom follows the scroll directly; drift, typing animation, glitch, flicker, cursor blink, and glow pulse are off; and the terminal still works.

- [ ] **Step 5: Commit**

```bash
git add app
git commit -m "feat: add accessible site summary" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Production check and phone hand-off

**Files:** none, unless a check fails. Fixes go in the owning file with their own commit.

- [ ] **Step 1: Build for GitHub Pages**

Run: `NEXT_PUBLIC_BASE_PATH=/portfolio npm run build`
Expected: exit 0.

- [ ] **Step 2: Serve under `/portfolio`**

Copy `out/` to `<scratchpad>/site/portfolio/`, and serve `<scratchpad>/site` with a throwaway Node `http` script kept outside the repo.

- [ ] **Step 3: Run the end-to-end check**

Open `/portfolio/` at desktop and phone sizes. Expected: no failed network requests or console errors; the zoom and terminal work; every image loads; the recorded resume download uses `/portfolio/Resume.pdf`; no sideways scroll.

- [ ] **Step 4: Run the final local checks**

Run: `npx tsc --noEmit`, `git status --short`
Expected: exit 0, and a clean tree apart from ignored files.

- [ ] **Step 5: Hand off for the real-phone check**

Stop here and ask Faris to open the dev site on his phone over his tailnet, and confirm the zoom is smooth, the text is readable, and the keyboard does not break the layout. Do not merge or push until he approves.
