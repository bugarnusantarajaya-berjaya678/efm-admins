import { useState, useMemo } from 'react'
import { Plus, Eye, Check, ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react'
import { CORP_LEADS_INIT, STAGE_CLS, PIC_EFM_OPTS, formatRp } from '../../data/b2bData'

const STAGES = ['New', 'Proposal', 'Presentasi', 'Closing', 'Gagal']
const ROWS_PER_PAGE = 8

/* ── Badge ── */
function StageBadge({ stage }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${STAGE_CLS[stage] ?? ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {stage}
    </span>
  )
}

/* ── Toast ── */
function Toast({ msg }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] bg-[#1E1C43] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl shadow-lg">
      {msg}
    </div>
  )
}

/* ── Add Lead Modal ── */
function AddModal({ onClose, onSave, existingIds }) {
  const [form, setForm] = useState({ nama: '', pic: '', noHp: '', nilaiEst: '', stage: 'New', catatan: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    if (!form.nama.trim()) { alert('Nama perusahaan wajib diisi.'); return }
    if (!form.pic.trim())  { alert('PIC Klien wajib diisi.'); return }
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[520px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-[16px] font-bold text-text-primary">Tambah Lead Corporate</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors"><X size={15} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Nama Perusahaan <span className="text-accent">*</span></label>
            <input value={form.nama} onChange={set('nama')} placeholder="PT. Nama Perusahaan"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">PIC Klien <span className="text-accent">*</span></label>
              <input value={form.pic} onChange={set('pic')} placeholder="Nama kontak"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">No HP <span className="text-accent">*</span></label>
              <input value={form.noHp} onChange={set('noHp')} placeholder="+62 812 xxxx xxxx"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Est. Nilai Kontrak</label>
              <input value={form.nilaiEst} onChange={set('nilaiEst')} placeholder="Rp 10jt/bln"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Stage <span className="text-accent">*</span></label>
              <select value={form.stage} onChange={set('stage')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]">
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Catatan</label>
            <textarea value={form.catatan} onChange={set('catatan')} rows={3} placeholder="Catatan awal..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins] resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Batal</button>
          <button onClick={handleSave} className="px-5 py-2 text-[13px] font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors">Simpan Lead</button>
        </div>
      </div>
    </div>
  )
}

/* ── Convert Modal ── */
function ConvertModal({ lead, onClose, onConvert }) {
  const [form, setForm] = useState({ nilaiKontrak: lead.nilaiEst, durasi: '12 bulan', tglMulai: new Date().toISOString().split('T')[0], picEfm: '', catatan: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-[16px] font-bold text-text-primary">Convert Lead → Klien B2B</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors"><X size={15} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Lead info box */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 border-l-[3px] border-[#27AE60]">
            <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wide mb-1">Lead yang akan diconvert</p>
            <p className="text-[15px] font-bold text-text-primary">{lead.nama}</p>
            <p className="text-[12px] text-text-muted mt-0.5">Corporate · PIC: {lead.pic}</p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Nilai Kontrak per Bulan <span className="text-accent">*</span></label>
            <input value={form.nilaiKontrak} onChange={set('nilaiKontrak')} placeholder="Rp 12.000.000"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Durasi Kontrak <span className="text-accent">*</span></label>
              <select value={form.durasi} onChange={set('durasi')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]">
                {['3 bulan', '6 bulan', '12 bulan', '24 bulan'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Tanggal Mulai <span className="text-accent">*</span></label>
              <input type="date" value={form.tglMulai} onChange={set('tglMulai')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">PIC EFM (Petugas lapangan)</label>
            <select value={form.picEfm} onChange={set('picEfm')}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins]">
              <option value="">Pilih PIC EFM...</option>
              {PIC_EFM_OPTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Catatan Kontrak</label>
            <textarea value={form.catatan} onChange={set('catatan')} rows={2} placeholder="Catatan khusus kontrak..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1E1C43] font-[Poppins] resize-none" />
          </div>

          {/* Summary */}
          <div className="bg-[#EAFAF1] rounded-xl px-4 py-3 border-l-[3px] border-[#27AE60]">
            <p className="text-[11px] font-bold text-[#27AE60] uppercase tracking-wide mb-2">Setelah Convert:</p>
            {['Lead akan dipindahkan ke Database Klien B2B', 'Status lead berubah menjadi Converted', 'Invoice pertama siap digenerate'].map(t => (
              <p key={t} className="text-[12px] text-[#1E1C43] flex items-center gap-1.5 mb-1 last:mb-0">
                <CheckCircle size={12} color="#27AE60" className="shrink-0" />{t}
              </p>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Batal</button>
          <button
            onClick={() => { onConvert(lead.id, form); onClose() }}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-bold text-white bg-[#27AE60] hover:bg-[#219A52] rounded-lg transition-colors"
          >
            <Check size={14} strokeWidth={2.5} />
            Konfirmasi — Jadikan Klien
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Detail Lead Modal ── */
function DetailModal({ lead, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-[16px] font-bold text-text-primary">Detail Lead Corporate</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors"><X size={15} /></button>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Nama Perusahaan</p>
              <p className="text-[15px] font-bold text-text-primary">{lead.nama}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">PIC Klien</p>
              <p className="text-[13px] font-semibold text-text-primary">{lead.pic || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">No HP</p>
              <p className="text-[13px] font-semibold text-text-primary">{lead.noHp || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Stage</p>
              <StageBadge stage={lead.stage} />
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Est. Nilai Kontrak</p>
              <p className="text-[13px] font-semibold text-text-primary">{lead.nilaiEst || '—'}</p>
            </div>
            <div className="col-span-2 bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wide mb-1">Catatan</p>
              <p className="text-[13px] text-text-muted">{lead.catatan || '—'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Tutup</button>
        </div>
      </div>
    </div>
  )
}

/* ── Success overlay ── */
function SuccessOverlay({ namaKlien, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-10 text-center max-w-[360px] w-full shadow-2xl">
        <div className="w-16 h-16 bg-[rgba(39,174,96,.12)] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} color="#27AE60" />
        </div>
        <h3 className="text-[18px] font-bold text-text-primary mb-2">Berhasil Diconvert! 🎉</h3>
        <p className="text-[13px] text-text-muted mb-6">{namaKlien} telah ditambahkan ke Database Klien B2B.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Tutup</button>
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors">Lihat Database Klien →</button>
        </div>
      </div>
    </div>
  )
}

/* ── Page ── */
export default function B2BLeadsCorporatePage() {
  const [leads, setLeads]         = useState(CORP_LEADS_INIT)
  const [fBulan, setFBulan]       = useState('')
  const [fTahun, setFTahun]       = useState('')
  const [fStage, setFStage]       = useState('')
  const [fSearch, setFSearch]     = useState('')
  const [page, setPage]           = useState(1)
  const [modal, setModal]         = useState(null) // null | 'add' | 'convert' | 'success'
  const [activeLead, setActiveLead] = useState(null)
  const [detailLead, setDetailLead] = useState(null)
  const [successName, setSuccessName] = useState('')
  const [toast, setToast]         = useState(false)

  const BSHORT = {Januari:'Jan',Februari:'Feb',Maret:'Mar',April:'Apr',Mei:'Mei',Juni:'Jun',Juli:'Jul',Agustus:'Agu',September:'Sep',Oktober:'Okt',November:'Nov',Desember:'Des'}
  const filtered = useMemo(() => {
    const q = fSearch.toLowerCase()
    return leads.filter(l => {
      const matchBulan  = !fBulan  || (l.tgl ?? '').includes(BSHORT[fBulan] ?? fBulan)
      const matchTahun  = !fTahun  || (l.tgl ?? '').includes(fTahun)
      const matchStage  = !fStage  || l.stage === fStage
      const matchSearch = !q || l.nama.toLowerCase().includes(q) || l.pic.toLowerCase().includes(q)
      return matchBulan && matchTahun && matchStage && matchSearch
    })
  }, [leads, fBulan, fTahun, fStage, fSearch])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  const stats = useMemo(() => ({
    total:     leads.length,
    hot:       leads.filter(l => l.stage === 'Proposal' || l.stage === 'Closing').length,
    converted: leads.filter(l => l.stage === 'Converted').length,
    gagal:     leads.filter(l => l.stage === 'Gagal').length,
  }), [leads])

  const handleAddSave = (form) => {
    const newId = `BC-${String(leads.length + 1).padStart(3, '0')}`
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    setLeads(prev => [{ id: newId, tgl: today, ...form }, ...prev])
  }

  const handleConvert = (id, form) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: 'Converted' } : l))
    const lead = leads.find(l => l.id === id)
    setSuccessName(lead?.nama ?? '')
    setModal('success')
  }

  const showConvertHint = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text-primary">Leads Corporate</h1>
          <p className="text-sm text-text-muted mt-1">Kelola prospek klien korporat B2B — Klik ✓ untuk convert lead Closing menjadi Klien</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-accent hover:bg-accent-hover transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />
          Tambah Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Leads',  value: stats.total,     sub: 'Bulan ini',          accent: false },
          { label: 'Hot Leads',    value: stats.hot,       sub: 'Proposal & Closing', accent: true  },
          { label: 'Converted',    value: stats.converted, sub: 'Jadi klien',         accent: false },
          { label: 'Gagal',        value: stats.gagal,     sub: 'Tidak closing',      accent: false },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className={`bg-white rounded-2xl border px-5 py-4 shadow-sm ${accent ? 'border-accent' : 'border-gray-100'}`}>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">{label}</p>
            <p className={`text-[24px] font-bold leading-none ${accent ? 'text-accent' : 'text-text-primary'}`}>{value}</p>
            <p className="text-[11px] text-text-muted mt-1.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-2.5">
        <select value={fBulan} onChange={e => { setFBulan(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43]/20 font-[Poppins]">
          <option value="">Semua Bulan</option>
          {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map(b => <option key={b}>{b}</option>)}
        </select>
        <select value={fTahun} onChange={e => { setFTahun(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43]/20 font-[Poppins]">
          <option value="">Semua Tahun</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
        <select value={fStage} onChange={e => { setFStage(e.target.value); setPage(1) }}
          className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1C43]/20 font-[Poppins]">
          <option value="">Semua Stage</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
          <option>Converted</option>
        </select>
        <button
          onClick={() => { setFBulan(''); setFTahun(''); setFStage(''); setFSearch('') }}
          className="h-9 px-4 rounded-lg bg-[#1E1C43] text-white text-[13px] font-semibold hover:bg-[#2D2B5A] transition-colors"
        >
          Reset
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#1E1C43] focus-within:bg-white transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text" value={fSearch}
            onChange={e => { setFSearch(e.target.value); setPage(1) }}
            placeholder="Cari nama perusahaan..."
            className="flex-1 bg-transparent outline-none text-[13px] text-text-primary font-[Poppins] placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['ID', 'Nama Perusahaan', 'PIC Klien', 'No HP', 'Est. Nilai Kontrak', 'Stage', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-text-muted">Tidak ada data yang sesuai filter.</td></tr>
              ) : pageRows.map(lead => (
                <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-text-muted text-[12px]">#{lead.id}</td>
                  <td className="px-4 py-3.5 font-bold text-text-primary whitespace-nowrap">{lead.nama}</td>
                  <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">{lead.pic}</td>
                  <td className="px-4 py-3.5 text-text-muted whitespace-nowrap">{lead.noHp}</td>
                  <td className="px-4 py-3.5 text-text-primary">{lead.nilaiEst}</td>
                  <td className="px-4 py-3.5"><StageBadge stage={lead.stage} /></td>
                  <td className="px-4 py-3.5 text-text-muted text-[12px] whitespace-nowrap">{lead.tgl}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button title="Detail" onClick={() => setDetailLead(lead)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors">
                        <Eye size={13} />
                      </button>
                      {lead.stage === 'Closing' ? (
                        <button
                          title="Convert menjadi Klien"
                          onClick={() => { setActiveLead(lead); setModal('convert') }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#A9DFBF] bg-[#EAFAF1] text-[#27AE60] hover:bg-[#27AE60] hover:text-white transition-colors"
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                      ) : (
                        <button
                          title="Hanya tersedia saat stage = Closing"
                          onClick={showConvertHint}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-text-muted opacity-30 cursor-not-allowed"
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <p className="text-[12px] text-text-muted">
            Menampilkan {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}–{Math.min(safePage * ROWS_PER_PAGE, filtered.length)} dari {filtered.length} data
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-35 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-colors ${safePage === p ? 'bg-[#1E1C43] text-white' : 'border border-gray-200 text-text-muted hover:bg-gray-50'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 disabled:opacity-35 hover:bg-gray-50 transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'add' && <AddModal onClose={() => setModal(null)} onSave={handleAddSave} existingIds={leads.map(l => l.id)} />}
      {modal === 'convert' && activeLead && <ConvertModal lead={activeLead} onClose={() => setModal(null)} onConvert={handleConvert} />}
      {modal === 'success' && <SuccessOverlay namaKlien={successName} onClose={() => setModal(null)} />}
      {detailLead && <DetailModal lead={detailLead} onClose={() => setDetailLead(null)} />}
      {toast && <Toast msg="⚠️ Tombol Convert hanya aktif saat stage = Closing" />}
    </div>
  )
}
