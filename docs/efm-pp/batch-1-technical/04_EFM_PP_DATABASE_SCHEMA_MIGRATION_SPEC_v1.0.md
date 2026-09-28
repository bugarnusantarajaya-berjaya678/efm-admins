# EFM PP — Database Schema & Migration Specification v1.0

## Logical entities
leads, clients, programs, offerings, packages, package_prices, orders, invoices, payments, receipts, participants/order_participants, agreements, hns, assessments, pics, assignments, sessions, attendance, audit_events and required snapshot/version metadata.

## Relationships
program → offerings → packages → package_prices
package → orders
order → invoice(s)
invoice → payments
confirmed payment → receipt
order → participants
order → agreement
participant → H&S
participant → assessments
order → assignment → PIC
assignment → sessions → attendance

## Historical integrity
- Order commercial snapshot survives catalog changes.
- Signed Agreement is immutable.
- Participant changes are append-only history.
- Audit events are append-only.
- Renewal creates a new Order.

## Migration rules
1. Never alter production data blindly.
2. Use reversible migrations where feasible.
3. Back up before destructive migration.
4. Separate schema migration from historical-data migration.
5. Legacy migration requires a separate mapping specification.
6. Never invent missing business facts.
7. Preserve legacy IDs as references when needed.

Exact SQL/NoSQL physical types must follow the existing backend stack; this document defines logical schema.
