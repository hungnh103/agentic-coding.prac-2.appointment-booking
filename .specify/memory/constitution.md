<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles:
- Template Principle 1 -> I. Code Quality Is a Delivery Requirement
- Template Principle 2 -> II. Tests Prove Behavior Before Merge
- Template Principle 3 -> III. User Experience Must Stay Consistent
- Template Principle 4 -> IV. Performance Budgets Are Part of the Definition of Done
- Template Principle 5 -> V. Simplicity and Maintainability Win by Default
Added sections:
- Delivery Standards
- Review and Release Workflow
Removed sections:
- None
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
- ✅ reviewed .specify/extensions/agent-context/commands/speckit.agent-context.update.md
- ✅ reviewed AGENTS.md
Follow-up TODOs:
- None
-->
# Appointment Booking Constitution

## Core Principles

### I. Code Quality Is a Delivery Requirement
Every change MUST leave the codebase clearer than it found it. Production code
MUST be small in scope, readable without hidden side effects, and aligned with
existing architectural boundaries. Linting, formatting, and static analysis
MUST pass before merge. Any intentional deviation from established patterns
MUST be documented in the implementation plan with a concrete reason and a
simpler alternative considered.

Rationale: quality is not polish after delivery; it is what keeps the system
safe to change as the product grows.

### II. Tests Prove Behavior Before Merge
All behavior changes MUST be backed by automated tests at the lowest practical
level, and every defect fix MUST add a regression test that fails before the
fix and passes after it. Feature work MUST define the unit, integration, and
contract coverage required for the user journey being changed. A change MAY
ship without one layer of tests only when the plan records why that layer adds
no value and names the compensating validation.

Rationale: testing is the executable proof that the implementation matches the
intended behavior and remains safe to refactor.

### III. User Experience Must Stay Consistent
User-facing changes MUST preserve consistent terminology, interaction patterns,
error states, accessibility expectations, and visual hierarchy across the
product. Specifications MUST describe the affected journey, empty and error
states, and any impact on existing flows. New UI or copy patterns MUST reuse
an existing pattern when one exists; otherwise the new pattern MUST be named
and documented so later work can follow it consistently.

Rationale: users experience the product as one system, not as a series of
independent tickets.

### IV. Performance Budgets Are Part of the Definition of Done
Each feature plan MUST declare measurable performance expectations for the
changed workflow, including response time, rendering, throughput, or resource
usage as relevant to the work. Implementations MUST avoid regressions against
existing baselines and MUST include validation for any stated budget. If exact
budgets are unknown, the team MUST document a temporary threshold and the plan
to replace it with a measured baseline.

Rationale: performance is a product requirement and is cheapest to enforce
while the work is being designed.

### V. Simplicity and Maintainability Win by Default
The default solution MUST be the simplest design that satisfies current
requirements, with complexity introduced only when a present need justifies it.
Duplication MAY exist briefly during delivery, but long-lived duplication,
premature abstraction, and speculative extensibility MUST be called out and
resolved before release or explicitly tracked for immediate follow-up.

Rationale: simpler systems are easier to test, review, operate, and improve.

## Delivery Standards

Every specification MUST define independently testable user scenarios,
measurable success criteria, UX expectations for normal and failure paths, and
performance targets or temporary thresholds. Every implementation plan MUST
include a constitution check that confirms code quality gates, required test
coverage, UX consistency impacts, and performance validation. Every task list
MUST include the work needed to satisfy those gates, not only the happy-path
implementation tasks.

## Review and Release Workflow

Code review MUST verify compliance with all core principles before merge.
Reviews MUST reject changes with unclear behavior, missing automated coverage,
unexplained UX divergence, or unvalidated performance impact. Before release,
the owning change MUST confirm that formatting, linting, automated tests, and
any planned UX or performance checks have been completed and recorded in the
feature artifacts.

## Governance

This constitution overrides conflicting local habits and serves as the default
policy for specs, plans, tasks, and reviews in this repository. Amendments
MUST be made by updating this document and any affected templates in the same
change. Semantic versioning governs constitution updates: MAJOR for principle
removals or incompatible redefinitions, MINOR for new principles or materially
expanded guidance, and PATCH for clarifications that do not change required
behavior. Compliance MUST be checked during planning, review, and pre-release
validation; unresolved exceptions MUST be documented in the relevant plan with
owner, rationale, and expiry.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
