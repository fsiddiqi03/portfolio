// The site can be served from a sub-path (GitHub Pages project site) or from a
// domain root. Next adds the base path to its own routes and /_next files, but not
// to plain <img>, <a> or CSS references to files in public/, so they go through here.
// NEXT_PUBLIC_BASE_PATH is inlined at build time; it is empty at a domain root.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;
