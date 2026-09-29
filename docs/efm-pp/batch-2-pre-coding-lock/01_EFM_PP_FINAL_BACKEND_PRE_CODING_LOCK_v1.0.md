# EFM PP — FINAL BACKEND PRE-CODING LOCK v1.0

**STATUS: PRE-CODING LOCK**

## Scope
Private Program (PP) backend architecture before coding.

## Locked Architecture
- PP is a module within EFM Core.
- Commercial transaction is centered on Order.
- Catalog hierarchy: Program → Offering → Package → Package Price.
- Order stores the commercial snapshot.
- Invoice and Payment are separate transaction records.
- Receipt follows confirmed payment.
- Participant is separated from payer/registrant.
- Solo, Couple and Group are supported where enabled.
- Agreement is a contractual snapshot and immutable after signing.
- H&S is separate from Agreement.
- Assessment is an independent historical record.
- PIC uses one shared master across business contexts.
- Assignment is a separate operational relationship.
- Program Ready is derived from multiple gates.
- Session references Assignment.
- Attendance references Session + Participant.
- Audit events are append-only.
- Renewal creates a new Order.
- Active Aging rules remain module-scoped.
- B2B Event and B2B Management retain their own business logic.

## Source Hierarchy
1. Locked Governance
2. Master Agreement Architecture
3. Program Module Documentation
4. PP Business Logic Master
5. PP Core Lock
6. PP Backend Data Contract
7. Technical Build Specification
8. Batch 1 Technical Documents
9. Existing Code / Legacy Behavior

Lower-level sources must not silently override higher-level locked sources.

## Not To Be Invented
- unresolved legal wording
- unresolved e-signature requirements
- unresolved production migration strategy
- future EFM Studio implementation
- future hospital/doctor integration
- unresolved Couple pricing
- unresolved physical database decisions

## Conflict Protocol
If implementation requires a business decision, stop and report:
CONFLICT / SOURCE / CURRENT IMPLEMENTATION / PROPOSED CHANGE / IMPACT / DECISION REQUIRED

## Pre-Coding Gate
Before Phase 1, inspect:
- repository
- framework/runtime
- database
- migration mechanism
- authentication/authorization
- API convention
- test framework
- environment/configuration
- shared EFM services
- legacy PP code

No destructive migration is authorized.

## Final Decision
**PP BACKEND ARCHITECTURE IS LOCKED FOR PHASE 1 FOUNDATION.**

This lock does not authorize invention of unresolved business or legal rules.
