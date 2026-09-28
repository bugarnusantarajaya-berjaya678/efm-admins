# EFM PP — PHASE 1 FOUNDATION CODING SPECIFICATION v1.0

## Objective
Build the technical foundation required by later PP modules without implementing commercial or operational business flows.

## Build Scope

### Application Foundation
- backend configuration
- environment configuration
- module structure
- shared error handling
- request/correlation ID
- logging baseline

### Database Foundation
- database connection/configuration
- migration mechanism
- base migration
- timestamp conventions
- transaction handling

### ID Foundation
Create one authoritative ID-generation mechanism suitable for:
- Order
- Invoice
- Receipt
- Agreement
- H&S
- Assessment
- Assignment
- Session
- Attendance

### Audit Foundation
Minimum conceptual fields:
- id
- eventType
- entityType
- entityId
- actorId
- timestamp
- metadata
- requestId

### Validation Foundation
Standard categories:
- VALIDATION_ERROR
- NOT_FOUND
- CONFLICT
- UNAUTHORIZED
- FORBIDDEN
- INTERNAL_ERROR
- BUSINESS_RULE_VIOLATION

### Service Architecture
Use:
route/controller → service → repository/data access → database

## Explicitly Out of Phase 1
- Order workflow
- Payment workflow
- Agreement signing workflow
- Assignment eligibility
- Program Ready calculation
- Session workflow
- Attendance workflow
- Active Aging screening workflow
- B2B workflows

## Acceptance
Phase 1 passes only if:
1. application starts cleanly
2. environment configuration works
3. database connection works
4. migration works
5. ID generation works
6. audit event persists
7. validation/error response works
8. request/correlation ID is traceable
9. tests pass
10. no unrelated business logic is introduced

**No destructive migration.**
