import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '../../context/BreadcrumbContext'
import { ArrowLeft, UserPlus, Users } from 'lucide-react'
import { addStoredLead, getNextLeadId } from '../../data/ppLeadsStore'
import { addStoredKlien, getNextKlienId } from '../../data/ppKlienStore'
import { PIC_OPTS } from '../../data/ppProgramDBData'
import { getStoredJenis } from '../../data/ppJenisStore'

const SUMBER_OPTS = ['Website','Referral','Meta Ads','Google Ads','Walk-in','Instagram','LinkedIn','Lainnya']
const SAPAAN_OPTS = ['Kak','Mas','Mbak','Pak','Bu']
const HUBUNGAN_OPTS = ['Diri Sendiri','Pasangan','Orang Tua','Anak','Saudara','Lainnya']
const JK_OPTS = ['Laki-laki','Perempuan']

const EMPTY_FORM = {
  nama: '',
  sapaan: 'Kak',
  tipe: 'Personal',
  hubunganDenganKlien: 'Diri Sendiri',
  noHp: '',
  emailUmum: '',
  programDiminati: '',
  sumberLead: '',
  picEfm: 'Sarah Jenkins',
  catatanAwal: '',
}

const EMPTY_KLIEN = { sapaan: 'Kak', nama: '', jenisKelamin: '', tanggalLahir: '', noHp: '', email: '' }

export default function PPLeadNewPage() {
  const navigate = useNavigate()
  useBreadcrumb([
    { label: 'Private Program' },
    { label: 'Leads', to: '/pp/leads' },
    { label: 'Lead Baru' },
  ])

  const [form, setForm]         = useState(EMPTY_FORM)
  const [klienForms, setKlienForms] = useState([{ ...EMPTY_KLIEN }])
  const [errors, setErrors]     = useState({})

  /* Sync jumlah klien forms ke tipe */
  useEffect(() => {
    if (form.tipe === 'Couple') {
      if (klienForms.length < 2) setKlienForms(prev => [...prev, { ...EMPTY_KLIEN }])
    } else {
      if (klienForms.length > 1) setKlienForms(prev => [prev[0]])
    }
  }, [form.tipe])

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  function setKlien(idx, field, value) {
    setKlienForms(prev => prev.map((k, i) => i === idx ? { ...k, [field]: value } : k))
    const key = `klien_${idx}_${field}`
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }))
  }

  /* Apakah perlu form klien terpisah */
  const isDiriSendiri  = form.hubunganDenganKlien === 'Diri Sendiri'
  const isCouple       = form.tipe === 'Couple'
  /* Couple selalu punya klien terpisah. Non-couple hanya kalau bukan diri sendiri */
  const showKlienForms = isCouple || !isDiriSendiri

  function validate() {
    const e = {}
    if (!form.nama.trim())        e.nama            = 'Nama pendaftar wajib diisi'
    if (!form.noHp.trim())        e.noHp            = 'No HP wajib diisi'
    if (!form.emailUmum.trim())   e.emailUmum       = 'Email wajib diisi'
    if (!form.programDiminati)    e.programDiminati = 'Program diminati wajib dipilih'
    if (!form.sumberLead)         e.sumberLead      = 'Sumber lead wajib dipilih'

    if (showKlienForms) {
      klienForms.forEach((k, idx) => {
        const label = isCouple ? `Klien ${idx + 1}` : 'Klien Latihan'
        if (!k.nama.trim()) e[`klien_${idx}_nama`] = `Nama ${label} wajib diisi`
      })
    }
    return e
  }

  function handleSimpan() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    const newLeadId = getNextLeadId()

    /* Buat record klien */
    const createdKlienIds = []

    if (!showKlienForms) {
      /* Diri Sendiri — klien = pendaftar itu sendiri */
      const klienId = getNextKlienId()
      addStoredKlien({
        id: klienId,
        leadId: newLeadId,
        sapaan: form.sapaan,
        nama: form.nama.trim(),
        jenisKelamin: '',
        tanggalLahir: '',
        noHp: form.noHp.trim(),
        email: form.emailUmum.trim(),
        infoKesehatan: { sudahDiisi: false },
      })
      createdKlienIds.push(klienId)
    } else {
      /* Klien terpisah dari pendaftar (atau Couple) */
      klienForms.forEach(k => {
        const klienId = getNextKlienId()
        addStoredKlien({
          id: klienId,
          leadId: newLeadId,
          sapaan: k.sapaan,
          nama: k.nama.trim(),
          jenisKelamin: k.jenisKelamin,
          tanggalLahir: k.tanggalLahir,
          noHp: k.noHp.trim(),
          email: k.email.trim(),
          infoKesehatan: { sudahDiisi: false },
        })
        createdKlienIds.push(klienId)
      })
    }

    /* Buat record lead */
    addStoredLead({
      id: newLeadId,
      nama: form.nama.trim(),
      sapaan: form.sapaan,
      tipe: form.tipe,
      hubunganDenganKlien: form.hubunganDenganKlien,
      noHp: form.noHp.trim(),
      emailUmum: form.emailUmum.trim(),
      programDiminati: form.programDiminati,
      sumberLead: form.sumberLead,
      picEfm: form.picEfm,
      klienIds: createdKlienIds,
      statusPipeline: 'New',
      tanggalMasuk: today,
      tanggalFollowUp: null,
      catatan: '',
      logAktivitas: [{ tanggal: today, status: 'New', catatan: form.catatanAwal || 'Lead baru ditambahkan', oleh: form.picEfm }],
    })

    navigate('/pp/leads')
  }

  const inputCls = (key) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1E1C43] transition-colors ${errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`

  const klienInputCls = (key) =>
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
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Private Program</p>
              <h1 className="text-lg font-bold text-[#1E1C43] leading-tight">Lead Baru</h1>
              <p className="text-xs text-gray-400 mt-1">Tambah prospek klien Private Program baru</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/pp/leads')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={12} /> Kembali
          </button>
        </div>
      </div>

      <div className="space-y-4">

        {/* Section 1: Informasi Pendaftar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-1">Informasi Pendaftar</h3>
          <p className="text-xs text-gray-400 mb-4 pl-4">Siapa yang mendaftar dan akan membayar program</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Nama Pendaftar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nama}
                onChange={e => set('nama', e.target.value)}
                placeholder="Nama lengkap pendaftar"
                className={inputCls('nama')}
              />
              {errors.nama && <p className="text-red-500 text-[10px] mt-1">{errors.nama}</p>}
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Sapaan</label>
              <select value={form.sapaan} onChange={e => set('sapaan', e.target.value)} className={inputCls('sapaan')}>
                {SAPAAN_OPTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tipe</label>
              <select value={form.tipe} onChange={e => set('tipe', e.target.value)} className={inputCls('tipe')}>
                <option>Personal</option>
                <option>Group</option>
                <option>Couple</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Hubungan dengan Klien yang Berlatih
              </label>
              <select value={form.hubunganDenganKlien} onChange={e => set('hubunganDenganKlien', e.target.value)} className={inputCls('hubunganDenganKlien')}>
                {HUBUNGAN_OPTS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                No HP / WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.noHp}
                onChange={e => set('noHp', e.target.value)}
                placeholder="08xx-xxxx-xxxx"
                className={inputCls('noHp')}
              />
              {errors.noHp && <p className="text-red-500 text-[10px] mt-1">{errors.noHp}</p>}
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.emailUmum}
                onChange={e => set('emailUmum', e.target.value)}
                placeholder="email@example.com"
                className={inputCls('emailUmum')}
              />
              {errors.emailUmum && <p className="text-red-500 text-[10px] mt-1">{errors.emailUmum}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Data Klien Latihan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3">Data Klien Latihan</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4 pl-4">
            {isCouple
              ? 'Couple — isi data kedua klien yang akan berlatih bersama'
              : 'Siapa yang akan berlatih (bisa sama atau berbeda dari pendaftar)'}
          </p>

          {!showKlienForms ? (
            /* Diri Sendiri — auto dari pendaftar */
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#1E1C43]/10 flex items-center justify-center shrink-0">
                <Users size={14} className="text-[#1E1C43]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1E1C43]">Klien sama dengan pendaftar</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Data klien akan diisi otomatis dari informasi pendaftar. Anda bisa melengkapi data kesehatan & profil klien dari halaman Lead Detail setelah lead disimpan.
                </p>
              </div>
            </div>
          ) : (
            /* Form klien terpisah */
            <div className="space-y-5">
              {klienForms.map((klien, idx) => (
                <div key={idx} className={klienForms.length > 1 ? 'border border-gray-100 rounded-xl p-4' : ''}>
                  {klienForms.length > 1 && (
                    <p className="text-xs font-bold text-[#1E1C43] mb-3">Klien {idx + 1}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                        Nama Klien {isCouple ? `${idx + 1}` : ''} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={klien.nama}
                        onChange={e => setKlien(idx, 'nama', e.target.value)}
                        placeholder="Nama lengkap klien"
                        className={klienInputCls(`klien_${idx}_nama`)}
                      />
                      {errors[`klien_${idx}_nama`] && (
                        <p className="text-red-500 text-[10px] mt-1">{errors[`klien_${idx}_nama`]}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Sapaan</label>
                      <select value={klien.sapaan} onChange={e => setKlien(idx, 'sapaan', e.target.value)} className={klienInputCls(`klien_${idx}_sapaan`)}>
                        {SAPAAN_OPTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Jenis Kelamin</label>
                      <select value={klien.jenisKelamin} onChange={e => setKlien(idx, 'jenisKelamin', e.target.value)} className={klienInputCls(`klien_${idx}_jenisKelamin`)}>
                        <option value="">Pilih...</option>
                        {JK_OPTS.map(j => <option key={j}>{j}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={klien.tanggalLahir}
                        onChange={e => setKlien(idx, 'tanggalLahir', e.target.value)}
                        className={klienInputCls(`klien_${idx}_tanggalLahir`)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">No HP Klien</label>
                      <input
                        type="text"
                        value={klien.noHp}
                        onChange={e => setKlien(idx, 'noHp', e.target.value)}
                        placeholder="08xx-xxxx-xxxx"
                        className={klienInputCls(`klien_${idx}_noHp`)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Email Klien</label>
                      <input
                        type="email"
                        value={klien.email}
                        onChange={e => setKlien(idx, 'email', e.target.value)}
                        placeholder="email@example.com"
                        className={klienInputCls(`klien_${idx}_email`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Program & Sumber */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#1E1C43] border-l-4 border-[#E05945] pl-3 mb-4">Program &amp; Sumber</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Program Diminati <span className="text-red-500">*</span>
              </label>
              <select value={form.programDiminati} onChange={e => set('programDiminati', e.target.value)} className={inputCls('programDiminati')}>
                <option value="">Pilih Program...</option>
                {getStoredJenis().filter(j => j.status === 'aktif').map(j => <option key={j.nama}>{j.nama}</option>)}
                <option>Lainnya</option>
              </select>
              {errors.programDiminati && <p className="text-red-500 text-[10px] mt-1">{errors.programDiminati}</p>}
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
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">PIC EFM</label>
              <select value={form.picEfm} onChange={e => set('picEfm', e.target.value)} className={inputCls('picEfm')}>
                {PIC_OPTS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Catatan Awal */}
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

      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 z-40">
        <button
          onClick={() => navigate('/pp/leads')}
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
