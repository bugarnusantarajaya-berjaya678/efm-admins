# EFM PP — CLAUDE CODE PHASE 1 EXECUTION INSTRUCTION v1.0

## Mission
Implement only EFM PP Phase 1 Foundation.

## STEP 1 — INSPECT, DO NOT CODE
Inspect:
1. repository structure
2. framework/runtime
3. database
4. ORM/query layer
5. migration mechanism
6. authentication/authorization
7. API routing convention
8. test framework
9. environment/configuration
10. existing EFM modules/shared services
11. legacy PP code that must not be deleted

Return an architecture map before implementation.

## STEP 2 — RECONCILE
Compare the discovered codebase against:
- Final Backend Pre-Coding Lock
- Phase 1 Foundation Coding Specification
- Technical Build Specification
- Batch 1 technical documents

Do not invent missing business rules.

## STEP 3 — IMPLEMENT
Implement only:
- configuration baseline
- database connection
- migration baseline
- ID infrastructure
- audit infrastructure
- validation/error infrastructure
- request/correlation ID
- repository/service conventions
- tests

## STEP 4 — TEST
Run existing tests first where available, then Phase 1 tests.

Report:
- passed
- failed
- skipped
- warnings

## FORBIDDEN
- rewrite unrelated modules
- redesign PP business logic
- add B2B transaction logic
- add Active Aging global rules
- change Agreement legal logic
- change pricing
- change existing IDs without migration decision
- delete legacy code
- destructive migration
- hardcode secrets

## STOP CONDITIONS
Stop and report if:
- existing architecture conflicts with the lock
- migration may alter production data
- database differs from the expected architecture
- a business rule must be invented
- shared services would break
- an ID conflict exists
- a destructive change appears necessary

## FINAL REPORT
Provide:
1. architecture discovered
2. files added
3. files changed
4. files deliberately untouched
5. database/migration changes
6. API/infrastructure changes
7. tests/results
8. risks
9. open decisions
10. PHASE 1 FOUNDATION READY / NOT READY
