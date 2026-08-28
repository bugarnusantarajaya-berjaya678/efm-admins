import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Bell, ChevronRight, User, Settings, LogOut, Menu } from 'lucide-react'
import { useBreadcrumb } from '../../context/BreadcrumbContext'

/* ── Route breadcrumb labels ─────────────────────────────────────────────── */
const routeLabels = {
  '/dashboard':         ['Dashboard'],
  '/dashboard/owner':   ['Dashboard', 'Owner'],
  '/pic':               ['Operasional', 'PIC Management'],
  '/ops/pelatih/kontrak': ['Operasional', 'Kontrak PKS'],
  '/ops/mitra':         ['Operasional', 'Mitra'],
  '/ops/assets':        ['Operasional', 'Aset'],
  '/pp/dashboard':      ['Private Program', 'Dashboard'],
  '/pp/leads':          ['Private Program', 'Leads'],
  '/pp/orders':         ['Private Program', 'Orders'],
  '/pp/program-db':                  ['Private Program', 'Program Database'],
  '/pp/screening':      ['Private Program', 'Screening Klien'],
  '/pp/documents':      ['Private Program', 'Dokumen'],
  '/pp/invoice':        ['Private Program', 'Invoice'],
  '/pp/receipt':        ['Private Program', 'Receipt'],
  '/b2b/dashboard':     ['B2B', 'Dashboard'],
  '/b2b/leads':         ['B2B', 'Leads'],
  '/b2b/survei':        ['B2B', 'Survei'],
  '/b2b/orders':        ['B2B', 'Orders'],
  '/b2b/kalender':      ['B2B', 'Kalender'],
  '/b2b/invoice':       ['B2B', 'Invoice'],
  '/b2b/receipt':       ['B2B', 'Receipt'],
  '/event':             ['Event', 'Dashboard'],
  '/event/dashboard':   ['Event', 'Dashboard'],
  '/event/leads':       ['Event', 'Leads'],
  '/event/konsultasi':  ['Event', 'Konsultasi'],
  '/event/orders':      ['Event', 'Orders'],
  '/event/kalender':    ['Event', 'Kalender'],
  '/event/invoice':     ['Event', 'Invoice'],
  '/event/receipt':     ['Event', 'Receipt'],
  '/attendance':        ['Operasional', 'Absensi'],
  '/payment':           ['Operasional', 'Pembayaran'],
  '/laporan/revenue':   ['Laporan', 'Ringkasan Revenue'],
  '/laporan/penjualan': ['Laporan', 'Penjualan'],
  '/laporan/laba':      ['Laporan', 'Laba & Biaya'],
  '/laporan/export':    ['Laporan', 'Export & Backup'],
  '/settings':          ['Pengaturan'],
}

/* ── Linked breadcrumbs for sub-database pages ───────────────────────────── */
const routeLinkedCrumbs = {
  '/pp/documents': [
    { label: 'Private Program', path: '/pp/dashboard' },
    { label: 'Orders', path: '/pp/orders' },
    { label: 'Agreement' },
  ],
  '/pp/invoice': [
    { label: 'Private Program', path: '/pp/dashboard' },
    { label: 'Orders', path: '/pp/orders' },
    { label: 'Invoice' },
  ],
  '/pp/receipt': [
    { label: 'Private Program', path: '/pp/dashboard' },
    { label: 'Orders', path: '/pp/orders' },
    { label: 'Receipt' },
  ],
  '/pp/screening': [
    { label: 'Private Program', path: '/pp/dashboard' },
    { label: 'Orders', path: '/pp/orders' },
    { label: 'Assessment' },
  ],
}

/* ── Dummy notifications ─────────────────────────────────────────────────── */
const TYPE_DOT = { order: 'bg-blue-500', payment: 'bg-green-500', alert: 'bg-orange-400' }

const NOTIF_INIT = [
  { id: 1, type: 'order',   message: 'Order baru PP-8043 masuk',                        time: '5 menit lalu', path: '/pp/orders',  read: false },
  { id: 2, type: 'payment', message: 'Pembayaran Invoice B2B-INV-001 diterima',          time: '1 jam lalu',   path: '/b2b/invoice',read: false },
  { id: 3, type: 'alert',   message: 'Sesi PP-8040 dijadwalkan hari ini jam 07:00',      time: '2 jam lalu',   path: '/pp/orders',  read: true  },
  { id: 4, type: 'order',   message: 'Lead baru masuk: Rina Kartika',                   time: 'Kemarin',      path: '/pp/leads',   read: true  },
]

/* ── Topbar ──────────────────────────────────────────────────────────────── */
export default function Topbar({ onMenuToggle }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { crumbs: contextCrumbs } = useBreadcrumb()
  const crumbs = contextCrumbs ?? routeLabels[pathname] ?? ['Dashboard']
  const linkedCrumbs = routeLinkedCrumbs[pathname] ?? null

  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen,  setUserOpen]  = useState(false)
  const [notifs,    setNotifs]    = useState(NOTIF_INIT)

  const notifRef = useRef(null)
  const userRef  = useRef(null)

  const unread = notifs.filter(n => !n.read).length

  /* Close dropdowns on outside click */
  useEffect(() => {
    function onMouseDown(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function toggleNotif() { setNotifOpen(v => !v); setUserOpen(false) }
  function toggleUser()  { setUserOpen(v => !v);  setNotifOpen(false) }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  function handleNotifClick(notif) {
    setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))
    setNotifOpen(false)
    navigate(notif.path)
  }

  function handleLogout() {
    localStorage.removeItem('efm_role')
    localStorage.removeItem('efm_nama')
    setUserOpen(false)
    navigate('/login')
  }

  return (
    <header className="h-14 bg-bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 relative z-40">

      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden w-9 h-9 rounded-lg hover:bg-bg-page flex items-center justify-center transition-colors shrink-0"
        >
          <Menu size={20} className="text-text-muted" />
        </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 md:gap-1.5 text-sm min-w-0 overflow-hidden">
        {linkedCrumbs
          ? linkedCrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 md:gap-1.5 shrink-0 last:shrink last:min-w-0">
                {i > 0 && <ChevronRight size={13} className="text-text-muted shrink-0" />}
                {crumb.path
                  ? <Link to={crumb.path} className="truncate text-text-muted hidden sm:inline hover:text-text-primary transition-colors">{crumb.label}</Link>
                  : <span className="font-semibold text-text-primary truncate">{crumb.label}</span>
                }
              </span>
            ))
          : crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 md:gap-1.5 shrink-0 last:shrink last:min-w-0">
                {i > 0 && <ChevronRight size={13} className="text-text-muted shrink-0" />}
                <span className={`truncate ${i === crumbs.length - 1 ? 'font-semibold text-text-primary' : 'text-text-muted hidden sm:inline'}`}>
                  {crumb}
                </span>
              </span>
            ))
        }
      </nav>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotif}
            className="relative w-9 h-9 rounded-full hover:bg-bg-page flex items-center justify-center transition-colors"
          >
            <Bell size={18} className="text-text-muted" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-accent text-white text-[9px] font-bold px-0.5 leading-none">
                {unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-11 w-[min(370px,calc(100vw-1rem))] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-text-primary">Notifikasi</h3>
                  {unread > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-accent text-white text-[10px] font-bold">
                      {unread}
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11.5px] font-semibold text-[#1E1C43] hover:text-accent transition-colors"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              {/* List */}
              <div className="divide-y divide-gray-50 max-h-[340px] overflow-y-auto">
                {notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    className={`w-full flex items-start gap-3.5 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors ${n.read ? 'opacity-60' : ''}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${TYPE_DOT[n.type] ?? 'bg-gray-400'} shrink-0 mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-snug ${n.read ? 'text-text-muted font-normal' : 'text-text-primary font-semibold'}`}>
                        {n.message}
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100">
                <button className="w-full text-center text-sm text-[#1E1C43] font-medium py-3 hover:bg-gray-50 transition-colors">
                  Lihat semua notifikasi →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* ── User Avatar Menu ── */}
        <div className="relative" ref={userRef}>
          <button
            onClick={toggleUser}
            className="flex items-center gap-2.5 hover:bg-bg-page rounded-xl px-2 py-1.5 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-text-primary leading-tight">Bagoes S.</p>
              <p className="text-[10px] text-text-muted leading-tight">Owner</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">BS</span>
            </div>
          </button>

          {/* User dropdown */}
          {userOpen && (
            <div className="absolute right-0 top-12 w-[220px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Identity */}
              <div className="px-4 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1E1C43] flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">BS</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-text-primary leading-tight">Bagoes Soeharto</p>
                    <p className="text-[11px] text-gray-500 leading-tight">Owner</p>
                    <p className="text-[11px] text-gray-400 leading-tight truncate">essentialfitnessmanagement@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  onClick={() => { setUserOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-text-primary hover:bg-gray-50 transition-colors"
                >
                  <User size={14} className="text-text-muted shrink-0" />
                  Profil Saya
                </button>
                <button
                  onClick={() => { setUserOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-text-primary hover:bg-gray-50 transition-colors"
                >
                  <Settings size={14} className="text-text-muted shrink-0" />
                  Pengaturan
                </button>
              </div>

              <div className="border-t border-gray-100 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} className="shrink-0" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
