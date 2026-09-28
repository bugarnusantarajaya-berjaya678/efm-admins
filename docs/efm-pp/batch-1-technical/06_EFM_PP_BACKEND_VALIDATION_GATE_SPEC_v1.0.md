# EFM PP — Backend Validation & Gate Specification v1.0

## Gate 01 — Catalog
Program, Offering, Package and valid Package Price must exist.

## Gate 02 — Order
Valid client/lead context, catalog selection, participant format and commercial snapshot.

## Gate 03 — Payment
Valid Invoice, Order, amount/reference and authorized confirmation actor.

## Gate 04 — Receipt
Payment must be confirmed and receipt must match payment facts.

## Gate 05 — Agreement
Valid Order, frozen commercial snapshot, module/rules version and required references.

## Gate 06 — H&S
Required only when module/order rules require it. H&S is not medical clearance.

## Gate 07 — Participant
Valid identity/status, module requirements and auditable changes.

## Gate 08 — Assignment
Capability, service, format, delivery, coverage, availability, contract and capacity.

Failure codes:
CAPABILITY_MISMATCH
SERVICE_MISMATCH
FORMAT_MISMATCH
DELIVERY_MISMATCH
COVERAGE_MISMATCH
AVAILABILITY_CONFLICT
CONTRACT_INVALID
CAPACITY_FULL

## Gate 09 — Program Ready
ORDER_VALID AND AGREEMENT_GATE_PASS AND REQUIRED_HNS_PASS AND PARTICIPANT_REQUIREMENTS_PASS AND ASSIGNMENT_ACTIVE AND CAPACITY_VALID AND MODULE_GATES_PASS.

## Gate 10 — Session
Valid Order + active Assignment + eligible participant + valid schedule.

## Gate 11 — Attendance
Valid Session + eligible participant + authorized actor.

## Gate 12 — Completion
Derived from required delivered sessions and applicable module rules.

## Exception protocol
No silent bypass. Record gate, reason, actor, timestamp, approval when required and resulting state.

## Active Aging boundary
Active Aging-specific screening, health, companion, medical-referral and other rules remain module-scoped and must not become universal PP gates.
