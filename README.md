# Permissable

A visual RBAC (role-based access control) builder. Model roles, permissions,
and resource hierarchies as a graph, test "can user X do Y on Z" scenarios
live, and export the whole thing as drop-in Express or Next.js middleware.

## Setup

```bash
git clone https://github.com/byllzz/permissable.git
cd permissable
npm install
npm run dev
```

Requires Node 18+. Built with React + Vite + TypeScript + Tailwind CSS v4.

## Model

- **Roles** can inherit from other roles (`extends`) - a Manager can extend
  Employee, picking up all of Employee's grants for free.
- **Permissions** are verbs (`read`, `write`, `delete`, `approve`, ...).
- **Resources** can nest (`Organization > Project > Task`). A grant on a
  parent resource can optionally *cascade* down to its descendants.
- A **Grant** is `(role, permission, resource, cascade)`. Everything else -
  role inheritance, resource cascading, "who can do what" - is derived by
  walking the graph, both in the app (`src/lib/simulate.ts`) and in the
  generated middleware.

## Where things live

- `src/types/rbac.ts` - the domain types.
- `src/lib/store.ts` - Zustand store holding the live graph (nodes, grants, users).
- `src/lib/simulate.ts` - the access-check algorithm used by the live simulator.
- `src/lib/toFlow.ts` - maps the graph into React Flow nodes/edges for rendering.
- `src/components/` - Sidebar (add/list nodes), GraphCanvas (React Flow
  canvas), Inspector (edit a selected node: inheritance, resource parent,
  grants), Simulator (pick a user/permission/resource and see allow/deny with
  reasoning), ExportModal.
- `src/export/` - code generators. `serialize.ts` emits the graph as plain
  `NODES`/`GRANTS` data; `exportExpress.ts` and `exportNextjs.ts` wrap that
  data in a `can()` function plus a middleware/route-wrapper helper.

## Exporting

The exported files are self-contained - the `NODES`/`GRANTS` data block plus
a small amount of traversal logic (role-closure and resource-ancestor walks)
and a `can(roleIds, permissionId, resourceId)` function. No runtime
dependency on this app. Express gets `requirePermission(permission, resource,
{ getUserRoleIds, getResourceId })` middleware; Next.js gets a `withPermission`
route-handler wrapper for the App Router, plus a plain `can()` export for use
in Server Actions or elsewhere.

Regenerate and re-export whenever the graph changes - the data block is
meant to be overwritten wholesale, not hand-edited.

## Notes / next steps

- Grants are created explicitly in the Inspector (pick permission + resource
  for a selected role) rather than by dragging edges on the canvas - this
  keeps every grant an unambiguous role→permission→resource triple.
- The `condition` field on `Grant` (e.g. "own records only") is modeled but
  not yet surfaced in the UI; it's exported as a comment today and is the
  natural place to hook in row-level/ABAC-style checks.
- The graph persists to `localStorage` (`src/lib/store.ts`, via
  `zustand/persist`) - a refresh doesn't lose work. There's no backend or
  multi-device sync; if you need that, swap the `persist` storage adapter
  for calls to your own API.

## Production readiness

Domain is set to `https://permissable.vercel.app` throughout (`index.html`,
`public/sitemap.xml`, `public/robots.txt`). If you ever move off that
subdomain, update those references to match.

What's already wired up:

- **Favicons & app icons** - `public/favicon.ico`, `icon.svg`,
  `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, and a
  `maskable-icon-512.png` for Android's adaptive-icon safe zone. Regenerate
  by editing `public/icon.svg` and re-rendering (any SVG→PNG tool works;
  sizes needed are 16, 32, 180, 192, 512).
- **PWA** - `public/manifest.webmanifest` plus `vite-plugin-pwa` (configured
  in `vite.config.ts`) generates a service worker at build time that
  precaches the app shell, so the app installs on mobile/desktop and keeps
  working offline after first load. No backend calls exist yet to worry
  about caching separately.
- **SEO/social** - full meta description, canonical URL, Open Graph and
  Twitter card tags, `robots.txt`, `sitemap.xml`, and a generated
  `public/og-image.png` for link previews.
- **Error boundary** - `src/components/ErrorBoundary.tsx` catches render
  crashes so one bug doesn't blank-screen the whole app; offers reload or
  reset-saved-graph.
- **Local persistence** - the graph survives refreshes via `localStorage`.
- **Build** - code-split vendor/reactflow chunks, sourcemaps enabled for
  production debugging, CI workflow (`.github/workflows/ci.yml`) that
  typechecks and builds on every push.

### Deploying

Repo: https://github.com/byllzz/permissable - connect this repo directly in
the Vercel dashboard (Import Project → pick `byllzz/permissable`) and it
deploys using the committed `vercel.json`, no extra config needed. Every
push to `main` redeploys.

Pick whichever matches your infra - all three are preconfigured:

- **Vercel / Netlify** - `vercel.json` / `netlify.toml` are already in the
  repo. Push to a Git repo, import it in either dashboard, and it builds
  with zero extra config (`npm run build`, output `dist/`).
- **Docker / your own host** - `docker compose up --build` serves the built
  app via nginx on port 8080 (`Dockerfile` + `nginx.conf`, with SPA
  fallback, gzip, immutable caching on hashed assets, and no-cache on the
  service worker/manifest so updates always reach users promptly).
- **Any static host** (S3+CloudFront, GitHub Pages, Cloudflare Pages, etc.)
  - `npm run build` and upload `dist/`. Just make sure unknown paths fall
  back to `index.html`, and that `sw.js`/`manifest.webmanifest` are served
  with `Cache-Control: no-cache` so PWA updates roll out immediately.

### What's deliberately out of scope

This is a client-only app - there's no auth, no multi-user backend, and the
graph lives in the browser's `localStorage` per device. That's fine for a
single designer prototyping RBAC schemes, but if multiple people need to
collaborate on the same graph, or you want it to survive a cleared
browser, you'll need to add a backend (even something as simple as
persisting the store's JSON to an API on every change) - the store's
`partialize`d shape in `src/lib/store.ts` is exactly what you'd POST/GET.
