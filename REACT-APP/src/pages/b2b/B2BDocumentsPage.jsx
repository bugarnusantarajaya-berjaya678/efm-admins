import { useState, useMemo, useRef } from 'react'
import { Plus, Search, Eye, Download, X, Upload, ExternalLink, FileText, CheckCircle, Folder } from 'lucide-react'
import { B2B_DOCS_INIT, DOC_STATUS_CLS, DOC_STATUS_LABEL } from '../../data/b2bData'

const JENIS_DOC_OPTS = ['Kontrak', 'MOU', 'LOI']
const KLIEN_OPTS = [
  'Apartemen Green Lake', 'PT. Maju Bersama', 'Apartemen Sudirman Park',
  'CV. Teknologi Prima', 'PT. Sinar Abadi', 'Apartemen The Residence',
  'CV. Sentosa Mandiri', 'CV. Mitra Sejahtera',
]
const STATUS_OPTS = ['drafting', 'on_review', 'revision', 'signed']

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${DOC_STATUS_CLS[status] ?? 'bg-gray-100 text-gray-500'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {DOC_STATUS_LABEL[status] ?? status}
    </span>
  )
}

/* ── Detail / Edit Modal ─────────────────────────────────────────────────── */
function DetailModal({ doc, onClose, onSave }) {
  const [status, setStatus]       = useState(doc.status)
  const [revisions, setRevisions] = useState(doc.revisions ?? [])
  const [gdUrl, setGdUrl]         = useState(doc.googleDocsUrl ?? '')
  const fileRef = useRef()

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const nextVer = `v${revisions.length + 1}`
    const today   = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    setRevisions(prev => [...prev, { version: nextVer, fileName: file.name, uploadedAt: today }])
    e.target.value = ''
  }

  function handleSave() {
    onSave({ ...doc, status, revisions, googleDocsUrl: gdUrl })
    onClose()
  }

  const latestFile = revisions.length > 0 ? revisions[revisions.length - 1] : null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[15px] font-bold text-text-primary">Detail Dokumen B2B</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* Info dokumen */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">ID Berkas</p>
                <p className="text-[15px] font-bold text-text-primary">{doc.id}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Nama Klien</p>
                <p className="text-[13px] font-semibold text-text-primary">{doc.namaKlien}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Jenis Dokumen</p>
                <p className="text-[13px] font-semibold text-text-primary">{doc.jenisDoc}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Tgl Dibuat</p>
                <p className="text-[13px] font-semibold text-text-primary">{doc.tglDibuat}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Berlaku Hingga</p>
                <p className="text-[13px] font-semibold text-text-primary">{doc.tglBerlaku}</p>
              </div>
            </div>

            {/* Status dropdown */}
            <div>
              <label className="block text-[12px] font-bold text-text-primary mb-2">Status Dokumen</label>
              <div className="flex items-center gap-3">
                <StatusBadge status={status} />
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43] bg-white"
                >
                  {STATUS_OPTS.map(s => (
                    <option key={s} value={s}>{DOC_STATUS_LABEL[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload file + history revisi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-text-primary">File Dokumen (PDF)</label>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-[#1E1C43] hover:bg-[#2D2B5A] rounded-lg transition-colors"
                >
                  <Upload size={12} />Upload Revisi Baru
                </button>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              </div>

              {revisions.length === 0 ? (
                <p className="text-[12px] text-text-muted bg-gray-50 rounded-xl px-4 py-3">Belum ada file yang diupload.</p>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {revisions.map((r, i) => (
                    <div key={r.version} className={`flex items-center justify-between px-4 py-2.5 ${i < revisions.length - 1 ? 'border-b border-gray-100' : ''} ${i === revisions.length - 1 ? 'bg-green-50/40' : ''}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold text-text-muted bg-gray-100 px-2 py-0.5 rounded">{r.version}</span>
                        <FileText size={13} className="text-text-muted shrink-0" />
                        <span className="text-[12.5px] text-text-primary font-medium truncate max-w-[180px]">{r.fileName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-text-muted">{r.uploadedAt}</span>
                        <button className="w-6 h-6 flex items-center justify-center rounded text-[#2980B9] hover:bg-blue-50 transition-colors">
                          <Download size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {latestFile && (
                <div className="mt-2 flex items-center gap-2 text-[11.5px] text-green-600">
                  <CheckCircle size={12} />
                  <span>Versi terkini: <strong>{latestFile.fileName}</strong></span>
                </div>
              )}
            </div>

            {/* URL Google Docs */}
            <div>
              <label className="block text-[12px] font-bold text-text-primary mb-2">URL Google Docs</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={gdUrl}
                  onChange={e => setGdUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="flex-1 px-3 py-2 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43]"
                />
                <button
                  disabled={!gdUrl}
                  onClick={() => gdUrl && window.open(gdUrl, '_blank')}
                  className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold border-[1.5px] border-gray-200 rounded-lg text-text-muted hover:border-[#1E1C43] hover:text-[#1E1C43] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ExternalLink size={13} />Buka Link
                </button>
              </div>
              {gdUrl && (
                <p className="mt-1.5 text-[11px] text-[#2980B9] break-all">
                  <a href={gdUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{gdUrl}</a>
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-text-muted hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover transition-colors">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Upload Dokumen Baru Modal ────────────────────────────────────────────── */
function UploadModal({ onClose, onSave }) {
  const [form, setForm]     = useState({ jenisDoc: '', namaKlien: '', berlaku: '', fileName: '', status: 'drafting' })
  const [errors, setErrors] = useState({})
  const fileRef = useRef()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function handleFile(e) {
    const f = e.target.files[0]
    if (f) set('fileName', f.name)
  }

  function handleSubmit() {
    const errs = {}
    if (!form.jenisDoc)  errs.jenisDoc  = 'Wajib diisi'
    if (!form.namaKlien) errs.namaKlien = 'Wajib diisi'
    if (!form.berlaku)   errs.berlaku   = 'Wajib diisi'
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-[15px] font-bold text-text-primary">Dokumen Baru B2B</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:text-text-primary">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Jenis Dokumen <span className="text-accent">*</span></label>
            <select value={form.jenisDoc} onChange={e => set('jenisDoc', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1E1C43]">
              <option value="">Pilih Jenis...</option>
              {JENIS_DOC_OPTS.map(j => <option key={j}>{j}</option>)}
            </select>
            {errors.jenisDoc && <p className="text-[11px] text-accent mt-1">{errors.jenisDoc}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Nama Klien <span className="text-accent">*</span></label>
            <select value={form.namaKlien} onChange={e => set('namaKlien', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1E1C43]">
              <option value="">Pilih Klien...</option>
              {KLIEN_OPTS.map(k => <option key={k}>{k}</option>)}
            </select>
            {errors.namaKlien && <p className="text-[11px] text-accent mt-1">{errors.namaKlien}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Status Awal</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1E1C43]">
              {STATUS_OPTS.map(s => <option key={s} value={s}>{DOC_STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Berlaku Hingga <span className="text-accent">*</span></label>
            <input type="date" value={form.berlaku} onChange={e => set('berlaku', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1E1C43]" />
            {errors.berlaku && <p className="text-[11px] text-accent mt-1">{errors.berlaku}</p>}
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Upload File PDF (opsional)</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-5 cursor-pointer hover:border-[#1E1C43] hover:bg-gray-50 transition-colors">
              <Upload size={24} className="text-text-muted mb-1.5" />
              <p className="text-[13px] font-semibold text-text-primary">{form.fileName || 'Klik untuk upload'}</p>
              <p className="text-[11px] text-text-muted mt-0.5">PDF (Maks. 10MB)</p>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf" onChange={handleFile} />
            </label>
          </div>
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] font-semibold text-text-muted hover:bg-gray-50">Batal</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-semibold hover:bg-accent-hover">Buat Dokumen</button>
        </div>
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
const ROWS_PER_PAGE = 8
const TABS = ['Kontrak', 'MOU', 'LOI', 'Semua']

export default function B2BDocumentsPage() {
  const [docs, setDocs]             = useState(B2B_DOCS_INIT)
  const [activeTab, setActiveTab]   = useState('Semua')
  const [fStatus, setFStatus]       = useState('')
  const [fSearch, setFSearch]       = useState('')
  const [page, setPage]             = useState(1)
  const [showUpload, setShowUpload] = useState(false)
  const [detailDoc, setDetailDoc]   = useState(null)

  const filtered = useMemo(() => docs.filter(d => {
    const matchTab    = activeTab === 'Semua' || d.jenisDoc === activeTab
    const matchStatus = !fStatus || d.status === fStatus
    const matchSearch = !fSearch || d.namaKlien.toLowerCase().includes(fSearch.toLowerCase())
    return matchTab && matchStatus && matchSearch
  }), [docs, activeTab, fStatus, fSearch])

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE)
  const pageRows   = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)

  const signedCount   = docs.filter(d => d.status === 'signed').length
  const draftingCount = docs.filter(d => d.status === 'drafting' || d.status === 'on_review' || d.status === 'revision').length

  function handleSaveDoc(updated) {
    setDocs(prev => prev.map(d => d.id === updated.id ? updated : d))
  }

  function handleNewDoc(form) {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const revisions = form.fileName
      ? [{ version: 'v1', fileName: form.fileName, uploadedAt: today }]
      : []
    setDocs(prev => [{
      id:           `B2B-${String(prev.length + 1).padStart(3, '0')}`,
      namaKlien:    form.namaKlien,
      jenisKlien:   form.namaKlien.startsWith('Apt') ? 'Apartment' : 'Corporate',
      jenisDoc:     form.jenisDoc,
      pic:          '—',
      tglDibuat:    today,
      tglBerlaku:   form.berlaku,
      nilaiKontrak: '—',
      status:       form.status,
      revisions,
      googleDocsUrl: '',
    }, ...prev])
    setShowUpload(false)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Pemberkasan B2B</h1>
          <p className="text-sm text-text-muted mt-1">Kelola Kontrak, MOU, dan LOI klien B2B</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-accent hover:bg-accent-hover transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />Dokumen Baru
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Proses / Draft',  value: draftingCount, bg: 'bg-blue-50',                   iconCls: 'text-[#2980B9]',   icon: FileText    },
          { label: 'Sudah Signed',    value: signedCount,   bg: 'bg-[#EAFAF1]',                 iconCls: 'text-[#1E8449]',   icon: CheckCircle },
          { label: 'Total Dokumen',   value: docs.length,   bg: 'bg-[rgba(30,28,67,0.08)]',     iconCls: 'text-text-primary',icon: Folder      },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.iconCls} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide">{s.label}</p>
                <p className="text-[22px] font-bold text-text-primary leading-tight">{s.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-100 shadow-sm rounded-xl p-1.5 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => { setActiveTab(t); setPage(1) }}
            className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeTab === t ? 'bg-[#1E1C43] text-white font-semibold' : 'text-text-muted hover:text-text-primary'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <select value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1) }} className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none bg-white">
            <option value="">Semua Status</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{DOC_STATUS_LABEL[s]}</option>)}
          </select>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-text-muted shrink-0" />
            <input
              value={fSearch}
              onChange={e => { setFSearch(e.target.value); setPage(1) }}
              placeholder="Cari nama klien..."
              className="bg-transparent text-[13px] outline-none flex-1"
            />
            {fSearch && <button onClick={() => { setFSearch(''); setPage(1) }}><X size={13} className="text-text-muted" /></button>}
          </div>
          {(fStatus || fSearch || activeTab !== 'Semua') && (
            <button onClick={() => { setFStatus(''); setFSearch(''); setActiveTab('Semua'); setPage(1) }} className="text-[12px] text-accent font-semibold hover:underline whitespace-nowrap">Reset</button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID Berkas', 'Nama Klien', 'Jenis', 'Tgl Dibuat', 'Berlaku Hingga', 'Status', 'Preview', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10.5px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-text-muted">Tidak ada dokumen ditemukan.</td></tr>
              ) : pageRows.map(d => {
                const latest = d.revisions?.length > 0 ? d.revisions[d.revisions.length - 1] : null
                return (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">#{d.id}</td>
                    <td className="px-4 py-3 text-text-primary whitespace-nowrap">{d.namaKlien}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-text-muted">{d.jenisDoc}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">{d.tglDibuat}</td>
                    <td className="px-4 py-3 text-text-muted whitespace-nowrap">{d.tglBerlaku}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex flex-col gap-1">
                        {latest && (
                          <div className="flex items-center gap-1.5 text-[11.5px] text-text-muted">
                            <FileText size={11} className="shrink-0" />
                            <span className="truncate max-w-[120px]">{latest.fileName}</span>
                            <button className="text-[#2980B9] shrink-0"><Download size={11} /></button>
                          </div>
                        )}
                        {d.googleDocsUrl && (
                          <a href={d.googleDocsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11.5px] text-[#2980B9] hover:underline">
                            <ExternalLink size={11} />Google Docs
                          </a>
                        )}
                        {!latest && !d.googleDocsUrl && <span className="text-[11px] text-text-muted">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailDoc(d)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-[12px] text-text-muted">
            Menampilkan {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} dokumen
          </p>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted disabled:opacity-40">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium border transition-colors ${p === page ? 'bg-[#1E1C43] text-white border-[#1E1C43]' : 'border-gray-200 text-text-primary hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted disabled:opacity-40">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSave={handleNewDoc} />}
      {detailDoc  && <DetailModal doc={detailDoc} onClose={() => setDetailDoc(null)} onSave={handleSaveDoc} />}
    </div>
  )
}
