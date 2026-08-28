import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { addStoredLead, getNextLeadId } from '../../data/eventLeadsStore'

const TIPE_OPTS   = ['Corporate','Foundation','Government','Brand','Community','Private','Individual']
const SUMBER_OPTS = ['Referral','Cold Email','Google / Web','LinkedIn','Instagram','Walk-in','Existing Client','Lainnya']
const PIC_OPTS    = ['Bagoes','Emma','Lainnya']

const EMPTY_FORM = {
  namaKlien: '', tipeKlien: 'Corporate', kota: '', emailUmum: '',
  namaEvent: '', jenisEvent: '',
  sumberLead: '', picSalesEFM: 'Bagoes', catatanAwal: '',
  teleponUmum: '', alamatLengkap: '', linkGoogleMaps: '',
  namaKoordinator: '', jabatanKoordinator: '', waKoordinator: '', emailKoordinator: '',
}

export default function EventLeadNewPage() {
  const navigate = useNavigate()
  useBreadcrumb([
    { label: 'Event Management' },
    { label: 'Leads', to: '/event/leads' },
    { label: 'Lead Baru' },
  ])

  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.namaKlien.trim())  e.namaKlien  = 'Nama klien wajib diisi'
    if (!form.kota.trim())       e.kota        = 'Kota wajib diisi'
    if (!form.emailUmum.trim())  e.emailUmum   = 'Email wajib diisi'
    if (!form.sumberLead)        e.sumberLead  = 'Sumber lead wajib dipilih'
    return e
  }

  function handleSimpan() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const today = new Date().toISOString().split('T')[0]
    const newId = getNextLeadId()
    addStoredLead({
      id: newId,
      namaKlien: form.namaKlien.trim(),
      tipeKlien: form.tipeKlien,
      kota: form.kota.trim(),
      emailUmum: form.emailUmum.trim(),
      namaEvent: form.namaEvent.trim(),
      jenisEvent: form.jenisEvent.trim(),
      sumberLead: form.sumberLead,
      picSalesEFM: form.picSalesEFM,
      catatanAwal: form.catatanAwal.trim(),
      teleponUmum: form.teleponUmum.trim(),
      alamatLengkap: form.alamatLengkap.trim(),
      linkGoogleMaps: form.linkGoogleMaps.trim(),
      namaKoordinator: form.namaKoordinator.trim(),
      jabatanKoordinator: form.jabatanKoordinator.trim(),
      waKoordinator: form.waKoordinator.trim(),
      emailKoordinator: form.emailKoordinator.trim(),
      stage: 'New',
      tanggal: today,
      konsultasiId: null,
      orderId: null,
      logAktivitas: [{
        tanggal: today,
        stage: 'New',
        catatan: form.catatanAwal.trim() || 'Lead baru ditambahkan',
        picEFM: form.picSalesEFM,
      }],
    })
    navigate('/event/leads')
  }

  const inputCls = key =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] transition-colors ${errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`

  return (
    <div className="bg-[#F5F5F7] min-h-screen pb-24">

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
              <UserPlus size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Event Management</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Lead Baru</h1>
              <p className="text-xs text-gray-400 mt-1">Tambah prospek klien Event Management baru</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/event/leads')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E05945] hover:bg-[#c94a38] text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
        </div>
      </div>

      <div className="space-y-4">

        {/* Section 1: Informasi Lead */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Informasi Lead</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Nama Klien / Penyelenggara <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.namaKlien} onChange={e => set('namaKlien', e.target.value)}
                placeholder="PT. / Yayasan / Komunitas / Dinas..."
                className={inputCls('namaKlien')} />
              {errors.namaKlien && <p className="text-red-500 text-[10px] mt-1">{errors.namaKlien}</p>}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tipe Klien</label>
              <select value={form.tipeKlien} onChange={e => set('tipeKlien', e.target.value)} className={inputCls('tipeKlien')}>
                {TIPE_OPTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Sumber Lead <span className="text-red-500">*</span>
              </label>
              <select value={form.sumberLead} onChange={e => set('sumberLead', e.target.value)} className={inputCls('sumberLead')}>
                <option value="">Pilih Sumber...</option>
                {SUMBER_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
              {errors.sumberLead && <p className="text-red-500 text-[10px] mt-1">{errors.sumberLead}</p>}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Kota / Area <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.kota} onChange={e => set('kota', e.target.value)}
                placeholder="Jakarta Selatan"
                className={inputCls('kota')} />
              {errors.kota && <p className="text-red-500 text-[10px] mt-1">{errors.kota}</p>}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">PIC Sales EFM</label>
              <select value={form.picSalesEFM} onChange={e => set('picSalesEFM', e.target.value)} className={inputCls('picSalesEFM')}>
                {PIC_OPTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Email Umum <span className="text-red-500">*</span>
                <span className="ml-2 text-gray-400 normal-case font-normal">untuk kirim compro/proposal</span>
              </label>
              <input type="email" value={form.emailUmum} onChange={e => set('emailUmum', e.target.value)}
                placeholder="info@perusahaan.co.id"
                className={inputCls('emailUmum')} />
              {errors.emailUmum && <p className="text-red-500 text-[10px] mt-1">{errors.emailUmum}</p>}
            </div>

          </div>
        </div>

        {/* Section 2: Detail Event */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Detail Event yang Diminati</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nama Event / Tema</label>
              <input type="text" value={form.namaEvent} onChange={e => set('namaEvent', e.target.value)}
                placeholder="Health Run for Hope 2026, Corporate Fun Day..."
                className={inputCls('namaEvent')} />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Jenis Event</label>
              <input type="text" value={form.jenisEvent} onChange={e => set('jenisEvent', e.target.value)}
                placeholder="Fun Run, Exhibition, Corporate Sports Day..."
                className={inputCls('jenisEvent')} />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">No. Telepon Umum</label>
              <input type="text" value={form.teleponUmum} onChange={e => set('teleponUmum', e.target.value)}
                placeholder="021-xxxx"
                className={inputCls('teleponUmum')} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Alamat / Lokasi Event</label>
              <input type="text" value={form.alamatLengkap} onChange={e => set('alamatLengkap', e.target.value)}
                placeholder="Jl. Nama Jalan No. XX / Nama Venue"
                className={inputCls('alamatLengkap')} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Link Google Maps</label>
              <input type="url" value={form.linkGoogleMaps} onChange={e => set('linkGoogleMaps', e.target.value)}
                placeholder="https://maps.google.com/..."
                className={inputCls('linkGoogleMaps')} />
            </div>

          </div>
        </div>

        {/* Section 3: Catatan Awal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Catatan Awal</h3>
          <textarea
            value={form.catatanAwal}
            onChange={e => set('catatanAwal', e.target.value)}
            rows={4}
            placeholder="Sumber lead, konteks awal, atau catatan penting lainnya..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] transition-colors resize-none"
          />
        </div>

        {/* Section 4: Kontak Koordinator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Kontak Koordinator Klien</h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Opsional — dapat diisi nanti</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Nama Koordinator / PIC Klien</label>
              <input type="text" value={form.namaKoordinator} onChange={e => set('namaKoordinator', e.target.value)}
                placeholder="Nama lengkap"
                className={inputCls('namaKoordinator')} />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Jabatan Koordinator</label>
              <input type="text" value={form.jabatanKoordinator} onChange={e => set('jabatanKoordinator', e.target.value)}
                placeholder="HR Manager, Program Director..."
                className={inputCls('jabatanKoordinator')} />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">No. WA Koordinator</label>
              <input type="text" value={form.waKoordinator} onChange={e => set('waKoordinator', e.target.value)}
                placeholder="08xx-xxxx-xxxx"
                className={inputCls('waKoordinator')} />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Email Koordinator</label>
              <input type="email" value={form.emailKoordinator} onChange={e => set('emailKoordinator', e.target.value)}
                placeholder="koordinator@perusahaan.co.id"
                className={inputCls('emailKoordinator')} />
            </div>

          </div>
        </div>

      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 z-40">
        <button
          onClick={() => navigate('/event/leads')}
          className="border border-gray-200 text-gray-600 text-sm px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={handleSimpan}
          className="bg-[#1E1C43] hover:bg-[#2d2b5e] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Simpan Lead
        </button>
      </div>

    </div>
  )
}
