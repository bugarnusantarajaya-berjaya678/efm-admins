import { useState, useEffect, useMemo } from 'react'
import { Download, CheckCircle, FileText, Table2, Calendar, Clock, Layers, ChevronDown } from 'lucide-react'

/* ── Constants ───────────────────────────────────────────────────────────── */
const BULAN_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const TAHUN_OPTS  = ['2024','2025','2026']

const MODUL_LIST = [
  {
    id: 'pp', label: 'Private Program', expandable: true,
    items: [
      { id: 'leads',     label: 'Leads',          isLeads: true  },
      { id: 'orders',    label: 'Orders',          isLeads: false },
      { id: 'invoice',   label: 'Invoice',         isLeads: false },
      { id: 'receipt',   label: 'Receipt',         isLeads: false },
      { id: 'agreement', label: 'Agreement/PKS',   isLeads: false },
    ],
  },
  {
    id: 'b2b', label: 'B2B Management', expandable: true,
    items: [
      { id: 'leads',     label: 'Leads',           isLeads: true  },
      { id: 'survei',    label: 'Survei',          isLeads: false },
      { id: 'quotation', label: 'Quotation & LOI', isLeads: false },
      { id: 'orders',    label: 'Orders',          isLeads: false },
      { id: 'dokumen',   label: 'Dokumen Kontrak', isLeads: false },
      { id: 'invoice',   label: 'Invoice',         isLeads: false },
      { id: 'receipt',   label: 'Receipt',         isLeads: false },
      { id: 'profit',    label: 'Profit Sharing',  isLeads: false },
    ],
  },
  {
    id: 'event', label: 'Event', expandable: true,
    items: [
      { id: 'leads',     label: 'Leads',           isLeads: true  },
      { id: 'konsultasi',label: 'Konsultasi',      isLeads: false },
      { id: 'quotation', label: 'Quotation & LOI', isLeads: false },
      { id: 'orders',    label: 'Orders',          isLeads: false },
      { id: 'dokumen',   label: 'Dokumen Kontrak', isLeads: false },
      { id: 'invoice',   label: 'Invoice',         isLeads: false },
      { id: 'receipt',   label: 'Receipt',         isLeads: false },
      { id: 'profit',    label: 'Profit Sharing',  isLeads: false },
    ],
  },
  {
    id: 'absensi', label: 'Absensi & Rekap PIC', expandable: false,
    items: [
      { id: 'rekap', label: 'Rekap Kehadiran Sesi', isLeads: false },
    ],
  },
  {
    id: 'payment', label: 'Pembayaran Honorarium PIC', expandable: false,
    items: [
      { id: 'riwayat', label: 'Riwayat Pembayaran PIC', isLeads: false },
    ],
  },
]

/* Default: semua non-Leads ter-check, Leads tidak */
const DEFAULT_CHECKED = Object.fromEntries(
  MODUL_LIST.map(m => [m.id, m.items.filter(i => !i.isLeads).map(i => i.id)])
)
const TOTAL_ITEMS = MODUL_LIST.reduce((s, m) => s + m.items.length, 0)

const RIWAYAT_INIT = [
  {
    id: 'EXP-003',
    tglExport: '15 Jun 2026',
    periode: 'Juni 2026',
    modul: ['Private Program: Orders, Invoice, Receipt, Agreement/PKS', 'B2B Management: Survei, Orders, Invoice, Receipt'],
    format: 'excel',
    ukuran: '2.4 MB',
    exportedBy: 'Admin EFM',
  },
  {
    id: 'EXP-002',
    tglExport: '1 Jun 2026',
    periode: 'Mei 2026',
    modul: ['Semua Data'],
    format: 'pdf',
    ukuran: '8.1 MB',
    exportedBy: 'Admin EFM',
  },
  {
    id: 'EXP-001',
    tglExport: '2 Jan 2026',
    periode: 'Tahun 2025',
    modul: ['Absensi & Rekap PIC: Rekap Kehadiran Sesi', 'Pembayaran Honorarium PIC: Riwayat Pembayaran PIC'],
    format: 'excel',
    ukuran: '5.7 MB',
    exportedBy: 'Admin EFM',
  },
]

/* ── Progress Modal ──────────────────────────────────────────────────────── */
function ProgressModal({ format, onClose, onDownload }) {
  const [step, setStep] = useState('loading')
  useEffect(() => {
    const t = setTimeout(() => setStep('done'), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden">
        {step === 'loading' ? (
          <div className="px-8 py-12 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-[rgba(30,28,67,0.07)] flex items-center justify-center">
              <span className="w-8 h-8 border-[3px] border-[#1E1C43]/20 border-t-[#1E1C43] rounded-full animate-spin inline-block" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-text-primary">Menyiapkan data...</p>
              <p className="text-[13px] text-text-muted mt-1">Harap tunggu, sedang memproses export</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-[#1E1C43] rounded-full" style={{ width: '100%', transition: 'width 2s ease-in-out' }} />
            </div>
          </div>
        ) : (
          <div className="px-8 py-12 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle size={30} className="text-green-500" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-text-primary">Export berhasil!</p>
              <p className="text-[13px] text-text-muted mt-1">
                File <span className="font-semibold text-text-primary">.{format === 'excel' ? 'xlsx' : 'pdf'}</span> siap untuk didownload
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={onClose}
                className="flex-1 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] font-semibold text-text-muted hover:border-text-primary transition-colors">
                Tutup
              </button>
              <button onClick={onDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-bold rounded-lg transition-colors">
                <Download size={14} />Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LaporanExportPage() {
  /* Periode */
  const [periodeMode, setPeriodeMode] = useState('bulan')
  const [fBulan,   setFBulan]   = useState('')
  const [fTahun,   setFTahun]   = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  /* Sub-item selections: { modId: string[] } */
  const [checkedItems, setCheckedItems] = useState(DEFAULT_CHECKED)

  /* Expand state */
  const [expanded, setExpanded] = useState([])

  /* Format */
  const [format, setFormat] = useState('excel')

  /* UI */
  const [modal,   setModal]   = useState(false)
  const [toast,   setToast]   = useState(false)
  const [riwayat, setRiwayat] = useState(RIWAYAT_INIT)

  /* Derived counts */
  const totalChecked = useMemo(
    () => Object.values(checkedItems).reduce((s, arr) => s + arr.length, 0),
    [checkedItems]
  )
  const isAllChecked  = totalChecked === TOTAL_ITEMS
  const isSomeChecked = totalChecked > 0 && !isAllChecked

  const periodeOk = (
    (periodeMode === 'bulan' && fBulan && fTahun) ||
    (periodeMode === 'tahun' && fTahun) ||
    (periodeMode === 'range' && dateFrom && dateTo)
  )
  const canExport = periodeOk && totalChecked > 0

  /* Module state helper */
  function getModState(modId) {
    const mod = MODUL_LIST.find(m => m.id === modId)
    const ch  = checkedItems[modId] || []
    if (ch.length === 0)              return 'none'
    if (ch.length === mod.items.length) return 'all'
    return 'partial'
  }

  /* Toggles */
  function toggleSelectAll() {
    if (isAllChecked) {
      setCheckedItems(Object.fromEntries(MODUL_LIST.map(m => [m.id, []])))
    } else {
      setCheckedItems(Object.fromEntries(MODUL_LIST.map(m => [m.id, m.items.map(i => i.id)])))
    }
  }

  function toggleModuleAll(modId) {
    const st  = getModState(modId)
    const mod = MODUL_LIST.find(m => m.id === modId)
    setCheckedItems(prev => ({
      ...prev,
      [modId]: st === 'all' ? [] : mod.items.filter(i => !i.isLeads).map(i => i.id),
    }))
  }

  function toggleItem(modId, itemId) {
    setCheckedItems(prev => {
      const cur = prev[modId] || []
      return {
        ...prev,
        [modId]: cur.includes(itemId) ? cur.filter(x => x !== itemId) : [...cur, itemId],
      }
    })
  }

  function toggleExpand(modId) {
    setExpanded(prev =>
      prev.includes(modId) ? prev.filter(x => x !== modId) : [...prev, modId]
    )
  }

  /* Summary for panel kanan */
  const selectedSummary = useMemo(
    () =>
      MODUL_LIST
        .filter(m => (checkedItems[m.id] || []).length > 0)
        .map(m => ({
          label:      m.label,
          itemLabels: (checkedItems[m.id] || [])
            .map(id => m.items.find(i => i.id === id)?.label)
            .filter(Boolean),
        })),
    [checkedItems]
  )

  function getPeriodeLabel() {
    if (periodeMode === 'bulan' && fBulan && fTahun) return `${fBulan} ${fTahun}`
    if (periodeMode === 'tahun' && fTahun)           return `Tahun ${fTahun}`
    if (periodeMode === 'range' && dateFrom && dateTo) {
      const f = d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      return `${f(dateFrom)} – ${f(dateTo)}`
    }
    return '—'
  }

  function handleDownload() {
    const modulLabels = isAllChecked
      ? ['Semua Data']
      : selectedSummary.map(s => `${s.label}: ${s.itemLabels.join(', ')}`)
    setRiwayat(prev => [{
      id:          `EXP-${String(prev.length + 4).padStart(3, '0')}`,
      tglExport:   new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      periode:     getPeriodeLabel(),
      modul:       modulLabels,
      format,
      ukuran:      `${(totalChecked * (format === 'excel' ? 0.3 : 0.5)).toFixed(1)} MB`,
      exportedBy:  'Admin EFM',
    }, ...prev])
    setModal(false)
    setToast(true)
    setTimeout(() => setToast(false), 3500)
  }

  const selectCls = 'px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1E1C43] bg-white w-full'
  const tabCls    = active =>
    `flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-colors border-[1.5px] ${
      active ? 'bg-[#1E1C43] border-[#1E1C43] text-white' : 'border-gray-200 text-text-muted hover:border-[#1E1C43]'
    }`

  return (
    <div className="max-w-[860px]">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-text-primary">Export &amp; Backup Data</h1>
        <p className="text-[13px] text-text-muted mt-1">Download data per modul untuk backup bulanan/tahunan</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── Left: Config ────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* 1. Filter Periode */}
          <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[rgba(30,28,67,0.08)] flex items-center justify-center shrink-0">
                <Calendar size={13} className="text-[#1E1C43]" />
              </div>
              <h3 className="text-[13px] font-bold text-text-primary">Filter Periode <span className="text-accent ml-0.5">*</span></h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex gap-2">
                {[['bulan','Per Bulan'],['tahun','Per Tahun'],['range','Range Custom']].map(([val, lbl]) => (
                  <button key={val} onClick={() => setPeriodeMode(val)} className={tabCls(periodeMode === val)}>
                    {lbl}
                  </button>
                ))}
              </div>

              {periodeMode === 'bulan' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Bulan</label>
                    <select value={fBulan} onChange={e => setFBulan(e.target.value)} className={selectCls}>
                      <option value="">Pilih Bulan</option>
                      {BULAN_NAMES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Tahun</label>
                    <select value={fTahun} onChange={e => setFTahun(e.target.value)} className={selectCls}>
                      <option value="">Pilih Tahun</option>
                      {TAHUN_OPTS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {periodeMode === 'tahun' && (
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Tahun</label>
                  <select value={fTahun} onChange={e => setFTahun(e.target.value)} className={selectCls}>
                    <option value="">Pilih Tahun</option>
                    {TAHUN_OPTS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              )}

              {periodeMode === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Dari</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={selectCls} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Sampai</label>
                    <input type="date" value={dateTo} min={dateFrom} onChange={e => setDateTo(e.target.value)} className={selectCls} />
                  </div>
                </div>
              )}

              {periodeOk && (
                <p className="text-[12px] text-green-600 flex items-center gap-1.5">
                  <CheckCircle size={12} />Periode: <span className="font-semibold">{getPeriodeLabel()}</span>
                </p>
              )}
            </div>
          </div>

          {/* 2. Pilih Modul */}
          <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[rgba(30,28,67,0.08)] flex items-center justify-center shrink-0">
                  <Layers size={13} className="text-[#1E1C43]" />
                </div>
                <h3 className="text-[13px] font-bold text-text-primary">Pilih Modul</h3>
              </div>
              <span className="text-[11px] text-text-muted">{totalChecked} item dipilih dari {TOTAL_ITEMS} total</span>
            </div>
            <div className="px-6 py-4 space-y-1.5">

              {/* Semua Data */}
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50 border-[1.5px] border-dashed border-gray-200 hover:border-[#1E1C43] transition-colors mb-3">
                <input
                  type="checkbox"
                  ref={el => { if (el) el.indeterminate = isSomeChecked }}
                  checked={isAllChecked}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-[#1E1C43] cursor-pointer shrink-0"
                />
                <div>
                  <p className="text-[13px] font-bold text-[#1E1C43]">Semua Data</p>
                  <p className="text-[11px] text-text-muted">Select all — semua modul &amp; item akan disertakan</p>
                </div>
              </label>

              {/* Per-module rows */}
              {MODUL_LIST.map(m => {
                const st         = getModState(m.id)
                const isExpanded = expanded.includes(m.id)
                const checkedCnt = (checkedItems[m.id] || []).length

                /* Non-expandable: flat single-checkbox row */
                if (!m.expandable) {
                  return (
                    <label
                      key={m.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={st === 'all'}
                        onChange={() => toggleModuleAll(m.id)}
                        className="w-4 h-4 cursor-pointer shrink-0"
                        style={{ accentColor: '#1E1C43' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-text-primary">{m.label}</p>
                        <p className="text-[11px] text-text-muted leading-tight">{m.items[0].label}</p>
                      </div>
                    </label>
                  )
                }

                /* Expandable modules */
                return (
                  <div key={m.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {/* Header — click row to expand */}
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpand(m.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          ref={el => { if (el) el.indeterminate = st === 'partial' }}
                          checked={st === 'all'}
                          onClick={e => e.stopPropagation()}
                          onChange={() => toggleModuleAll(m.id)}
                          className="w-4 h-4 cursor-pointer shrink-0"
                          style={{ accentColor: '#1E1C43' }}
                        />
                        <span className="text-[13px] font-semibold text-text-primary">{m.label}</span>
                        <span className="text-[11px] text-text-muted">{checkedCnt}/{m.items.length}</span>
                      </div>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {/* Sub-items */}
                    {isExpanded && (
                      <div className="px-6 py-2 border-t border-gray-200 bg-gray-50">
                        {m.items.map(item => (
                          <label
                            key={item.id}
                            className="flex items-center gap-3 py-2 text-sm text-gray-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(checkedItems[m.id] || []).includes(item.id)}
                              onChange={() => toggleItem(m.id, item.id)}
                              className="w-3.5 h-3.5 cursor-pointer shrink-0"
                              style={{ accentColor: '#1E1C43' }}
                            />
                            <span>{item.label}</span>
                            {item.isLeads && (
                              <span className="text-xs text-gray-400 ml-1">(opsional, tidak default)</span>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. Format Export */}
          <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[rgba(30,28,67,0.08)] flex items-center justify-center shrink-0">
                <FileText size={13} className="text-[#1E1C43]" />
              </div>
              <h3 className="text-[13px] font-bold text-text-primary">Format Export <span className="text-accent ml-0.5">*</span></h3>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-3">
              {[
                { val: 'excel', icon: <Table2 size={20} />,   label: 'Excel (.xlsx)', desc: 'Untuk analisa data & pivot table', color: '#1D6F42' },
                { val: 'pdf',   icon: <FileText size={20} />, label: 'PDF (.pdf)',   desc: 'Untuk arsip & presentasi',        color: '#E05945' },
              ].map(f => (
                <button key={f.val} onClick={() => setFormat(f.val)}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border-[2px] text-left transition-all ${
                    format === f.val
                      ? 'border-[#1E1C43] bg-[rgba(30,28,67,0.04)]'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${format === f.val ? '' : 'opacity-50'}`}
                    style={{ background: `${f.color}15`, color: f.color }}>
                    {f.icon}
                  </div>
                  <div>
                    <p className={`text-[13px] font-bold ${format === f.val ? 'text-[#1E1C43]' : 'text-text-primary'}`}>{f.label}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{f.desc}</p>
                  </div>
                  <div className={`ml-auto w-4 h-4 rounded-full border-[2px] shrink-0 mt-0.5 flex items-center justify-center ${
                    format === f.val ? 'border-[#1E1C43]' : 'border-gray-300'
                  }`}>
                    {format === f.val && <span className="w-2 h-2 rounded-full bg-[#1E1C43] block" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Summary + Button ──────────────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[13px] font-bold text-text-primary">Ringkasan Export</h3>
            </div>
            <div className="px-5 py-4 space-y-3 text-[13px]">

              {/* Periode */}
              <div className="flex justify-between items-start gap-2">
                <span className="text-text-muted shrink-0">Periode</span>
                <span className={`font-semibold text-right ${periodeOk ? 'text-text-primary' : 'text-gray-300'}`}>
                  {periodeOk ? getPeriodeLabel() : '—'}
                </span>
              </div>

              {/* Modul & Item */}
              <div>
                <p className="text-text-muted mb-1.5">Modul &amp; Item</p>
                {selectedSummary.length === 0 ? (
                  <p className="text-[12px] text-gray-400">Pilih periode dan modul terlebih dahulu.</p>
                ) : isAllChecked ? (
                  <p className="font-semibold text-text-primary">Semua Data</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSummary.map(s => (
                      <div key={s.label}>
                        <p className="text-[12px] font-semibold text-text-primary leading-snug">{s.label}</p>
                        <p className="text-[11px] text-text-muted leading-snug">{s.itemLabels.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Format */}
              <div className="flex justify-between items-center gap-2">
                <span className="text-text-muted">Format</span>
                <span className="font-semibold text-text-primary">{format === 'excel' ? 'Excel (.xlsx)' : 'PDF (.pdf)'}</span>
              </div>

              {/* Est. Ukuran */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Est. Ukuran</span>
                  <span className="font-semibold text-text-primary">
                    {!canExport ? '—' : `~${(totalChecked * (format === 'excel' ? 0.3 : 0.5)).toFixed(1)} MB`}
                  </span>
                </div>
              </div>
            </div>

            {!canExport && (
              <div className="mx-4 mb-4 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[11.5px] text-amber-700">
                  {!periodeOk && totalChecked === 0
                    ? 'Pilih periode dan modul terlebih dahulu.'
                    : !periodeOk
                    ? 'Periode belum lengkap.'
                    : 'Pilih minimal satu item.'}
                </p>
              </div>
            )}

            <div className="px-5 pb-5">
              <button
                onClick={() => setModal(true)}
                disabled={!canExport}
                className="w-full py-3 flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold rounded-xl transition-colors"
              >
                <Download size={15} />
                Export Sekarang
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[rgba(30,28,67,0.04)] rounded-2xl border border-[rgba(30,28,67,0.08)] px-5 py-4">
            <p className="text-[11.5px] font-bold text-[#1E1C43] mb-2 uppercase tracking-wide">Tips Backup</p>
            <ul className="space-y-1.5 text-[11.5px] text-text-muted">
              <li className="flex items-start gap-1.5"><span className="text-[#1E1C43] font-bold mt-0.5">•</span>Lakukan backup bulanan setiap awal bulan</li>
              <li className="flex items-start gap-1.5"><span className="text-[#1E1C43] font-bold mt-0.5">•</span>Simpan file Excel untuk analisa data</li>
              <li className="flex items-start gap-1.5"><span className="text-[#1E1C43] font-bold mt-0.5">•</span>Gunakan PDF untuk laporan ke manajemen</li>
              <li className="flex items-start gap-1.5"><span className="text-[#1E1C43] font-bold mt-0.5">•</span>Export "Semua Data" setiap akhir tahun</li>
              <li className="flex items-start gap-1.5"><span className="text-[#1E1C43] font-bold mt-0.5">•</span>Leads tidak disertakan secara default</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Riwayat Export ────────────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-text-muted" />
            <h2 className="text-[15px] font-bold text-text-primary">Riwayat Export</h2>
          </div>
          <span className="text-[12px] text-text-muted">{riwayat.length} export tercatat</span>
        </div>

        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  {['Tanggal Export','Periode','Modul / Item','Format','Ukuran File','Diexport Oleh','Aksi'].map(h => (
                    <th key={h} className="bg-gray-50 px-3 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-left whitespace-nowrap border-b border-gray-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riwayat.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <p className="text-xs font-medium text-gray-900">{r.tglExport}</p>
                      <p className="text-[11px] text-text-muted">{r.id}</p>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{r.periode}</td>
                    <td className="px-3 py-2.5 max-w-[220px]">
                      <div className="flex flex-col gap-1">
                        {r.modul.map((m, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[rgba(30,28,67,0.07)] text-[#1E1C43] w-fit">
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {r.format === 'excel' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <Table2 size={10} />Excel
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-accent">
                          <FileText size={10} />PDF
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{r.ukuran}</td>
                    <td className="px-3 py-2.5 text-xs font-normal text-gray-600 whitespace-nowrap">{r.exportedBy}</td>
                    <td className="px-3 py-2.5">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-text-muted hover:border-[#1E1C43] hover:text-[#1E1C43] transition-colors whitespace-nowrap">
                        <Download size={12} />Download ulang
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <ProgressModal
          format={format}
          onClose={() => setModal(false)}
          onDownload={handleDownload}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2.5 bg-[#1E1C43] text-white text-[13px] font-semibold px-5 py-3 rounded-xl shadow-xl">
          <CheckCircle size={15} className="text-green-400 shrink-0" />
          File siap didownload — dicatat di Riwayat Export
        </div>
      )}
    </div>
  )
}
