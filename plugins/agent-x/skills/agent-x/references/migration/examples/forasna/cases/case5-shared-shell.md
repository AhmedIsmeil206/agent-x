---
name: case5-shared-shell
description: >-
  Migration Case 5 — the cross-cutting app shell: legacy header.tpl / nav.tpl / footer.tpl includes
  and PHP $_SESSION auth guards. Extract to shared React layout components, TanStack Router root
  routes, and an explicit useAuth() context. Run this ONCE globally before per-page migrations.
---

# Case 5 — Shared shell + auth context

Migrating pages without the shell breaks layout, sessions, and nav. Do this first, once.

## Workflow
1. **Shell deconstruction.** legacy-decompiler reads `header.tpl`, `nav.tpl`, `footer.tpl`
   `{include}`s and the PHP session-init scripts. Capture nav structure, role-conditioned menu
   items, and every `$_SESSION[...]` guard.
2. **Layout components.** react-synthesizer builds shared layout under
   `src/components/shared/{header,footer}` (the repo already has `shared/header`, `shared/footer`,
   plus role headers in `jobseeker/header`, `guest/footer`) and wires them into the route-group
   layouts. Reuse existing pieces; don't duplicate.
3. **Root routes / groups.** Map onto the existing file-based groups: `_public` (SEO/guest),
   `_guest` (auth screens), `_private` (authed employer/jobseeker). Guards live on the group
   `route.tsx`, mirroring the current structure.
4. **Auth provider.** Convert `$_SESSION['user_id']`/role checks into a `useAuth()` context backed
   by the JWT flow already in `src/api/auth` (`validate.ts`, `refresh-token.ts`, `clear-session.ts`,
   `jwt-decode`). Route guards read from it; guests are redirected/hosted per the legacy behavior.
   Reproduce impersonation banners (`impersonation-bar.tsx`) if the session carried them.
5. Verify (a11y on nav/menus, RTL) → this becomes the frame every later page renders inside.

## Non-negotiable gates (this case does NOT relax them)
The shell is the frame every later page renders inside — a sloppy shell caps the fidelity of every
page built on it, so it is gated like any other surface:
- **G2** every required node runs; "it's just the header/nav" is a FORBIDDEN reason to skip anything.
- **G3** RENDERED design-truth capture of the shell at mobile+tablet+desktop, with the full
  computed-style set and the interactive-state matrix — nav **open/closed**, dropdowns
  **expanded/collapsed**, sticky/scrolled variants, authed vs guest, and RTL mirroring.
- **G5 design-comparison gate.** visual-verifier MUST render BOTH sides (the Figma node or the live
  production/legacy URL, AND the running implementation) and diff per element × state × breakpoint;
  ≥0.98 **GATES**, a miss opens a back-edge (cap 3).
- **G6** every nav control driven (open every menu, tab through) — unexercised = automatic FAIL.
- **G7** route-integrity on **every nav href** across localhost/testing/production, reconciled
  against the ingress allowlists: nav links are exactly where cross-app links break. Deployed builds
  keep them RELATIVE.
- **G4/G10** inventory frozen and closed out; devops cutover in BOTH envs before "done".

## Guardrail
Auth semantics are security-critical: reproduce the guard server-side (route group), never as a
client-only hide. Ambiguous session logic → AskUserQuestion, don't guess.
