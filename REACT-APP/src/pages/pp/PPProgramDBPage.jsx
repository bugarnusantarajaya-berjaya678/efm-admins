import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { PROGRAMS_INIT, PIC_DB, JENIS_OPTS, PIC_OPTS_DB, formatRp } from '../../data/ppProgramDBData'

const ROWS = 10

const JENIS_PROGRAM_AKTIF = [
  'Private Training', 'Semi Private Training', 'Group Training',
  'Fisioterapi', 'Yoga Therapy', 'Posture Correction',
  'Strength & Conditioning', 'Nutrition Coaching', 'Kids Fitness',
]

const EMPTY_FORM = {
  id: '', namaLatihan: '', namaPaket: '', sesi: '', pertemuan: '', partisipan: '1',
  masa: '', picId: '', biayaSesiPIC: '', hargaPersesi: '', diskonPaket: '0', harga: '', status: 'aktif',
}

/* ─── Sub-components ─── */

function StatMini({ label, value, sub, accent }) {
  const borderCls = { orange: 'border-accent', green: 'border-success', red: 'border-danger', yellow: 'border-warning' }[accent] || 'border-border'
  const valueCls  = { orange: 'text-accent', green: 'text-success', red: 'text-danger', yellow: 'text-warning' }[accent] || 'text-text-primary'
  return (
    <div className={`bg-bg-surface rounded-xl border-[1.5px] ${borderCls} px-4 py-3`}>
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${valueCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function Badge({ status }) {
  return status === 'aktif'
    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EAFAF1] text-[#1E8449]">Aktif</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F2F3F4] text-[#7F8C8D]">Nonaktif</span>
}

function ModalShell({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:bg-bg-page">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2.5 shrink-0">{footer}</div>
      </div>
    </div>
  )
}

function FField({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-primary mb-1.5">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
      {hint && <div className="text-[11px] text-text-muted mt-1">{hint}</div>}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 border-[1.5px] border-border rounded-lg text-sm text-text-primary outline-none focus:border-primary transition-colors bg-white'
const selectCls = inputCls

function SectionLabel({ children }) {
  return <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2.5 mt-1">{children}</div>
}

function PBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors
        ${active ? 'bg-primary text-white border-primary' : 'bg-white text-text-muted border-border hover:border-primary hover:text-primary'}`}
    >
      {children}
    </button>
  )
}

/* ─── Add/Edit Modal ─── */

function ProgramModal({ prog, onClose, onSave, existingIds }) {
  const isEdit = !!prog
  const [form, setForm] = useState(isEdit ? { ...prog, sesi: String(prog.sesi), pertemuan: String(prog.pertemuan), partisipan: String(prog.partisipan), biayaSesiPIC: String(prog.biayaSesiPIC), hargaPersesi: String(prog.hargaPersesi), diskonPaket: String(prog.diskonPaket), harga: String(prog.harga) } : { ...EMPTY_FORM })

  const picInfo = PIC_DB[form.picId] || null

  function calc(f) {
    const sesi = parseInt(f.sesi) || 0
    const rate = parseInt(f.hargaPersesi) || 0
    const disc = parseInt(f.diskonPaket) || 0
    return String(Math.max(0, sesi * rate - disc))
  }

  function set(key, val) {
    setForm(prev => {
      const next = { ...prev, [key]: val }
      if (['sesi', 'hargaPersesi', 'diskonPaket'].includes(key)) next.harga = calc(next)
      return next
    })
  }

  function onPICChange(val) {
    const p = PIC_DB[val]
    setForm(prev => ({
      ...prev,
      picId: val,
      biayaSesiPIC: p && !prev.biayaSesiPIC ? String(p.biayaSesi) : prev.biayaSesiPIC,
    }))
  }

  function handleSave() {
    const id = form.id.trim().toUpperCase()
    if (!id || !form.namaLatihan.trim() || !form.picId) {
      alert('Mohon lengkapi field wajib (ID Program, Nama Latihan, PIC).')
      return
    }
    if (!isEdit && existingIds.includes(id)) {
      alert('ID Program sudah ada.')
      return
    }
    onSave({
      id,
      namaLatihan:  form.namaLatihan.trim(),
      namaPaket:    form.namaPaket.trim(),
      sesi:         parseInt(form.sesi) || 0,
      pertemuan:    parseInt(form.pertemuan) || 0,
      partisipan:   parseInt(form.partisipan) || 1,
      masa:         form.masa.trim(),
      picId:        form.picId,
      biayaSesiPIC: parseInt(form.biayaSesiPIC) || 0,
      harga:        parseInt(form.harga) || 0,
      hargaPersesi: parseInt(form.hargaPersesi) || 0,
      diskonPaket:  parseInt(form.diskonPaket) || 0,
      status:       form.status,
    })
    onClose()
  }

  return (
    <ModalShell
      title={isEdit ? `Edit Program — ${prog.id}` : 'Tambah Program Baru'}
      onClose={onClose}
      footer={<>
        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-muted border border-border rounded-lg hover:bg-bg-page">Batal</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-lg flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Simpan Program
        </button>
      </>}
    >
      <SectionLabel>Identitas Program</SectionLabel>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FField label="ID Program" required hint="Prefix: PRG-PP- (Private Training), PRG-TH- (Terapi)">
          <input className={inputCls} value={form.id} onChange={e => set('id', e.target.value.toUpperCase())} placeholder="Contoh: PRG-PP-005" />
        </FField>
        <FField label="Status">
          <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="aktif">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </FField>
      </div>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FField label="Nama Latihan / Terapi" required>
          {(() => {
            const sel = JENIS_PROGRAM_AKTIF.includes(form.namaLatihan) ? form.namaLatihan : (form.namaLatihan ? 'Lainnya' : '')
            return (
              <>
                <select
                  className={selectCls}
                  value={sel}
                  onChange={e => {
                    if (e.target.value !== 'Lainnya') set('namaLatihan', e.target.value)
                    else set('namaLatihan', '')
                  }}
                >
                  <option value="">— Pilih Jenis Program —</option>
                  {JENIS_PROGRAM_AKTIF.map(j => <option key={j} value={j}>{j}</option>)}
                  <option value="Lainnya">Lainnya</option>
                </select>
                {sel === 'Lainnya' && (
                  <input
                    className={`${inputCls} mt-2`}
                    placeholder="Tulis nama latihan / terapi..."
                    value={form.namaLatihan}
                    onChange={e => set('namaLatihan', e.target.value)}
                  />
                )}
              </>
            )
          })()}
        </FField>
        <FField label="Nama Paket" required>
          <input className={inputCls} value={form.namaPaket} onChange={e => set('namaPaket', e.target.value)} placeholder="Contoh: 12 Sesi - Pro" />
        </FField>
      </div>
      <div className="grid grid-cols-3 gap-3.5 mb-3.5">
        <FField label="Jumlah Sesi" required>
          <input type="number" className={inputCls} value={form.sesi} onChange={e => set('sesi', e.target.value)} placeholder="12" min="1" />
        </FField>
        <FField label="Pertemuan / Minggu" required>
          <input type="number" className={inputCls} value={form.pertemuan} onChange={e => set('pertemuan', e.target.value)} placeholder="3" min="1" />
        </FField>
        <FField label="Jumlah Partisipan">
          <input type="number" className={inputCls} value={form.partisipan} onChange={e => set('partisipan', e.target.value)} placeholder="1" min="1" />
        </FField>
      </div>
      <FField label="Masa Berlaku Paket" required>
        <input className={inputCls} value={form.masa} onChange={e => set('masa', e.target.value)} placeholder="Contoh: 60 hari" />
      </FField>

      <SectionLabel>PIC / Pelatih yang Ditugaskan</SectionLabel>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FField label="Pilih PIC" required>
          <select className={selectCls} value={form.picId} onChange={e => onPICChange(e.target.value)}>
            <option value="">— Pilih PIC —</option>
            {PIC_OPTS_DB.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </FField>
        <FField label="Biaya Per Sesi PIC (Rp)" required>
          <input type="number" className={inputCls} value={form.biayaSesiPIC} onChange={e => set('biayaSesiPIC', e.target.value)} placeholder="75000" min="0" />
        </FField>
      </div>
      {picInfo && (
        <div className="bg-bg-page rounded-xl p-3 mb-3.5 border-l-[3px] border-accent">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div><span className="text-text-muted">Spesialisasi:</span><br/><strong>{picInfo.spesialis}</strong></div>
            <div><span className="text-text-muted">No. HP:</span><br/><strong>{picInfo.hp}</strong></div>
            <div><span className="text-text-muted">Default Biaya/Sesi:</span><br/><strong>{formatRp(picInfo.biayaSesi)}</strong></div>
          </div>
        </div>
      )}

      <SectionLabel>Harga</SectionLabel>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FField label="Harga Persesi (Rp)" required>
          <input type="number" className={inputCls} value={form.hargaPersesi} onChange={e => set('hargaPersesi', e.target.value)} placeholder="125000" min="0" />
        </FField>
        <FField label="Diskon Paket (Rp)">
          <input type="number" className={inputCls} value={form.diskonPaket} onChange={e => set('diskonPaket', e.target.value)} placeholder="0" min="0" />
        </FField>
      </div>
      <FField label="Harga Paket / Total (Rp)" required hint="Auto-hitung: (Harga Persesi × Jumlah Sesi) − Diskon Paket">
        <input type="number" className={`${inputCls} bg-bg-page text-text-muted`} value={form.harga} readOnly />
      </FField>
    </ModalShell>
  )
}

/* ─── Main Page ─── */

export default function PPProgramDBPage() {
  const [programs, setPrograms] = useState(PROGRAMS_INIT)
  const [fStatus, setFStatus] = useState('')
  const [fJenis,  setFJenis]  = useState('')
  const [fPIC,    setFPIC]    = useState('')
  const [fSearch, setFSearch] = useState('')
  const [page,    setPage]    = useState(1)
  const [modal,   setModal]   = useState(null) // null | 'add' | { idx, prog }

  const filtered = useMemo(() => {
    const q = fSearch.trim().toLowerCase()
    return programs
      .filter(p => {
        if (fStatus && p.status !== fStatus) return false
        if (fJenis  && p.namaLatihan !== fJenis) return false
        if (fPIC    && p.picId !== fPIC) return false
        if (q) {
          const hay = [p.id, p.namaLatihan, p.namaPaket, (PIC_DB[p.picId]?.fullname || '')].join(' ').toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => parseInt(b.id.split('-').pop()) - parseInt(a.id.split('-').pop()))
  }, [programs, fStatus, fJenis, fPIC, fSearch])

  useEffect(() => { setPage(1) }, [fStatus, fJenis, fPIC, fSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS))
  const slice = filtered.slice((page - 1) * ROWS, page * ROWS)

  const aktifCount = programs.filter(p => p.status === 'aktif').length
  const prices = programs.map(p => p.harga)
  const minHarga = prices.length ? formatRp(Math.min(...prices)) : '—'
  const maxHarga = prices.length ? formatRp(Math.max(...prices)) : '—'

  function reset() { setFStatus(''); setFJenis(''); setFPIC(''); setFSearch('') }

  function handleSave(prog) {
    if (modal === 'add') {
      setPrograms(prev => [...prev, prog])
    } else {
      setPrograms(prev => prev.map((p, i) => i === modal.idx ? prog : p))
    }
  }

  function handleDelete(idx) {
    if (!confirm(`Hapus program "${programs[idx].id}"?`)) return
    setPrograms(prev => prev.filter((_, i) => i !== idx))
  }

  const start = (page - 1) * ROWS + 1
  const end   = Math.min(page * ROWS, filtered.length)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Database Program Private Training</h1>
          <p className="text-sm text-text-muted mt-1">Kelola paket program, harga, dan penugasan PIC — terintegrasi dengan form Buat Order Baru</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
        >
          <Plus size={15} strokeWidth={2.5} />
          Tambah Program
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatMini label="Total Program" value={programs.length} sub="semua terdaftar" />
        <StatMini label="Program Aktif" value={aktifCount} sub="tersedia di form order" accent="green" />
        <StatMini label="Harga Terendah" value={<span className="text-base">{minHarga}</span>} sub="paket terjangkau" />
        <StatMini label="Harga Tertinggi" value={<span className="text-base">{maxHarga}</span>} sub="paket premium" accent="orange" />
      </div>

      {/* Filters */}
      <div className="bg-bg-surface border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="aktif">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fJenis} onChange={e => setFJenis(e.target.value)}>
          <option value="">Semua Jenis</option>
          {JENIS_OPTS.map(j => <option key={j} value={j}>{j}</option>)}
        </select>
        <select className="px-3 py-[7px] border-[1.5px] border-border rounded-lg text-xs text-text-primary bg-white outline-none focus:border-primary hover:border-primary transition-colors" value={fPIC} onChange={e => setFPIC(e.target.value)}>
          <option value="">Semua PIC</option>
          {PIC_OPTS_DB.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-bg-page border-[1.5px] border-border rounded-lg px-3 py-[7px] focus-within:border-primary focus-within:bg-white transition-colors">
          <Search size={14} className="text-text-muted shrink-0" />
          <input
            className="border-none bg-transparent text-xs outline-none w-full text-text-primary placeholder:text-text-muted"
            placeholder="Cari nama latihan, paket, atau ID program..."
            value={fSearch}
            onChange={e => setFSearch(e.target.value)}
          />
        </div>
        <button onClick={reset} className="px-3.5 py-[7px] bg-primary hover:bg-primary-2 text-white text-xs font-semibold rounded-lg transition-colors shrink-0">Reset</button>
      </div>

      {/* Table */}
      <div className="bg-bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '1200px' }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID Program','Nama Latihan/ Terapi','Nama Paket','Sesi','Pertemuan','Masa Berlaku','Peserta','PIC','Biaya/Sesi','Harga Paket','Status','Aksi'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={12} className="py-10 text-center text-sm text-text-muted">Tidak ada program yang sesuai filter</td></tr>
              ) : slice.map((p, ri) => {
                const realIdx = programs.indexOf(p)
                const pic = PIC_DB[p.picId] || {}
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="text-xs font-semibold text-[#1E1C43] px-3 py-2.5 whitespace-nowrap">{p.id}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5">{p.namaLatihan}</td>
                    <td className="text-xs font-medium text-gray-900 px-3 py-2.5">{p.namaPaket}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.sesi}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.pertemuan}x</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 whitespace-nowrap">{p.masa}</td>
                    <td className="text-xs font-normal text-gray-600 px-3 py-2.5 text-center">{p.partisipan} org</td>
                    <td className="px-3 py-2.5">
                      <div className="text-[11px] font-bold text-accent">{p.picId}</div>
                      <div className="text-[11px] text-text-muted">{pic.fullname || '—'}</div>
                    </td>
                    <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 text-right whitespace-nowrap">{formatRp(p.biayaSesiPIC)}</td>
                    <td className="text-xs font-semibold text-gray-600 px-3 py-2.5 text-right whitespace-nowrap">{formatRp(p.harga)}</td>
                    <td className="px-3 py-2.5 text-center"><Badge status={p.status} /></td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={() => setModal({ idx: realIdx, prog: p })}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:border-primary hover:text-primary hover:bg-bg-page transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(realIdx)}
                          className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:border-danger hover:text-danger hover:bg-[#FDEDEC] transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {filtered.length === 0 ? 'Tidak ada program ditemukan' : `Menampilkan ${start}–${end} dari ${filtered.length} program`}
          </span>
          <div className="flex items-center gap-1.5">
            <PBtn onClick={() => setPage(p => Math.max(1, p - 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </PBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <PBtn key={n} active={n === page} onClick={() => setPage(n)}>{n}</PBtn>
            ))}
            <PBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </PBtn>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ProgramModal
          prog={modal === 'add' ? null : modal.prog}
          onClose={() => setModal(null)}
          onSave={handleSave}
          existingIds={programs.map(p => p.id)}
        />
      )}
    </div>
  )
}
