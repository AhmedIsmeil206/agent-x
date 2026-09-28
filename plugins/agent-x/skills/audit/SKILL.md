---
name: audit
description: >-
  Standalone security and accessibility audit of a path, feature or the whole app (web, mobile or backend),
  report-only. Trigger on "/agent-x:audit", "security audit", "a11y audit", "is this secure/accessible".
---

# agent-x:audit

1. Scope: the path/feature the user names; whole repo only if asked (then sample by risk: auth, payments,
   input boundaries, file upload, admin).
2. Dispatch `security-auditor` always; `a11y-auditor` when the scope has UI. Pass the profile paths.
3. Report findings by severity (critical / high / medium / low) with file:line, exploit or user impact,
   and fix. Anything not checkable with available tooling is listed as `unmeasured`, not passed.
