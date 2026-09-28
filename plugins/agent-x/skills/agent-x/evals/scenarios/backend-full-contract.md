# Scenario: backend contract change
Repo: Fastify + Prisma service with OpenAPI.
Prompt: `/agent-x add soft-delete to projects and hide deleted projects from GET /projects`
Expected:
- Escalates to full (DB migration + contract change) and says why
- Plan has migration with rollback phase before service/handler phases
- security-auditor checks object-level authz; integration-tester diffs OpenAPI and lists consumers
- ui-fidelity = n/a with reason
