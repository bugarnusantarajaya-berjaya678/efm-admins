import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Lock, CheckSquare, Building2, Shield, Plus, Edit2, X } from 'lucide-react'

/* ── Left-nav config ── */
const NAV_ITEMS = [
  { key: 'users',    label: 'Manajemen User',  icon: Users    },
  { key: 'access',   label: 'Hak Akses',       icon: Lock     },
  { key: 'approval', label: 'Approval Flow',   icon: CheckSquare },
  null, // divider
  { key: 'company',  label: 'Info Perusahaan', icon: Building2 },
  { key: 'security', label: 'Keamanan',        icon: Shield   },
]

/* ── Access matrix rows ── */
const ACCESS_ROWS = [
  { label: 'Lihat semua modul',           sub: 'PP, B2B, Event, Ops',                   defaultOn: true  },
  { label: 'Buat & edit invoice (Draft)',  sub: '',                                       defaultOn: true  },
  { label: 'Kirim invoice ke klien',       sub: 'Memerlukan approval Owner',              defaultOn: false },
  { label: 'Input bukti pembayaran',       sub: '',                                       defaultOn: true  },
  { label: 'Approve pembayaran (Paid)',    sub: 'Memerlukan approval Owner',              defaultOn: false },
  { label: 'Lihat halaman Revenue',        sub: '',                                       defaultOn: false },
  { label: 'Hapus data',                   sub: '',                                       defaultOn: false },
  { label: 'Akses Settings',              sub: '',                                       defaultOn: false },
]

/* ── Badge component ── */
function Badge({ type }) {
  const map = {
    owner: 'bg-orange-50 text-accent',
    admin: 'bg-[rgba(30,28,67,0.08)] text-text-primary',
    aktif: 'bg-green-50 text-green-600',
  }
  const label = { owner: 'Owner', admin: 'Admin', aktif: 'Aktif' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${map[type] || 'bg-gray-100 text-gray-500'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label[type] || type}
    </span>
  )
}

/* ── Toggle switch ── */
function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${on ? 'bg-green-500' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-all duration-200 ${on ? 'left-[19px]' : 'left-[3px]'}`} />
    </button>
  )
}

/* ── Card wrapper ── */
function Card({ header, subHeader, action, children }) {
  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 overflow-hidden mb-5">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-text-primary">{header}</h3>
          {subHeader && <p className="text-[12px] text-text-muted mt-0.5">{subHeader}</p>}
        </div>
        {action}
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

/* ── Alert ── */
function Alert({ type, children }) {
  const cls = type === 'warning'
    ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400'
    : 'bg-blue-50 text-blue-700 border-l-4 border-blue-400'
  return <div className={`${cls} px-4 py-3.5 rounded-xl text-[13px] mb-5 leading-relaxed`}>{children}</div>
}

/* ── Add User Modal ── */
function AddUserModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <h3 className="text-[16px] font-bold text-text-primary">Tambah User Baru</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-text-muted hover:border-text-primary transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Nama <span className="text-accent">*</span></label>
              <input type="text" placeholder="Nama lengkap" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Email <span className="text-accent">*</span></label>
              <input type="email" placeholder="email@gmail.com" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Role <span className="text-accent">*</span></label>
              <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
                <option>Admin</option>
                <option>Owner</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-muted border border-gray-200 rounded-lg hover:border-text-primary transition-colors">Batal</button>
            <button onClick={onClose} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Tambah User</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Panel: Manajemen User ── */
function PanelUsers() {
  const [showAdd, setShowAdd] = useState(false)
  const TABLE_H = ['Nama', 'Email', 'Role', 'Status', 'Terakhir Login', 'Actions']
  const users = [
    { nama: 'Bagoes', sub: 'Owner EFM', email: 'bugarnusantarajaya@gmail.com', role: 'owner', status: 'aktif', login: 'Hari ini',  actions: false },
    { nama: 'Admin EFM', sub: 'Staff Operasional', email: 'essentialfitnessmanagement@gmail.com', role: 'admin', status: 'aktif', login: 'Kemarin', actions: true },
  ]
  return (
    <>
      <Card
        header="Manajemen User"
        subHeader="Kelola akun yang bisa akses EFM Portal"
        action={
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">
            <Plus size={14} />Tambah User
          </button>
        }
      >
        <div className="-mx-6 -mb-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{TABLE_H.map(h => <th key={h} className="bg-gray-50 px-5 py-3 text-[11px] font-semibold text-text-muted text-left uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-4 border-t border-gray-100">
                    <p className="text-[13px] font-bold text-text-primary">{u.nama}</p>
                    <p className="text-[11px] text-text-muted">{u.sub}</p>
                  </td>
                  <td className="px-5 py-4 border-t border-gray-100 text-[13px] text-text-muted">{u.email}</td>
                  <td className="px-5 py-4 border-t border-gray-100"><Badge type={u.role} /></td>
                  <td className="px-5 py-4 border-t border-gray-100"><Badge type={u.status} /></td>
                  <td className="px-5 py-4 border-t border-gray-100 text-[13px] text-text-muted">{u.login}</td>
                  <td className="px-5 py-4 border-t border-gray-100">
                    {u.actions ? (
                      <div className="flex gap-1.5">
                        <button className="w-[30px] h-[30px] rounded-lg border-[1.5px] border-gray-200 bg-white inline-flex items-center justify-center text-text-muted hover:border-text-primary hover:text-text-primary transition-colors" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button className="w-[30px] h-[30px] rounded-lg border-[1.5px] border-gray-200 bg-white inline-flex items-center justify-center text-text-muted hover:border-text-primary hover:text-text-primary transition-colors" title="Reset Password">
                          <Lock size={13} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} />}
    </>
  )
}

/* ── Panel: Hak Akses ── */
function PanelAccess() {
  const [toggles, setToggles] = useState(ACCESS_ROWS.map(r => r.defaultOn))
  const toggle = (i, v) => setToggles(prev => prev.map((t, idx) => idx === i ? v : t))

  return (
    <Card header="Matrix Hak Akses" subHeader="Pengaturan akses fitur per role">
      <Alert type="info">Toggle di bawah mengatur apa yang bisa dilakukan Admin. Owner selalu punya akses penuh.</Alert>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Fitur', 'Owner', 'Admin'].map(h => (
              <th key={h} className={`bg-gray-50 px-4 py-2.5 text-[11px] font-semibold text-text-muted uppercase tracking-wide ${h !== 'Fitur' ? 'text-center' : 'text-left'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ACCESS_ROWS.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-3.5 border-b border-gray-100">
                <p className="text-[13px] font-semibold text-text-primary">{row.label}</p>
                {row.sub && <p className="text-[11px] text-text-muted mt-0.5">{row.sub}</p>}
              </td>
              <td className="px-4 py-3.5 border-b border-gray-100 text-center text-green-600 text-[16px] font-bold">✓</td>
              <td className="px-4 py-3.5 border-b border-gray-100">
                <div className="flex justify-center">
                  {/* last 2 rows (Hapus data, Akses Settings) are fixed ✗ for admin */}
                  {i >= ACCESS_ROWS.length - 2 ? (
                    <span className="text-red-500 text-[16px] font-bold">✗</span>
                  ) : (
                    <Toggle on={toggles[i]} onChange={v => toggle(i, v)} />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="flex justify-end mt-5">
        <button className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">
          Simpan Pengaturan
        </button>
      </div>
    </Card>
  )
}

/* ── Panel: Approval Flow ── */
function PanelApproval() {
  return (
    <Card header="Approval Flow" subHeader="Konfigurasi alur persetujuan invoice & pembayaran">
      <Alert type="warning">Semua approval akan dikirim notifikasi ke email Owner.</Alert>
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Approval Invoice</label>
          <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
            <option>Owner harus approve sebelum invoice dikirim</option>
            <option>Admin bisa kirim langsung tanpa approval</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Approval Pembayaran</label>
          <select className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary bg-white">
            <option>Owner harus konfirmasi setiap pembayaran</option>
            <option>Admin bisa konfirmasi sendiri</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Notifikasi Approval ke</label>
          <input type="email" defaultValue="bugarnusantarajaya@gmail.com" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
        </div>
        <div className="flex justify-end pt-2">
          <button className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors">Simpan</button>
        </div>
      </div>
    </Card>
  )
}

/* ── Panel: Info Perusahaan ── */
function PanelCompany() {
  const [companySettings, setCompanySettings] = useState({
    namaBank: 'BCA',
    nomorRekening: '1234567890',
    atasNamaRekening: 'CV. Bugar Nusantara Jaya',
    logoPerusahaan: '',
    tandaTanganCEO: '',
    namaPenandatangan: 'Bagoes Soeharto',
    jabatanPenandatangan: 'Owner & Co-Founder',
  })

  useEffect(() => {
    const saved = localStorage.getItem('efmCompanySettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCompanySettings(prev => ({ ...prev, ...parsed }))
      } catch (_) {}
    }
  }, [])

  function handleSettingsChange(field, value) {
    setCompanySettings(prev => ({ ...prev, [field]: value }))
  }

  function handleImageUpload(field, file) {
    if (!file) return
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan PNG, JPG, atau WEBP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = e => setCompanySettings(prev => ({ ...prev, [field]: e.target.result }))
    reader.readAsDataURL(file)
  }

  function handleRemoveAsset(field) {
    if (window.confirm('Hapus aset ini?')) {
      setCompanySettings(prev => ({ ...prev, [field]: '' }))
    }
  }

  function handleSaveSettings() {
    localStorage.setItem('efmCompanySettings', JSON.stringify(companySettings))
    alert('Pengaturan berhasil disimpan.')
  }

  return (
    <Card header="Informasi Perusahaan" subHeader="Data yang muncul di invoice & dokumen resmi">
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Nama Perusahaan <span className="text-accent">*</span></label>
          <input type="text" defaultValue="Essential Fitness Management" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Nama Legal (CV/PT) <span className="text-accent">*</span></label>
          <input type="text" defaultValue="CV. Bugar Nusantara Jaya" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Alamat <span className="text-accent">*</span></label>
          <input type="text" defaultValue="Jl. Terogong Raya No.18, Jakarta Selatan" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Email Operasional</label>
            <input type="email" defaultValue="essentialfitnessmanagement@gmail.com" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-text-primary mb-1.5">No. Telepon</label>
            <input type="text" defaultValue="+62 812-xxxx-xxxx" className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] outline-none focus:border-text-primary" />
          </div>
        </div>

        {/* Divider — Informasi Rekening Bank */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide mb-1">
            Informasi Rekening Bank
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Digunakan otomatis sebagai informasi pembayaran di Invoice
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nama Bank
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                placeholder="BCA / Mandiri / BNI..."
                value={companySettings.namaBank}
                onChange={e => handleSettingsChange('namaBank', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nomor Rekening
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:border-[#1E1C43]"
                placeholder="1234567890"
                value={companySettings.nomorRekening}
                onChange={e => handleSettingsChange('nomorRekening', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Atas Nama Rekening
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                placeholder="CV. Bugar Nusantara Jaya"
                value={companySettings.atasNamaRekening}
                onChange={e => handleSettingsChange('atasNamaRekening', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Aset Dokumen ── */}
        <div className="col-span-2 border-t border-gray-100 pt-5 mt-3">
          <div className="mb-4">
            <p className="text-xs font-bold text-[#1E1C43] uppercase tracking-wide">
              Aset Dokumen
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Logo dan tanda tangan digunakan otomatis pada LOI, Quotation, dan Invoice.
              Ganti aset di sini tanpa perlu coding ulang.
            </p>
          </div>
        </div>

        {/* Logo Perusahaan */}
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Logo Perusahaan
          </label>
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
              {companySettings.logoPerusahaan ? (
                <img src={companySettings.logoPerusahaan} alt="Logo EFM" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl mb-1">🏢</p>
                  <p className="text-[10px] text-gray-400">Belum ada logo</p>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-2">Logo akan muncul di header dokumen LOI, Invoice, dan Quotation.</p>
              <p className="text-[10px] text-gray-400 mb-3">Format: PNG, JPG, WEBP · Maks 2MB · Rekomendasi: PNG transparan</p>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={e => handleImageUpload('logoPerusahaan', e.target.files[0])}
                  />
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-2 border-[#1E1C43] text-[#1E1C43] rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors cursor-pointer">
                    📁 {companySettings.logoPerusahaan ? 'Ganti Logo' : 'Upload Logo'}
                  </span>
                </label>
                {companySettings.logoPerusahaan && (
                  <button
                    onClick={() => handleRemoveAsset('logoPerusahaan')}
                    className="px-3 py-2 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    🗑 Hapus
                  </button>
                )}
              </div>
              {companySettings.logoPerusahaan && (
                <p className="text-[10px] text-green-600 mt-2">✅ Logo tersimpan — akan digunakan di semua dokumen resmi</p>
              )}
            </div>
          </div>
        </div>

        {/* Tanda Tangan CEO / Owner */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tanda Tangan CEO / Owner
          </label>
          <div className="flex items-start gap-6">
            <div className="w-48 h-28 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
              {companySettings.tandaTanganCEO ? (
                <img src={companySettings.tandaTanganCEO} alt="Tanda Tangan" className="w-full h-full object-contain p-3" />
              ) : (
                <div className="text-center">
                  <p className="text-3xl mb-1">✍️</p>
                  <p className="text-[10px] text-gray-400">Belum ada TTD</p>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-2">Tanda tangan akan muncul otomatis pada dokumen yang sudah di-approve Owner.</p>
              <p className="text-[10px] text-gray-400 mb-3">Format: PNG transparan sangat direkomendasikan · Maks 2MB</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-[10px] text-amber-700">
                  💡 Tips: Tanda tangan di kertas putih → foto/scan → hapus background di <strong>remove.bg</strong> → simpan PNG transparan
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={e => handleImageUpload('tandaTanganCEO', e.target.files[0])}
                  />
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-2 border-[#1E1C43] text-[#1E1C43] rounded-lg hover:bg-[#1E1C43] hover:text-white transition-colors cursor-pointer">
                    📁 {companySettings.tandaTanganCEO ? 'Ganti TTD' : 'Upload TTD'}
                  </span>
                </label>
                {companySettings.tandaTanganCEO && (
                  <button
                    onClick={() => handleRemoveAsset('tandaTanganCEO')}
                    className="px-3 py-2 text-xs text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    🗑 Hapus
                  </button>
                )}
              </div>
              {companySettings.tandaTanganCEO && (
                <p className="text-[10px] text-green-600 mt-2">✅ TTD tersimpan — akan di-stamp otomatis saat Owner approve dokumen</p>
              )}
            </div>
          </div>
        </div>

        {/* Identitas Penandatangan */}
        <div className="border-t border-gray-100 pt-4 mt-2">
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Identitas Penandatangan
            <span className="ml-2 normal-case font-normal text-gray-400">— Muncul di bawah tanda tangan pada dokumen resmi</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Nama Lengkap Penandatangan</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                placeholder="Bagoes Soeharto"
                value={companySettings.namaPenandatangan || ''}
                onChange={e => handleSettingsChange('namaPenandatangan', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Jabatan Penandatangan</label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#1E1C43]"
                placeholder="Owner & Co-Founder"
                value={companySettings.jabatanPenandatangan || ''}
                onChange={e => handleSettingsChange('jabatanPenandatangan', e.target.value)}
              />
            </div>
          </div>

          {(companySettings.tandaTanganCEO || companySettings.namaPenandatangan) && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">Preview tampilan di dokumen</p>
              <div className="inline-block text-center">
                {companySettings.tandaTanganCEO ? (
                  <img src={companySettings.tandaTanganCEO} alt="TTD Preview" className="h-16 object-contain mb-1" />
                ) : (
                  <div className="h-16 w-40 border-b-2 border-gray-400 mb-1" />
                )}
                <p className="text-xs font-bold text-gray-800">{companySettings.namaPenandatangan || 'Nama Penandatangan'}</p>
                <p className="text-[10px] text-gray-500">{companySettings.jabatanPenandatangan || 'Jabatan'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-lg transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </Card>
  )
}

/* ── Panel: Keamanan ── */
function PanelSecurity() {
  const navigate = useNavigate()
  function handleLogout() {
    localStorage.removeItem('efm_role')
    localStorage.removeItem('efm_nama')
    navigate('/login')
  }
  return (
    <Card header="Keamanan Akun" subHeader="Pengaturan keamanan login & akses">
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Email Owner (Login)</label>
          <input type="email" value="bugarnusantarajaya@gmail.com" disabled className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] bg-gray-50 text-text-muted cursor-not-allowed outline-none" readOnly />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-text-primary mb-1.5">Email Admin (Login)</label>
          <input type="email" value="essentialfitnessmanagement@gmail.com" disabled className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-[13px] bg-gray-50 text-text-muted cursor-not-allowed outline-none" readOnly />
        </div>
        <div className="bg-gray-50 rounded-xl px-5 py-4">
          <p className="text-[12px] font-bold text-text-primary mb-1.5">Catatan Keamanan</p>
          <p className="text-[12px] text-text-muted leading-relaxed">Login menggunakan email terdaftar. Hanya email di atas yang bisa masuk ke sistem. Untuk mengubah email, hubungi developer.</p>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={handleLogout} className="px-5 py-2.5 bg-white text-red-500 border-[1.5px] border-red-400 text-[13px] font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-colors">
            Logout Semua Sesi
          </button>
        </div>
      </div>
    </Card>
  )
}

const PANELS = { users: PanelUsers, access: PanelAccess, approval: PanelApproval, company: PanelCompany, security: PanelSecurity }

/* ── Main Page ── */
export default function SettingsPage() {
  const [activeKey, setActiveKey] = useState('users')
  const ActivePanel = PANELS[activeKey]

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-bold text-text-primary">Settings</h1>
        <p className="text-[13px] text-text-muted mt-1">Pengaturan sistem & manajemen akses — khusus Owner</p>
      </div>

      {/* Two-col layout */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '210px 1fr' }}>
        {/* Left nav */}
        <div className="bg-white rounded-2xl border-[1.5px] border-gray-200 p-2 h-fit sticky top-[88px]">
          {NAV_ITEMS.map((item, i) => {
            if (item === null) return <div key={i} className="h-px bg-gray-100 my-1.5" />
            const Icon = item.icon
            const isActive = activeKey === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActiveKey(item.key)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[rgba(30,28,67,0.08)] text-text-primary font-semibold'
                    : 'text-text-muted hover:bg-gray-50 hover:text-text-primary'
                }`}
              >
                <Icon size={15} className="shrink-0" />
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Right panel */}
        <div>
          <ActivePanel />
        </div>
      </div>
    </div>
  )
}
