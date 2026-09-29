# EFM PP — PHASE 1 ACCEPTANCE / QA CHECKLIST v1.0

## A. Repository
- [ ] architecture documented
- [ ] runtime/framework confirmed
- [ ] database confirmed
- [ ] migration tool confirmed
- [ ] test framework confirmed
- [ ] shared services identified

## B. Configuration
- [ ] environment configuration works
- [ ] secrets are not hardcoded
- [ ] development/test configuration separated
- [ ] missing required configuration fails explicitly

## C. Database
- [ ] connection successful
- [ ] migration successful
- [ ] base migration successful
- [ ] no destructive migration
- [ ] transaction strategy documented

## D. IDs
- [ ] one authoritative generator
- [ ] uniqueness test passes
- [ ] collision handling defined
- [ ] IDs are not generated independently by UI

## E. Audit
- [ ] audit event can be created
- [ ] actor recorded where available
- [ ] timestamp recorded
- [ ] entity reference recorded
- [ ] request/correlation ID recorded
- [ ] audit history append-only

## F. Validation / Errors
- [ ] validation error standardized
- [ ] not found standardized
- [ ] conflict standardized
- [ ] unauthorized standardized
- [ ] forbidden standardized
- [ ] internal error standardized
- [ ] business rule violation standardized

## G. Architecture
- [ ] route/controller → service → repository pattern established
- [ ] critical business rules not placed in UI
- [ ] no B2B logic added
- [ ] no Active Aging global gate added
- [ ] no Agreement mutation mechanism added
- [ ] legacy code not deleted

## H. Tests
- [ ] existing suite passes
- [ ] foundation tests pass
- [ ] migration test passes
- [ ] ID test passes
- [ ] audit test passes
- [ ] validation/error test passes
- [ ] startup/config test passes

## RELEASE DECISION

**READY:** all mandatory checks pass and no unresolved architecture conflict exists.

**NOT READY:** any critical check fails or an unresolved architectural decision remains.
