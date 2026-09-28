# EFM PP — API Endpoint Specification v1.0

## Catalog
GET /api/pp/programs
GET /api/pp/programs/:programId
GET /api/pp/offerings
GET /api/pp/packages
GET /api/pp/packages/:packageId
GET /api/pp/prices

## Lead / Client
POST /api/pp/leads
GET /api/pp/leads/:leadId
POST /api/pp/clients
GET /api/pp/clients/:clientId

## Order
POST /api/pp/orders
GET /api/pp/orders/:orderId
PATCH /api/pp/orders/:orderId
GET /api/pp/orders/:orderId/history
POST /api/pp/orders/:orderId/participants
PATCH /api/pp/orders/:orderId/participants/:participantId
DELETE /api/pp/orders/:orderId/participants/:participantId

## Billing
POST /api/pp/orders/:orderId/invoice
GET /api/pp/invoices/:invoiceId
POST /api/pp/invoices/:invoiceId/payments
POST /api/pp/payments/:paymentId/confirm
GET /api/pp/invoices/:invoiceId/receipt

## Agreement / H&S
POST /api/pp/orders/:orderId/agreement
GET /api/pp/agreements/:agreementId
POST /api/pp/agreements/:agreementId/sign
POST /api/pp/participants/:participantId/hns
GET /api/pp/participants/:participantId/hns

## Assessment
POST /api/pp/participants/:participantId/assessments
GET /api/pp/participants/:participantId/assessments
GET /api/pp/assessments/:assessmentId

## Operations
POST /api/pp/orders/:orderId/assignment
GET /api/pp/orders/:orderId/assignment
GET /api/pp/orders/:orderId/program-ready
POST /api/pp/orders/:orderId/sessions
GET /api/pp/orders/:orderId/sessions
POST /api/pp/sessions/:sessionId/attendance

All writes must pass service-layer validation. URL naming may adapt to the existing backend convention without changing semantic boundaries.
