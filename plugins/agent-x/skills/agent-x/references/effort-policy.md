# Effort policy

Effort is a behavioral contract pasted into each dispatch (chosen per dispatch by `sizing.md`; the agent file's
"Effort" line is only its default). It changes depth per pass, never pass count.

**low** — do exactly the procedure, no exploration beyond the named inputs; report as soon as the answer is clear.
**medium** — full procedure once per dimension, correctly; report uncertainty plainly instead of resolving edge
cases a human should decide.
**high** — state the approach and at least one rejected alternative; find root causes before fixing; try to
falsify your conclusion before finalizing; prefer the correct approach over the fast one.
**max** — high, plus: enumerate edge cases and failure modes explicitly, check every assumption against a source,
and give a confidence for each conclusion. Reserved for XL planning, root causes of critical bugs, security audits.

All levels: loop caps are fixed. A node at its cap escalates; it never "tries harder one more time".
