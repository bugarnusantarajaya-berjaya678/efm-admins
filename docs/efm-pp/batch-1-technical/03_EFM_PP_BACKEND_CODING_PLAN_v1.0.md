# EFM PP — Backend Coding Plan v1.0

## Phase 1 — Foundation
Database connection/config, migrations, IDs, timestamps, audit infrastructure, repositories, common errors and validation framework.

## Phase 2 — Commercial Core
Program, Offering, Package, PackagePrice, Lead, Client, Order, Invoice, Payment, Receipt.

## Phase 3 — Contract & Safety
Agreement, immutable snapshot/versioning, H&S, signature metadata.

## Phase 4 — Participant & Assessment
Participant roster, participant change history, Assessment and screening references.

## Phase 5 — Operations
PIC reference, Assignment, Program Ready, Session, Attendance.

## Phase 6 — UI/API Integration
API routes, forms, dashboards, document generation integration and validation feedback.

## Phase 7 — QA
Unit, service, API, integration, end-to-end and regression tests.

**Rule:** no phase may silently introduce another business module's rules.
