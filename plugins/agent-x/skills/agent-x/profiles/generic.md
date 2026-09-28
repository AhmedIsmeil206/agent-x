# Profile: generic
kind: detected per project

Use when no specific profile fits — any language. Toolchain fallbacks: `languages.md`. Everything comes from `.agent-x/project.md`; if a field is missing
there, discovery infers it from the closest existing example and the planner states it as an assumption.

## Structure checklist
- [ ] Files placed and named like their nearest existing siblings
- [ ] No duplicate of an existing module/function
- [ ] External input validated at the boundary
- [ ] Errors surfaced, not swallowed
- [ ] Tests exist for new logic and pass
- [ ] Project rules in project.md satisfied
