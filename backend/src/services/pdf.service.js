/**
 * PDF Generation Service — Phase 3.
 *
 * Uses pdfkit to generate invoice, receipt, and agreement PDFs.
 * All generation happens server-side; no browser or headless Chrome required.
 * Returns a Buffer that can be uploaded to Supabase Storage.
 */

import PDFDocument from 'pdfkit'

const BRAND = {
  navy: '#1E1C43',
  orange: '#E05945',
  gray: '#6C757D',
  lightGray: '#F5F5F7',
  black: '#1A1A1A',
  white: '#FFFFFF',
}

const COMPANY = {
  name: 'Essential Fitness Management (EFM)',
  address: 'Jakarta, Indonesia',
  email: 'admin@efm.id',
  tagline: 'Professional Fitness Management',
}

/** Helper: stream a PDFDocument to a Buffer. */
function buildBuffer(buildFn) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    try {
      buildFn(doc)
      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── Invoice PDF ──────────────────────────────────────────────────────────────

/**
 * Generate an invoice PDF.
 * @param {object} data
 * @param {string} data.id            - invoice ID (INV-PP-YY-xxxx)
 * @param {string} data.orderId       - order ID (#PP-YY-xxxx)
 * @param {string} data.clientName
 * @param {string} data.packageName
 * @param {number} data.sessionsTotal
 * @param {number} data.unitPrice     - price per session
 * @param {number} data.finalAmount
 * @param {string} data.issuedDate
 * @param {string} data.dueDate
 * @param {string} data.status
 * @param {string} [data.notes]
 * @returns {Promise<Buffer>}
 */
export async function generateInvoicePdf(data) {
  return buildBuffer((doc) => {
    // Header block
    doc.rect(0, 0, doc.page.width, 100).fill(BRAND.navy)
    doc.fillColor(BRAND.white).fontSize(28).font('Helvetica-Bold')
       .text('INVOICE', 50, 30, { align: 'left' })
    doc.fontSize(10).font('Helvetica')
       .text(COMPANY.name, 50, 65)
       .text(COMPANY.email, 50, 78)

    doc.fillColor(BRAND.white).fontSize(11).font('Helvetica-Bold')
       .text(data.id, doc.page.width - 200, 30, { align: 'right', width: 150 })
    doc.fontSize(9).font('Helvetica')
       .text(`Tanggal: ${formatDate(data.issuedDate)}`, doc.page.width - 200, 50, { align: 'right', width: 150 })
       .text(`Jatuh Tempo: ${formatDate(data.dueDate)}`, doc.page.width - 200, 63, { align: 'right', width: 150 })
       .text(`Order: #${data.orderId}`, doc.page.width - 200, 76, { align: 'right', width: 150 })

    // Tagihan Kepada
    doc.fillColor(BRAND.black).moveDown(2)
    doc.fontSize(10).font('Helvetica-Bold').fillColor(BRAND.navy)
       .text('TAGIHAN KEPADA:', 50, 120)
    doc.fontSize(12).font('Helvetica-Bold').fillColor(BRAND.black)
       .text(data.clientName, 50, 136)
    doc.fontSize(10).font('Helvetica').fillColor(BRAND.gray)
       .text(`Program: ${data.packageName}`, 50, 152)

    // Status badge
    const statusColor = data.status === 'PAID' ? '#15803D' : data.status === 'OVERDUE' ? '#DC2626' : '#D97706'
    doc.roundedRect(doc.page.width - 150, 120, 100, 24, 4).fill(statusColor)
    doc.fillColor(BRAND.white).fontSize(10).font('Helvetica-Bold')
       .text(data.status, doc.page.width - 150, 127, { width: 100, align: 'center' })

    // Rincian line
    const tableTop = 195
    doc.rect(50, tableTop, doc.page.width - 100, 24).fill(BRAND.navy)
    doc.fillColor(BRAND.white).fontSize(9).font('Helvetica-Bold')
       .text('DESKRIPSI', 60, tableTop + 7)
       .text('SESI', 300, tableTop + 7)
       .text('HARGA/SESI', 380, tableTop + 7)
       .text('TOTAL', doc.page.width - 150, tableTop + 7, { width: 100, align: 'right' })

    const rowY = tableTop + 28
    doc.rect(50, rowY, doc.page.width - 100, 28).fill('#F8F8FC')
    doc.fillColor(BRAND.black).fontSize(10).font('Helvetica')
       .text(data.packageName, 60, rowY + 8)
       .text(String(data.sessionsTotal), 300, rowY + 8)
       .text(formatRupiah(data.unitPrice), 380, rowY + 8)
       .text(formatRupiah(data.finalAmount), doc.page.width - 150, rowY + 8, { width: 100, align: 'right' })

    // Total box
    const totalY = rowY + 50
    doc.rect(doc.page.width - 250, totalY, 200, 40).fill(BRAND.navy)
    doc.fillColor(BRAND.white).fontSize(10).font('Helvetica-Bold')
       .text('TOTAL TAGIHAN', doc.page.width - 250, totalY + 6, { width: 200, align: 'center' })
    doc.fontSize(14).fillColor(BRAND.orange)
       .text(formatRupiah(data.finalAmount), doc.page.width - 250, totalY + 20, { width: 200, align: 'center' })

    // Notes
    if (data.notes) {
      doc.fillColor(BRAND.black).fontSize(9).font('Helvetica-Bold')
         .text('Catatan:', 50, totalY + 60)
      doc.font('Helvetica').fillColor(BRAND.gray)
         .text(data.notes, 50, totalY + 74, { width: 400 })
    }

    // Footer
    doc.fillColor(BRAND.gray).fontSize(8)
       .text('Dokumen ini digenerate oleh sistem EFM V2', 50, doc.page.height - 60, {
         align: 'center', width: doc.page.width - 100,
       })
  })
}

// ─── Receipt PDF ──────────────────────────────────────────────────────────────

/**
 * Generate a receipt PDF.
 * @param {object} data
 * @param {string} data.id            - receipt ID (RCP-PP-YY-xxxx)
 * @param {string} data.orderId
 * @param {string} data.invoiceId
 * @param {string} data.clientName
 * @param {string} data.packageName
 * @param {number} data.amount
 * @param {string} data.issuedDate
 * @param {string} data.paymentMethod
 * @param {string} [data.notes]
 * @returns {Promise<Buffer>}
 */
export async function generateReceiptPdf(data) {
  return buildBuffer((doc) => {
    // Header
    doc.rect(0, 0, doc.page.width, 100).fill(BRAND.navy)
    doc.fillColor(BRAND.white).fontSize(28).font('Helvetica-Bold')
       .text('KWITANSI', 50, 30)
    doc.fontSize(10).font('Helvetica')
       .text(COMPANY.name, 50, 65)
       .text(COMPANY.email, 50, 78)

    doc.fillColor(BRAND.white).fontSize(11).font('Helvetica-Bold')
       .text(data.id, doc.page.width - 200, 30, { align: 'right', width: 150 })
    doc.fontSize(9).font('Helvetica')
       .text(`Tanggal: ${formatDate(data.issuedDate)}`, doc.page.width - 200, 50, { align: 'right', width: 150 })
       .text(`Invoice: ${data.invoiceId}`, doc.page.width - 200, 63, { align: 'right', width: 150 })

    // Receipt details
    const details = [
      { label: 'Diterima Dari', value: data.clientName },
      { label: 'Program', value: data.packageName },
      { label: 'Order ID', value: `#${data.orderId}` },
      { label: 'Metode Pembayaran', value: data.paymentMethod },
    ]

    let y = 130
    for (const { label, value } of details) {
      doc.rect(50, y, 200, 28).fill('#F8F8FC')
      doc.rect(250, y, doc.page.width - 300, 28).fill(BRAND.white)
      doc.fillColor(BRAND.gray).fontSize(9).font('Helvetica-Bold')
         .text(label, 60, y + 8)
      doc.fillColor(BRAND.black).font('Helvetica')
         .text(value, 260, y + 8)
      doc.rect(50, y, doc.page.width - 100, 28).stroke('#E2E6EA')
      y += 28
    }

    // Amount
    const amtY = y + 20
    doc.rect(50, amtY, doc.page.width - 100, 50).fill(BRAND.navy)
    doc.fillColor(BRAND.white).fontSize(12).font('Helvetica-Bold')
       .text('JUMLAH PEMBAYARAN', 60, amtY + 8)
    doc.fontSize(18).fillColor(BRAND.orange)
       .text(formatRupiah(data.amount), 60, amtY + 24)

    // Stamp / Verified
    doc.roundedRect(doc.page.width - 180, amtY - 10, 120, 70, 6).stroke(BRAND.orange)
    doc.fillColor(BRAND.orange).fontSize(9).font('Helvetica-Bold')
       .text('LUNAS', doc.page.width - 180, amtY + 20, { width: 120, align: 'center' })
    doc.fillColor(BRAND.gray).fontSize(8).font('Helvetica')
       .text(formatDate(data.issuedDate), doc.page.width - 180, amtY + 34, { width: 120, align: 'center' })

    if (data.notes) {
      doc.fillColor(BRAND.black).fontSize(9).font('Helvetica-Bold')
         .text('Catatan:', 50, amtY + 80)
      doc.font('Helvetica').fillColor(BRAND.gray)
         .text(data.notes, 50, amtY + 94, { width: 400 })
    }

    doc.fillColor(BRAND.gray).fontSize(8)
       .text('Dokumen ini digenerate oleh sistem EFM V2', 50, doc.page.height - 60, {
         align: 'center', width: doc.page.width - 100,
       })
  })
}

// ─── Agreement PDF ────────────────────────────────────────────────────────────

/**
 * Generate an agreement PDF.
 * @param {object} data
 * @param {string} data.id            - agreement ID (AGR-PP-YY-xxxx)
 * @param {string} data.orderId
 * @param {string} data.clientName
 * @param {string} data.packageName
 * @param {number} data.sessionsTotal
 * @param {number} data.finalAmount
 * @param {string} data.contentBody   - agreement text (Markdown-like plain text)
 * @param {string} [data.signedByName]
 * @param {string} [data.signedAt]
 * @param {string} [data.signatureData] - base64 PNG
 * @returns {Promise<Buffer>}
 */
export async function generateAgreementPdf(data) {
  return buildBuffer((doc) => {
    // Header
    doc.rect(0, 0, doc.page.width, 80).fill(BRAND.navy)
    doc.fillColor(BRAND.white).fontSize(20).font('Helvetica-Bold')
       .text('PERJANJIAN LAYANAN', 50, 22, { align: 'center', width: doc.page.width - 100 })
    doc.fontSize(10).font('Helvetica')
       .text(COMPANY.name, 50, 48, { align: 'center', width: doc.page.width - 100 })

    // Parties
    doc.fillColor(BRAND.black).fontSize(11).font('Helvetica-Bold')
       .text('PIHAK-PIHAK:', 50, 105)
    doc.fontSize(10).font('Helvetica')
       .text(`Penyedia Jasa: ${COMPANY.name}`, 50, 122)
       .text(`Penerima Layanan: ${data.clientName}`, 50, 137)

    // Order details
    doc.fillColor(BRAND.navy).fontSize(11).font('Helvetica-Bold')
       .text('DETAIL LAYANAN:', 50, 165)
    const orderDetails = [
      ['Order ID', `#${data.orderId}`],
      ['Program', data.packageName],
      ['Jumlah Sesi', String(data.sessionsTotal)],
      ['Total Biaya', formatRupiah(data.finalAmount)],
      ['Nomor Perjanjian', data.id],
    ]
    let y = 182
    for (const [label, value] of orderDetails) {
      doc.rect(50, y, 180, 22).fill('#F8F8FC')
      doc.rect(230, y, doc.page.width - 280, 22).fill(BRAND.white)
      doc.fillColor(BRAND.gray).fontSize(9).font('Helvetica')
         .text(label, 58, y + 6)
      doc.fillColor(BRAND.black).font('Helvetica-Bold')
         .text(value, 238, y + 6)
      y += 22
    }

    // Content body
    doc.fillColor(BRAND.navy).fontSize(11).font('Helvetica-Bold')
       .text('ISI PERJANJIAN:', 50, y + 16)
    doc.fillColor(BRAND.black).fontSize(9).font('Helvetica')
       .text(data.contentBody ?? 'Perjanjian ini berlaku sesuai ketentuan yang ditetapkan EFM.', 50, y + 34, {
         width: doc.page.width - 100,
         lineGap: 2,
       })

    // Signature section
    const sigY = doc.page.height - 160
    doc.moveTo(50, sigY).lineTo(doc.page.width - 50, sigY).stroke('#E2E6EA')

    if (data.signedAt && data.signedByName) {
      doc.fillColor(BRAND.gray).fontSize(9).font('Helvetica')
         .text(`Ditandatangani secara digital oleh: ${data.signedByName}`, 50, sigY + 12)
         .text(`Tanggal: ${formatDate(data.signedAt)}`, 50, sigY + 26)

      if (data.signatureData) {
        const sigImg = Buffer.from(data.signatureData.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        try {
          doc.image(sigImg, doc.page.width - 220, sigY + 8, { width: 160, height: 60 })
        } catch {
          // If image rendering fails, just show text
        }
      }
      doc.rect(doc.page.width - 240, sigY + 6, 190, 72).stroke('#E2E6EA')
      doc.fillColor(BRAND.gray).fontSize(8).font('Helvetica')
         .text('Tanda Tangan Digital', doc.page.width - 240, sigY + 80, { width: 190, align: 'center' })
    } else {
      // Blank signature blocks
      doc.fillColor(BRAND.gray).fontSize(9).font('Helvetica')
         .text('Penyedia Jasa', 80, sigY + 12)
         .text('Penerima Layanan', doc.page.width - 220, sigY + 12)
      doc.rect(60, sigY + 28, 160, 60).stroke('#E2E6EA')
      doc.rect(doc.page.width - 240, sigY + 28, 160, 60).stroke('#E2E6EA')
    }

    doc.fillColor(BRAND.gray).fontSize(8)
       .text('Dokumen ini digenerate oleh sistem EFM V2', 50, doc.page.height - 30, {
         align: 'center', width: doc.page.width - 100,
       })
  })
}
