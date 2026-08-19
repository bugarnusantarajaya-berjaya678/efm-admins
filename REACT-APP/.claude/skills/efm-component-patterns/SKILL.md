---
name: efm-component-patterns
description: Reusable, battle-tested UI component patterns for the EFM V2 (Essential Fitness Management) React admin dashboard project — covers the scrollable-body modal, photo preview popup, full invoice template structure, filterable activity log, and pipeline/stage progress visual. MUST be checked before building any modal, image preview, invoice page, activity/history log, or leads pipeline visual in this project — these patterns have been built multiple times before, so reuse them exactly rather than reinventing a new structure. Always consult this skill even if the request only vaguely resembles one of these patterns (e.g. "add a popup", "show a log of changes", "add a status stepper"), since inconsistent reimplementation of these patterns is a recurring issue in this project.
---

# EFM V2 Component Patterns

Complex, recurring UI patterns for the EFM V2 project. Use these exact structures instead of designing new ones. Pairs with `efm-design-standards` (colors/fonts/sizes) and `efm-prompt-pattern` (workflow discipline) — check all three when relevant.

## 1. Modal with Scrollable Body

Used for: any detail modal where content may be long (leads detail, incident report detail, activity log detail, etc.)

```jsx
<div
  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  onClick={onClose}
>
  <div
    className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header - fixed, never scrolls */}
    <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
      <h3 className="text-base font-bold text-[#1E1C43]">Title</h3>
      <button onClick={onClose}><X size={20} /></button>
    </div>

    {/* Body - scrollable */}
    <div className="overflow-y-auto flex-1 p-4">
      {/* content here */}
    </div>

    {/* Footer - fixed, only if modal has action buttons */}
    <div className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-end gap-2">
      <button>Batal</button>
      <button>Simpan</button>
    </div>
  </div>
</div>
```

**Rules**
- `max-w-md` is default; use `max-w-lg` or `max-w-2xl` for wider content (e.g. modals containing tables)
- `max-h-[90vh]` must never be removed — without it, tall content pushes the modal off-screen
- Clicking the outer overlay closes the modal; `e.stopPropagation()` on the inner container prevents accidental close when clicking inside
- Close via X button always in header, top-right

---

## 2. Photo Preview Popup

Used for: enlarging thumbnail photos (incident report photos, visit report photos, document scans). Separate from the modal pattern above — specifically for images.

**State (in parent component)**
```js
const [previewFoto, setPreviewFoto] = useState(null)
// shape: { src: string, nama: string, dariNomor?: string } | null
```

**Trigger (thumbnail click)**
```jsx
<img
  src={foto.src}
  onClick={() => setPreviewFoto(foto)}
  className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
/>
```

**Popup render (conditional, at root level of component)**
```jsx
{previewFoto && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
    onClick={() => setPreviewFoto(null)}
  >
    <div className="relative max-w-3xl max-h-[90vh]">
      <img
        src={previewFoto.src}
        alt={previewFoto.nama}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={() => setPreviewFoto(null)}
        className="absolute top-2 right-2 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
      >
        <X size={20} />
      </button>
      {previewFoto.nama && (
        <p className="text-white text-sm text-center mt-2">{previewFoto.nama}</p>
      )}
    </div>
  </div>
)}
```

**Rules**
- Always `z-[60]`, higher than the standard modal's `z-50`, since photo preview often opens from within a modal
- Click anywhere outside the image closes it; click ON the image does NOT close it (`stopPropagation`)
- Keep `previewFoto` as separate state — never nest it inside the underlying modal's own state, so it persists correctly even if the modal changes

---

## 3. Invoice Template Structure

Used for: full invoice pages (PPInvoicePage, B2BInvoicePage, EventInvoicePage) — the complete document layout.

**Structure (top to bottom)**

1. **Header bar** (page-level, not part of the document) — breadcrumb (e.g. "PP > Invoice"), title "Invoice #INV-PP-26-0011", subtitle (program/module + client name), action row: Edit Invoice | Download PDF | Konfirmasi Pembayaran (or status-appropriate action)

2. **Document header** (navy card): `bg-[#1E1C43] rounded-xl p-6 text-white grid grid-cols-2`
   - Left: EFM logo + company name + address + email
   - Right: "INVOICE" in `text-4xl font-black`, invoice number, Tanggal, Jatuh Tempo, Order ID (`#` prefix), status badge — use lighter variants on the dark bg for contrast (e.g. `bg-yellow-400 text-yellow-900`)

3. **Tagihan Kepada** (billing info) — client/company name (`text-lg font-bold`); B2B adds NPWP + PIC name/jabatan; PP shows client name + program name; Order ID reference

4. **Rincian Layanan** (line items table), columns vary by module:
   - PP: Deskripsi | Harga Per Sesi | Jumlah Sesi | Harga Paket | Diskon Paket | Total
   - B2B/Event: Deskripsi | Jumlah | Satuan | Harga Satuan | Total
   - Plain table, no heavy styling, `border-b` between rows

5. **Kalkulasi** (calculation section)
   - Subtotal
   - Kode Diskon (PP only — input + apply button in edit mode, shows applied discount name/amount in read mode)
   - Management Fee toggle (B2B only — percentage input)
   - Custom Pajak list (B2B only — add/remove rows, each with name, percentage, +/- type for additions vs deductions like PPh23)
   - PPN toggle (all modules — checkbox + percentage, default 11%)
   - TOTAL TAGIHAN — navy box, large bold, right-aligned amount in accent orange or white depending on background

6. **Catatan** — label + text (textarea in edit mode); shows "Tidak ada catatan" italic gray if empty

7. **Syarat & Ketentuan** — numbered list (read mode); edit mode: each line becomes an input with a remove (X) button, plus "+ Tambah Baris" at the bottom; default starter terms vary slightly by module (payment deadline days, late fee %, cancellation notice period)

8. **Footer** — centered gray text: "Dokumen ini digenerate oleh sistem EFM V2"

**Edit mode behavior**
- Toggled by "Edit Invoice" button
- Tanggal/Jatuh Tempo become date inputs (Jatuh Tempo minimum H+2 from Tanggal), Catatan becomes textarea, Syarat & Ketentuan becomes editable list, discount/tax fields become interactive
- Footer switches to "Batal" / "Simpan" buttons instead of the normal action row
- All calculation numbers update live as edits are made

---

## 4. Activity Log Pattern (Filterable, Appendable)

Used for: Log Aktivitas sections (Order detail, Leads detail, Operasional Lapangan)

**State**
```js
const [logList, setLogList] = useState([
  {
    id: 'LOG-0001',
    timestamp: '2026-06-15T09:30:00',
    actor: 'Bagoes S.',
    action: 'Mengubah status order menjadi Aktif',
    category: 'status' // status | payment | schedule | note | incident
  },
])
```

**Filter bar** (above the log list): dropdown or pill toggles for category — "Semua | Status | Pembayaran | Jadwal | Catatan"

**Log item render**
```jsx
<div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
  <div className="w-2 h-2 rounded-full bg-[#E05945] mt-1.5 flex-shrink-0" />
  <div className="flex-1">
    <p className="text-sm text-gray-700">{log.action}</p>
    <p className="text-xs text-gray-400 mt-0.5">
      {log.actor} · {formatDate(log.timestamp)}
    </p>
  </div>
</div>
```

**Appending new log entries**
- When an action happens elsewhere on the same page (status change, payment confirmation, schedule edit), append to the SAME `logList` via `setLogList(prev => [...prev, newEntry])` — never create a separate mini-log per section/card
- `logList` state must live at the page/component level (not nested inside a specific card) so any part of the page can push to it
- Entries are appended; the list displays newest-first by sorting on render, not by `unshift`

**Rule learned from this project:** do NOT create a mini activity log per individual card/item (e.g. a separate small log inside each incident report card) — always consolidate into ONE shared log per page, filterable by category. Multiple mini-logs fragment the audit trail and were removed in a past revision.

---

## 5. Pipeline / Stage Progress Visual

Used for: Leads pipeline visualization (PP, B2B, Event leads pages and dashboards)

```jsx
const stages = ['New', 'Approach', 'Screening', 'Invoicing', 'Closing', 'Convert'] // PP example - stages differ per module

<div className="flex items-center">
  {stages.map((stage, idx) => {
    const isCompleted = idx < currentStageIndex
    const isCurrent = idx === currentStageIndex
    return (
      <div key={stage} className="flex items-center flex-1">
        <div className="flex flex-col items-center flex-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
            ${isCompleted ? 'bg-[#1E1C43] text-white' :
              isCurrent ? 'bg-[#E05945] text-white' :
              'bg-gray-200 text-gray-400'}`}>
            {isCompleted ? '✓' : idx + 1}
          </div>
          <p className={`text-xs mt-1 text-center
            ${isCurrent ? 'font-semibold text-[#1E1C43]' : 'text-gray-400'}`}>
            {stage}
          </p>
        </div>
        {idx < stages.length - 1 && (
          <div className={`h-0.5 flex-1 -mt-4
            ${isCompleted ? 'bg-[#1E1C43]' : 'bg-gray-200'}`} />
        )}
      </div>
    )
  })}
</div>
```

**Rules**
- Completed stages: navy filled circle with checkmark
- Current stage: accent orange filled circle with number, bold label
- Upcoming stages: gray outline circle with number, gray label
- Connecting line: navy if the stage before it is completed, gray otherwise
- "Lost" stage (if applicable) is NOT part of the linear pipeline — render separately as a red badge/indicator, since a lead can exit the pipeline at any stage rather than progressing linearly to Lost
