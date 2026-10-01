/**
 * Agreement Service — Phase 3.
 *
 * Agreement lifecycle: draft → issued → signed | voided
 *
 * Immutability rules (DEC-05):
 *  - Content (content_body) can only be changed in 'draft' status.
 *  - Transition draft → issued: generates PDF, freezes content, sets issued_at.
 *  - Transition issued → signed: records signature data + signer info.
 *  - Transition * → voided: only from 'draft' or 'issued' (not signed).
 *  - Signed agreements are permanently immutable — no further transitions.
 */

import { withTransaction } from '../../db/index.js'
import { recordAuditEvent, AuditEventType, EntityType } from '../audit/audit.service.js'
import { validationError, notFound, conflict, forbidden } from '../../shared/errors.js'
import { findOrderById, findSnapshotByOrderId } from '../order/order.repository.js'
import { findInvoiceByOrderId } from '../invoice/invoice.repository.js'
import { findClientById } from '../client/client.repository.js'
import { nextId, DOCTYPE, MODULE } from '../id/id.generator.js'
import { assertAgreementMutable, AGREEMENT_STATUS } from './agreement.guard.js'
import {
  findAgreementById, findAgreementByOrderId,
  insertAgreement, updateAgreementContent, updateAgreementStatus,
  findAllAgreements,
} from './agreement.repository.js'
import { generateAgreementPdf } from '../../services/pdf.service.js'
import { uploadFile, replaceFile, getSignedUrl, deleteFile } from '../../services/storage.service.js'

const BUCKET = 'agreements'
const SIGNATURE_MAX_BYTES = 200 * 1024 // 200 KB

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listAgreements(filters = {}) {
  return findAllAgreements(filters)
}

export async function getAgreement(id) {
  const ag = await findAgreementById(id)
  if (!ag) throw notFound('Agreement', id)
  return enrichWithSignedUrl(ag)
}

export async function getAgreementByOrder(orderId) {
  const ag = await findAgreementByOrderId(orderId)
  if (!ag) throw notFound('Agreement for order', orderId)
  return enrichWithSignedUrl(ag)
}

async function enrichWithSignedUrl(ag) {
  if (!ag.pdf_path) return ag
  try {
    const pdfUrl = await getSignedUrl(BUCKET, ag.pdf_path, 3600)
    return { ...ag, pdf_url: pdfUrl }
  } catch {
    // Storage not configured in dev/test — return without URL
    return ag
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAgreement({ orderId, contentBody } = {}, requestId) {
  if (!orderId) throw validationError('orderId is required')

  const order = await findOrderById(orderId)
  if (!order) throw notFound('Order', orderId)

  const existing = await findAgreementByOrderId(orderId)
  if (existing) throw conflict(`An agreement already exists for order ${orderId} (${existing.id})`)

  // Gather commercial snapshot from invoice (must exist)
  const invoice = await findInvoiceByOrderId(orderId)
  if (!invoice) throw conflict(`No invoice found for order ${orderId} — create invoice before agreement`)

  // Look up client for name/email
  const clientRec = await findClientById(order.client_id)
  const clientName = clientRec?.full_name ?? order.client_id
  const clientEmail = clientRec?.email ?? null

  // Get package name from commercial snapshot
  const snapshot = await findSnapshotByOrderId(orderId)
  const packageName = snapshot?.package_name ?? order.package_id

  return withTransaction(async (client) => {
    const id = await nextId(DOCTYPE.AGREEMENT, MODULE.PP, { client })
    const ag = await insertAgreement({
      id,
      orderId,
      clientName,
      clientEmail,
      packageName,
      sessionsTotal: order.sessions_total,
      finalAmount: parseFloat(invoice.final_amount),
      contentBody: contentBody ?? defaultAgreementBody({ ...order, client_name: clientName }),
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.AGREEMENT_ISSUED,
      entityType: EntityType.AGREEMENT,
      entityId: id,
      actorId: requestId,
      metadata: { orderId, status: 'draft' },
      requestId,
      client,
    })
    return ag
  })
}

function defaultAgreementBody(order) {
  return [
    `PERJANJIAN LAYANAN PELATIHAN KEBUGARAN`,
    ``,
    `Perjanjian ini dibuat antara Essential Fitness Management (EFM) selaku`,
    `Penyedia Jasa, dan ${order.client_name} selaku Penerima Layanan.`,
    ``,
    `1. RUANG LINGKUP LAYANAN`,
    `   Penyedia Jasa akan memberikan layanan pelatihan kebugaran sesuai paket`,
    `   yang dipilih, sebagaimana tertera pada Order ID terkait.`,
    ``,
    `2. KETENTUAN PEMBAYARAN`,
    `   Pembayaran penuh wajib dilakukan sebelum program dimulai.`,
    `   Biaya yang telah dibayarkan tidak dapat dikembalikan kecuali atas`,
    `   pertimbangan khusus yang disetujui oleh manajemen EFM.`,
    ``,
    `3. KEWAJIBAN PENERIMA LAYANAN`,
    `   Penerima Layanan wajib memberikan informasi kesehatan yang akurat dan`,
    `   mengikuti instruksi pelatih selama sesi berlangsung.`,
    ``,
    `4. PEMBATALAN`,
    `   Pembatalan sesi dapat dilakukan minimal 24 jam sebelum jadwal.`,
    ``,
    `5. KETENTUAN LAIN`,
    `   Perjanjian ini tunduk pada hukum yang berlaku di Republik Indonesia.`,
  ].join('\n')
}

// ─── Update Content ───────────────────────────────────────────────────────────

export async function updateAgreement(id, { contentBody }, requestId) {
  const ag = await findAgreementById(id)
  if (!ag) throw notFound('Agreement', id)
  assertAgreementMutable(ag, 'content_body')

  const updated = await updateAgreementContent({ id, contentBody }, null)
  await recordAuditEvent({
    eventType: AuditEventType.UPDATED,
    entityType: EntityType.AGREEMENT,
    entityId: id,
    metadata: { field: 'content_body' },
    requestId,
  })
  return updated
}

// ─── Issue ────────────────────────────────────────────────────────────────────

export async function issueAgreement(id, requestId) {
  const ag = await findAgreementById(id)
  if (!ag) throw notFound('Agreement', id)

  if (ag.status !== AGREEMENT_STATUS.DRAFT) {
    throw conflict(`Agreement ${id} is already in status '${ag.status}'`)
  }

  // Generate PDF
  const pdfBuffer = await generateAgreementPdf({
    id: ag.id,
    orderId: ag.order_id,
    clientName: ag.client_name,
    packageName: ag.package_name,
    sessionsTotal: ag.sessions_total,
    finalAmount: parseFloat(ag.final_amount),
    contentBody: ag.content_body,
  })

  const pdfPath = `${ag.order_id}/${ag.id}.pdf`

  return withTransaction(async (client) => {
    // Upload PDF — try, but don't fail the transaction if storage is not configured
    let storedPath = null
    try {
      storedPath = await uploadFile(BUCKET, pdfPath, pdfBuffer, 'application/pdf')
    } catch (err) {
      console.warn(`[agreement] PDF upload skipped (storage not configured): ${err.message}`)
    }

    const updated = await updateAgreementStatus(id, AGREEMENT_STATUS.ISSUED, {
      issuedAt: new Date().toISOString(),
      pdfPath: storedPath,
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.AGREEMENT_ISSUED,
      entityType: EntityType.AGREEMENT,
      entityId: id,
      metadata: { orderId: ag.order_id, pdfPath: storedPath },
      requestId,
      client,
    })
    return updated
  })
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

export async function signAgreement(id, { signedByName, signatureData, clientIp, clientUa } = {}, requestId) {
  if (!signedByName?.trim()) throw validationError('signedByName is required')

  const ag = await findAgreementById(id)
  if (!ag) throw notFound('Agreement', id)

  if (ag.status !== AGREEMENT_STATUS.ISSUED) {
    throw conflict(`Agreement ${id} must be in 'issued' status to sign (current: '${ag.status}')`)
  }

  // Validate signature size if provided
  if (signatureData) {
    const raw = signatureData.replace(/^data:image\/\w+;base64,/, '')
    const bytes = Buffer.byteLength(raw, 'base64')
    if (bytes > SIGNATURE_MAX_BYTES) {
      throw validationError(`Signature data too large (${bytes} bytes, max ${SIGNATURE_MAX_BYTES})`)
    }
  }

  // Regenerate PDF with signature data
  const pdfBuffer = await generateAgreementPdf({
    id: ag.id,
    orderId: ag.order_id,
    clientName: ag.client_name,
    packageName: ag.package_name,
    sessionsTotal: ag.sessions_total,
    finalAmount: parseFloat(ag.final_amount),
    contentBody: ag.content_body,
    signedByName,
    signedAt: new Date().toISOString(),
    signatureData,
  })

  return withTransaction(async (client) => {
    // Replace PDF with signed version
    if (ag.pdf_path) {
      try {
        await replaceFile(BUCKET, ag.pdf_path, pdfBuffer, 'application/pdf')
      } catch (err) {
        console.warn(`[agreement] Signed PDF upload skipped: ${err.message}`)
      }
    }

    const updated = await updateAgreementStatus(id, AGREEMENT_STATUS.SIGNED, {
      signedAt: new Date().toISOString(),
      signedByName,
      signedByIp: clientIp ?? null,
      signedByUa: clientUa ?? null,
      signatureData: signatureData ?? null,
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.AGREEMENT_SIGNED,
      entityType: EntityType.AGREEMENT,
      entityId: id,
      actorId: requestId,
      metadata: {
        orderId: ag.order_id,
        signedByName,
        signedByIp: clientIp ?? null,
      },
      requestId,
      client,
    })
    return updated
  })
}

// ─── Void ─────────────────────────────────────────────────────────────────────

export async function voidAgreement(id, { voidedBy, voidReason } = {}, requestId) {
  const ag = await findAgreementById(id)
  if (!ag) throw notFound('Agreement', id)

  if (ag.status === AGREEMENT_STATUS.SIGNED) {
    throw forbidden('A signed agreement cannot be voided')
  }
  if (ag.status === AGREEMENT_STATUS.VOIDED) {
    throw conflict(`Agreement ${id} is already voided`)
  }

  return withTransaction(async (client) => {
    const updated = await updateAgreementStatus(id, AGREEMENT_STATUS.VOIDED, {
      voidedAt: new Date().toISOString(),
      voidedBy: voidedBy ?? 'system',
      voidReason: voidReason ?? '',
    }, client)

    await recordAuditEvent({
      eventType: AuditEventType.STATUS_CHANGED,
      entityType: EntityType.AGREEMENT,
      entityId: id,
      metadata: { from: ag.status, to: 'voided', voidReason },
      requestId,
      client,
    })
    return updated
  })
}
