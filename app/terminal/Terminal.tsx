"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { asset } from "../asset";
import {
  execute,
  kindOf,
  listItems,
  promptFor,
  relative,
  type Output,
} from "./commands";
import { ABOUT, RESUME } from "./content";
import "./terminal.css";

type Entry = { id: number; cwd: string; cmd: string; typed: number; output: Output | null };
type MakeCommand = (cwd: string) => string | null;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const downloadResume = () => {
  const link = document.createElement("a");
  link.href = asset(RESUME.path);
  link.download = RESUME.filename;
  link.click();
};

export default function Terminal({ start }: { start: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cwd, setCwd] = useState("");
  const [value, setValue] = useState("");
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const cwdNow = useRef("");
  const pending = useRef(0);
  const skip = useRef(false);
  const nextId = useRef(0);
  const began = useRef(false);

  // Commands run strictly one at a time, so quick clicks keep their order and
  // each one starts from the folder the previous one left behind.
  const enqueue = useCallback((make: MakeCommand, animate = true, rush = true) => {
    if (rush && pending.current) skip.current = true;
    pending.current += 1;
    const wait = (ms: number) =>
      skip.current || prefersReducedMotion()
        ? Promise.resolve()
        : new Promise<void>((done) => setTimeout(done, ms));

    queue.current = queue.current.then(async () => {
      const from = cwdNow.current;
      const cmd = make(from);
      if (cmd === "clear") {
        setEntries([]);
      } else if (cmd !== null) {
        const id = nextId.current++;
        const update = (change: Partial<Entry>) =>
          setEntries((all) => all.map((e) => (e.id === id ? { ...e, ...change } : e)));

        setEntries((all) => [
          ...all,
          { id, cwd: from, cmd, typed: animate ? 0 : cmd.length, output: null },
        ]);
        if (animate) {
          // Typed at a human pace, a little uneven like real keystrokes.
          await wait(240);
          for (let typed = 1; typed <= cmd.length; typed++) {
            await wait(70 + Math.random() * 55);
            update({ typed });
          }
          await wait(340);
        }
        const result = execute(cmd, from);
        cwdNow.current = result.cwd;
        setCwd(result.cwd);
        update({ typed: cmd.length, output: result.output });
        if (result.download) downloadResume();
        if (animate) await wait(460);
      }
      pending.current -= 1;
      if (!pending.current) skip.current = false;
    });
  }, []);

  // Clicking a name runs the command you would have typed from the current folder.
  const openPath = useCallback(
    (path: string) => {
      const kind = kindOf(path);
      if (kind === "dir") {
        enqueue((from) => (from === path ? null : `cd ${relative(from, path)}`));
        enqueue(() => "ls");
      } else {
        const verb = kind === "pdf" ? "open" : "cat";
        enqueue((from) => `${verb} ${relative(from, path)}`);
      }
    },
    [enqueue],
  );

  useEffect(() => {
    if (!start || began.current) return;
    began.current = true;
    enqueue(() => "cat about.txt", true, false);
    enqueue(() => "ls", true, false);
  }, [start, enqueue]);

  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  // Now and then the signal slips for a moment.
  useEffect(() => {
    const screen = body.current?.parentElement;
    if (!start || !screen || prefersReducedMotion()) return;
    let timer = 0;
    const between = (low: number, high: number) => low + Math.random() * (high - low);
    const burst = () => {
      const direction = Math.random() < 0.5 ? -1 : 1;
      screen.style.setProperty("--glitch-x", `${(direction * between(1, 2.6)).toFixed(1)}px`);
      screen.style.setProperty("--glitch-y", `${between(6, 88).toFixed(0)}%`);
      screen.style.setProperty("--glitch-height", `${between(2, 7).toFixed(1)}%`);
      screen.dataset.glitch = "";
      timer = window.setTimeout(() => {
        delete screen.dataset.glitch;
        const again = Math.random() < 0.3;
        timer = window.setTimeout(burst, again ? between(70, 160) : between(2600, 7000));
      }, between(70, 170));
    };
    timer = window.setTimeout(burst, 900);
    return () => {
      window.clearTimeout(timer);
      delete screen.dataset.glitch;
    };
  }, [start]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const typed = value.trim();
    setValue("");
    enqueue(() => typed, false);
  };

  const typing = entries.some((entry) => entry.output === null);

  return (
    <>
      <div className="terminal-tear" aria-hidden="true" />
      <div
        ref={body}
        className="terminal-body"
        onPointerDownCapture={() => {
          if (pending.current) skip.current = true;
        }}
        onClick={(event) => {
          const onControl = (event.target as HTMLElement).closest("button, a, input");
          const selecting = Boolean(window.getSelection()?.toString());
          if (!onControl && !selecting && window.matchMedia("(pointer: fine)").matches) {
            input.current?.focus({ preventScroll: true });
          }
        }}
      >
        {start && <p className="terminal-boot">SUIT TERMINAL v1.0 :: type help for commands</p>}
        {entries.map((entry) => (
          <section
            key={entry.id}
            className={
              entry.output && entry.output.type !== "none"
                ? "terminal-entry"
                : "terminal-entry-bare"
            }
          >
            <p className="terminal-line terminal-typed">
              <span className="terminal-prompt">{promptFor(entry.cwd)} </span>
              {entry.cmd.slice(0, entry.typed)}
              {entry.output === null && <span className="terminal-cursor" />}
            </p>
            {entry.output && <OutputView output={entry.output} open={openPath} />}
          </section>
        ))}
        {start && (
          <form className="terminal-line terminal-typed terminal-form" onSubmit={submit}>
            <label className="terminal-prompt" htmlFor="terminal-input">
              {promptFor(cwd)}{" "}
            </label>
            <span>{value}</span>
            {!typing && <span className="terminal-cursor" />}
            <input
              ref={input}
              id="terminal-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-label="Type a command"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="go"
            />
          </form>
        )}
      </div>
    </>
  );
}

const HELP: [string, string][] = [
  ["ls", "list this folder"],
  ["cd <folder>", "move to a folder"],
  ["cat <file>", "read a file"],
  ["open <file>", "open or download a file"],
  ["pwd", "show where you are"],
  ["clear", "clear the screen"],
];

function OutputView({ output, open }: { output: Output; open: (path: string) => void }) {
  switch (output.type) {
    case "none":
      return null;
    case "text":
      return <p className="terminal-out terminal-faded">{output.text}</p>;
    case "about":
      return (
        <div className="terminal-out">
          <p className="terminal-bright">{ABOUT.name}</p>
          <p>{ABOUT.summary}</p>
        </div>
      );
    case "project":
      return (
        <div className="terminal-out">
          <p className="terminal-bright">{output.project.title}</p>
          <p>{output.project.about}</p>
          <a className="terminal-link" href={output.project.url} target="_blank" rel="noreferrer">
            {output.project.url.replace("https://", "")}
          </a>
        </div>
      );
    case "download":
      return (
        <p className="terminal-out">
          downloading resume.pdf ...{" "}
          <a className="terminal-link" href={asset(RESUME.path)} download={RESUME.filename}>
            retry
          </a>
        </p>
      );
    case "help":
      return (
        <dl className="terminal-out terminal-help">
          {HELP.map(([command, meaning]) => (
            <div key={command}>
              <dt>{command}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      );
    case "list":
      return (
        <ul className="terminal-out terminal-list">
          {listItems(output.dir).map((item) => (
            <li key={item.path}>
              <button
                type="button"
                className={`terminal-link${kindOf(item.path) === "dir" ? " terminal-dir" : ""}`}
                onClick={() => open(item.path)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      );
  }
}
