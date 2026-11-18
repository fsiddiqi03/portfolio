# Astronaut Terminal: Design

Date: 2026-11-18
Status: awaiting Faris's approval
Working reference: the prototype at `/prototype` (`app/prototype/`, `public/prototype/`)

## Intent

Faris wants the site to show who he is and what he has built without giving up the
painted space scene on the landing page. Scrolling now flies the visitor from the
landing page into the astronaut's chest, where a small screen painted on his suit
wakes up as a working terminal. The about text, projects, and resume live in that
terminal as files and folders.

The idea should feel like one continuous world: the terminal belongs to the painting
rather than sitting on top of it.

## Goals

- Keep the landing page's look: same background, name, astronaut, and placement.
- Replace the sideways scroll with one continuous zoom into the astronaut.
- Turn the painted grid screen on his chest into the terminal, leaving the rest of the
  chest unit visible around it.
- Make the terminal behave like a real one, while letting people who never type reach
  everything by clicking.
- Make the content easy to update when projects change.

## Non-goals

- No new artwork, 3D library, or other runtime dependency.
- No contact section.
- No changes to the artwork in `layers/`.
- No full shell: only the commands listed here.

## Anti-goals

This fails, even if it technically works, if:

- A box covers the chest details. The switches, speaker, and housing must stay visible.
- The terminal looks like a modern web card instead of a glowing old terminal.
- The glitch is strong enough to make the text hard to read.
- The landing page visibly changes or jumps before the visitor scrolls.

## Constraints

- Next.js static export on GitHub Pages, served under `/portfolio`. Every file in
  `public/` must be referenced through `asset()` in `app/asset.ts`.
- A push to `main` deploys the live site, so this work happens on a branch and reaches
  `main` only after the checks below pass and Faris approves.
- The repo has no test runner. Verification is the type check, the production build,
  and the browser checks below.

## Approaches considered

1. **Zoom into the astronaut, terminal on his chest (chosen).** Uses existing art and
   keeps the painted style in frame. Faris arrived here through the prototype.
2. **Keep flying through space, one painted stop per project.** Striking, but every
   new project would need its own art and layout.
3. **Full 3D with Three.js.** Real depth, but flat paintings look like cutouts when the
   camera turns, and it is the heaviest option on phones.

Variations rejected along the way: a terminal beside the astronaut on black, a tablet
in his hands (needs new art and a new pose), and a large screen covering the whole chest
unit (hides the details Faris wants to keep).

## The experience

1. The page opens on the current landing view, with the astronaut drifting as he does
   today, the name floating, and the beam glow pulsing.
2. Scrolling down zooms toward the grid screen while he rolls from 29.362° to -34.6°,
   which levels the chest unit. The name fades early, the background moves more slowly
   than he does, then fades to the site's near-black.
3. The screen powers on late in the zoom. At the end, the camera holds still and the
   terminal types its opening commands.
4. Scrolling back up reverses the zoom to the landing page. The terminal keeps its
   history and current folder.

## Terminal

### Files

```
~/
├── about.txt
├── projects/
│   ├── discord-aws-bot.txt
│   ├── custom-pi-ring-camera.txt
│   ├── pi-flood-detector.txt
│   ├── chicago-pothole-web.txt
│   ├── steam-flock-bot.txt
│   └── financial-distress-predictor.txt
└── resume.pdf
```

Projects stay in this order. They are not sorted alphabetically.

### Content

`about.txt`:

> **Faris Siddiqi**
> New grad Software Engineer at RRD, working with C#/.NET and SQL.

| File | Title | Description | Link |
| --- | --- | --- | --- |
| `discord-aws-bot.txt` | Discord AWS Bot | Discord bot that runs a modded Minecraft server on AWS EC2. Slash commands start and stop the server, check its status, and back up the world to S3. | `github.com/fsiddiqi03/DiscordAWS` |
| `custom-pi-ring-camera.txt` | Custom Pi Ring Camera | Smart security camera built on a Raspberry Pi 5. A YOLO model on AWS Lambda detects people, recordings are stored in S3, and SES sends email alerts. | `github.com/fsiddiqi03/Custom-Pi-Ring-Camera` |
| `pi-flood-detector.txt` | Pi Flood Detector | Home flood detector using a Raspberry Pi and a water level sensor. When it detects water, it sends an email alert through AWS SES. | `github.com/fsiddiqi03/RaspberryPi-Flood-Detector` |
| `chicago-pothole-web.txt` | Chicago Pothole Web | Web app that tracks open potholes across Chicago every day. Built with Next.js, with a Mapbox map and a ward leaderboard. | `github.com/fsiddiqi03/Chicago-Pothole-Web` |
| `steam-flock-bot.txt` | Steam Flock Bot | Discord bot that watches your Steam friends and posts when they start, switch, or stop a game. Player and session data is stored in Supabase. | `github.com/fsiddiqi03/Steam-Friend-Tracker-Discord-Bot` |
| `financial-distress-predictor.txt` | Financial Distress Predictor | Machine learning project that predicts whether a borrower will face financial distress within two years. Trains and compares four models on Kaggle's Give Me Some Credit dataset. | `github.com/fsiddiqi03/Finacial-Distress-Predictor` |

The last repo's URL really is spelled "Finacial". Project links open in a new tab.

### Commands

| Command | Result |
| --- | --- |
| `ls [path]` | Lists a folder, one item per line. Inside `projects`, `../` is listed first. |
| `cd [path]` | Changes folder and prints nothing. No path goes home. |
| `cat <file>` | Shows a text file. On `resume.pdf`, downloads it. |
| `open <file>` | Same as `cat`. |
| `pwd` | Prints `/home/faris` plus the current folder. |
| `whoami` | Prints `faris`. |
| `help` | Lists the commands. |
| `clear` | Clears the screen and keeps the current folder. |

- Paths support `.`, `..`, `~`, and trailing slashes. Input is case-insensitive.
- `cd resume.pdf`, including from another folder, downloads the resume.
- A bare name opens it, with or without its extension: `projects`, `about`, `resume`.
- Errors read like a shell: `suit: foo: command not found`,
  `cat: x: No such file or directory`, `cd: about.txt: Not a directory`.

### Behavior

- The prompt shows the folder: `faris@suit:~$`, `faris@suit:~/projects$`.
- The top line reads `SUIT TERMINAL v1.0 :: type help for commands`.
- The opening runs `cat about.txt`, then `ls`.
- Clicking a name types and runs the command for it from the current folder. Clicking a
  folder runs `cd`, then `ls`. Clicking `resume.pdf` runs `open`.
- Scripted commands type at 70 to 125 ms per character. Commands the visitor types
  appear at once when they press Enter.
- Enter on an empty line prints a new prompt, like a real terminal.
- Clicking or tapping during scripted typing finishes it immediately.
- The output scrolls inside the screen and stays pinned to the newest line.
- On devices with a mouse, clicking the screen focuses the prompt. On touch devices, the
  keyboard opens only when the prompt line itself is tapped.
- A resume download prints `downloading resume.pdf ... retry`, where `retry` is a real
  download link.

### Look

- Teal phosphor text matched to the suit's lights (`#3fe8bd`, with `#c9fff0` for bright
  text and `#35ad8f` for faded text), in a system monospace font.
- A block cursor, solid and blinking when focused, hollow when not.
- Scanlines, darkened tube edges, and a faint flicker.
- Translucent glass, so the painted grid shows through.
- Commands highlight like a selected terminal line on hover and keyboard focus.
- Every few seconds, at random, a brief glitch of about 70 to 170 ms: the text jitters
  1 to 2.6 px, splits red and blue, and a band of light crosses the screen. It sometimes
  repeats once right away.
- Teal light falls on the painted frame and housing using `screen` blending, breathing
  slowly. The glass has a shadow under its top edge and a faint lit rim.

## Fit to the artwork

These numbers are measured from `layers/astronaut.png` and proven by the prototype.

- The astronaut crop is left 1089, top 176, width 4200, height 2754. It matches the crop
  used for today's `astronaut.webp`.
- The camera targets (1217, 1302) in crop coordinates, the center of the grid screen.
- With the art rotated -34.6°, the screen measures 215 × 225 art pixels. Its sides slant
  slightly, so the terminal is clipped to
  `polygon(0 0, 96.6% 0, 100% 100%, 3.4% 100%)`.
- Final framing:
  - Landscape: scale is the smaller of `0.46 × width / 215` and `0.56 × height / 225`,
    with the screen centered at 42% across and 60% down.
  - Portrait: scale is the smaller of `0.9 × width / 215` and `0.5 × height / 225`, with
    the screen centered at 50% across and 62% down.

Images, all generated from `layers/astronaut.png`:

| Image | Source region | Output | Prototype size |
| --- | --- | --- | --- |
| Small | astronaut crop | 420 px wide | 33 KB |
| Mid | astronaut crop | 2100 px wide | 252 KB |
| Chest | left 1118, top 47, 2800 × 2800 | same size | 423 KB |
| Screen close-up | left 1608, top 779, 1400 × 1400 | 2800 × 2800, Lanczos with light sharpening | 251 KB |

## Build notes

- Draw the astronaut on a canvas and switch image sizes as he grows. Plain CSS scaling
  of one image would blur or shimmer across a zoom this deep.
- Keep the terminal as real HTML attached to the same transform, so its text stays sharp.
- Use `overflow: clip` on the scene and the terminal. With `overflow: hidden`, typing
  makes the browser scroll the scene upward. The prototype hit this bug.
- Keep the terminal inert until the zoom is nearly done.
- Put the glow in its own layer outside the terminal's transform group, or `screen`
  blending cannot reach the canvas.
- Decode large images before their first draw. Load the small image first.
- Keep project content in a plain data list, so adding a project is a one-entry change.

## What changes in the repo

- `app/page.tsx` renders the new experience at `/`.
- `app/Scene.tsx` and `app/globals.css` lose the sideways pan and Resume screen.
- `public/scene/background-left.webp`, `arrow.webp`, `resume.webp`, `spaceman.webp`, and
  `astronaut.webp` are removed if nothing references them after the change.
- The new astronaut images move into `public/scene/`.
- `app/prototype/` and `public/prototype/` are deleted once their useful code has moved.
- Other unused files already in `public/scene/` stay. Cleaning them up is separate work.

## Accessibility and fallback

- Include a visually hidden section in the static HTML with the name, about text,
  project links, and resume link. This gives screen readers and search engines the
  content without scrolling through the animation. Its links become visible on keyboard
  focus.
- With `prefers-reduced-motion`, the zoom follows the scroll directly, and the drift,
  typing animation, glitch, flicker, cursor blink, and glow pulse are off.

## Verification

- `npx tsc --noEmit` passes.
- `NEXT_PUBLIC_BASE_PATH=/portfolio npm run build` passes, and images, the resume, and
  page assets load under `/portfolio` when the exported site is served there.
- In a browser at desktop and phone sizes:
  - The first view matches the current landing page.
  - The zoom plays forward and backward, and the screen lands inside its painted frame.
  - Every command and error above works, by clicking and typing.
  - Project links are correct, and the resume downloads.
  - Typing does not shift the scene, and the page has no sideways scroll.
  - Reloading partway down or at the end recovers correctly.
- On a real phone, Faris confirms the zoom is smooth, the text is readable, and the
  keyboard does not break the layout. This has not been tested yet. The dev server
  already allows a device on his tailnet.

## Decisions

Faris decided:

- Zoom from the landing page and remove the sideways scroll.
- Use the regular landing background, not the extended one.
- Use the grid screen on the chest, with the other chest details left visible.
- Make it look like a real terminal, with folders, `.txt` files, and a downloadable
  `resume.pdf`.
- The about text, the six projects and their order, and no contact section.
- Slower typing, Enter making a new line, a slight glitch, and a small glow.

Claude's calls, open to correction:

- Project name "Financial Distress Predictor" instead of "Projector", matching the repo.
- `Steam-Friend-Tracker-Discord-Bot` is the Steam Flock Bot, because its code calls
  itself "Steam Flock".
- The `suit` naming and the `SUIT TERMINAL v1.0` line.
- The extra commands (`pwd`, `whoami`, `open`, `clear`) and bare-name shortcuts.
- Teal text instead of the site's gold.
- The hidden accessible content section.

## Left to the builder

- File and component structure.
- Exact easing, scroll length (the prototype uses `460vh`), and fade timing, as long as
  the result matches the prototype's feel.
- How screen readers are told about new terminal output.
