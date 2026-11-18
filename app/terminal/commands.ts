import { PROJECTS, type Project } from "./content";

// The terminal's small file system. Paths are relative to home, which is "".

export type Kind = "dir" | "txt" | "pdf";

export type Output =
  | { type: "none" }
  | { type: "text"; text: string }
  | { type: "list"; dir: string }
  | { type: "about" }
  | { type: "project"; project: Project }
  | { type: "download" }
  | { type: "help" };

export type Result = { cwd: string; output: Output; download?: boolean };

const ABOUT_FILE = "about.txt";
const RESUME_FILE = "resume.pdf";
const PROJECTS_DIR = "projects";

const projectPath = (project: Project) => `${PROJECTS_DIR}/${project.file}`;

export const kindOf = (path: string): Kind | null => {
  if (path === "" || path === PROJECTS_DIR) return "dir";
  if (path === ABOUT_FILE) return "txt";
  if (path === RESUME_FILE) return "pdf";
  return PROJECTS.some((project) => projectPath(project) === path) ? "txt" : null;
};

export const resolve = (cwd: string, arg: string): string => {
  const fromHome = arg.startsWith("~") || arg.startsWith("/");
  const parts = fromHome ? [] : cwd.split("/").filter(Boolean);
  for (const part of arg.replace(/^~/, "").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
};

export const relative = (cwd: string, target: string): string => {
  if (!cwd) return target || ".";
  if (target === cwd) return ".";
  if (target.startsWith(`${cwd}/`)) return target.slice(cwd.length + 1);
  return target ? `../${target}` : "..";
};

export const listItems = (dir: string): { label: string; path: string }[] =>
  dir === PROJECTS_DIR
    ? [
        { label: "../", path: "" },
        ...PROJECTS.map((project) => ({ label: project.file, path: projectPath(project) })),
      ]
    : [
        { label: ABOUT_FILE, path: ABOUT_FILE },
        { label: `${PROJECTS_DIR}/`, path: PROJECTS_DIR },
        { label: RESUME_FILE, path: RESUME_FILE },
      ];

export const promptFor = (cwd: string): string => `faris@suit:~${cwd ? `/${cwd}` : ""}$`;

const text = (cwd: string, value: string): Result => ({
  cwd,
  output: { type: "text", text: value },
});

const show = (cwd: string, path: string): Result => {
  if (path === RESUME_FILE) return { cwd, output: { type: "download" }, download: true };
  if (path === ABOUT_FILE) return { cwd, output: { type: "about" } };
  const project = PROJECTS.find((item) => projectPath(item) === path);
  return { cwd, output: project ? { type: "project", project } : { type: "none" } };
};

export const execute = (raw: string, cwd: string): Result => {
  const [word = "", arg] = raw.trim().toLowerCase().split(/\s+/);
  const target = arg === undefined ? cwd : resolve(cwd, arg);
  const kind = kindOf(target);
  const missing = `${arg}: No such file or directory`;

  switch (word) {
    case "":
      return { cwd, output: { type: "none" } };
    case "help":
      return { cwd, output: { type: "help" } };
    case "pwd":
      return text(cwd, `/home/faris${cwd ? `/${cwd}` : ""}`);
    case "whoami":
      return text(cwd, "faris");
    case "ls":
      if (!kind) return text(cwd, `ls: cannot access '${arg}': No such file or directory`);
      return kind === "dir" ? { cwd, output: { type: "list", dir: target } } : text(cwd, arg);
    case "cd": {
      const destination = arg === undefined ? "" : target;
      const destinationKind = kindOf(destination);
      if (!destinationKind) return text(cwd, `cd: ${missing}`);
      if (destinationKind === "pdf") return show(cwd, destination);
      if (destinationKind === "txt") return text(cwd, `cd: ${arg}: Not a directory`);
      return { cwd: destination, output: { type: "none" } };
    }
    case "cat":
    case "open":
      if (arg === undefined) return text(cwd, `${word}: missing file name`);
      if (!kind) return text(cwd, `${word}: ${missing}`);
      if (kind === "dir") return text(cwd, `${word}: ${arg}: Is a directory`);
      return show(cwd, target);
  }

  // A bare name opens it, with or without its extension: "projects", "about", "resume".
  const named = [word, `${word}.txt`, `${word}.pdf`]
    .map((name) => resolve(cwd, name))
    .find((path) => kindOf(path) !== null);
  if (named === undefined) return text(cwd, `suit: ${word}: command not found`);
  return kindOf(named) === "dir"
    ? { cwd: named, output: { type: "list", dir: named } }
    : show(cwd, named);
};
