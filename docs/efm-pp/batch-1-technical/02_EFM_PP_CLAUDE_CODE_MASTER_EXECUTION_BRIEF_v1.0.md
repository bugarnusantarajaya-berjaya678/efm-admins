# EFM PP — Claude Code Master Execution Brief v1.0

## Mission
Implement EFM Private Program in controlled phases using the locked PP architecture and Technical Build Specification.

## Read order
1. EFM Core Governance
2. Master Agreement Architecture
3. Program Module Documentation System
4. EFM PP Business Logic Master
5. PP Core Lock
6. PP Backend Data Contract
7. EFM_PP_TECHNICAL_BUILD_SPECIFICATION_v1.0
8. This brief

## Non-negotiable
- Do not redesign business logic during coding.
- Do not globalize Active Aging rules.
- Do not split the PIC Master by business module.
- Do not mutate signed Agreements.
- Do not hardcode catalog prices into UI.
- Do not rely on UI-only validation.
- Do not use one giant lifecycle status.
- Do not overwrite historical facts.
- Do not invent unresolved owner/legal decisions.

## Execution
Phase 1 Foundation → Phase 2 Commercial Core → Phase 3 Agreement/H&S → Phase 4 Participant/Assessment → Phase 5 Operations → Phase 6 UI/API → Phase 7 QA.

At every phase: report changed files, schema/migration changes, API changes, tests, results, limitations and deviations. Stop before the next phase unless instructed.

## Stop when
A locked rule conflicts with code, authoritative sources conflict, historical data may be altered, Agreement immutability is threatened, a new global gate is proposed, an ID conflict exists, or B2B logic is being introduced into PP Core.
