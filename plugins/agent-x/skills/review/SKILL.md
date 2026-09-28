---
name: review
description: >-
  Standalone senior code review of a diff, branch or PR against the repo's profile and project rules,
  with blocking vs non-blocking findings and file:line evidence. Trigger on "/agent-x:review",
  "review this PR", "review my changes".
---

# agent-x:review

1. Resolve the diff: an explicit PR/branch/commit range from the user, else `git diff` of the working
   tree against the merge base (read-only git commands only).
2. Load `.agent-x/project.md` (+ lessons.md) and the profile(s) for the touched packages.
3. Dispatch `code-reviewer` with the diff file list and profile paths. If the diff touches auth, input
   handling, secrets, SQL, file I/O or permissions, dispatch `security-auditor` in parallel. If it touches
   UI, dispatch `a11y-auditor` in parallel.
4. Present findings grouped: **blocking** · **should fix** · **nit**, each with file:line and a concrete fix.
   Report the structure checklist score. Do not edit code unless the user then asks; if they do, hand the
   fixes to `implementer` in quick mode.
