import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getCompanySettings } from '../../utils/companySettings'
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Dumbbell, Building2, Building, Calendar,
  Clock, CreditCard, Settings, ChevronRight, ChevronDown,
  BarChart2,
} from 'lucide-react'

const PP_SUB = [
  { label: 'Dashboard',  path: '/pp/dashboard'  },
  { label: 'Leads',      path: '/pp/leads'      },
  { label: 'Orders',     path: '/pp/orders'     },
  { label: 'Agreement',  path: '/pp/documents'  },
  {
    label: 'Program DB', path: '/pp/program-db',
    subKey: 'pp-program-db',
    sub: [
      { label: 'Jenis Program', path: '/pp/program-db/jenis-program' },
    ],
  },
]

const B2B_SUB = [
  { label: 'Dashboard', path: '/b2b/dashboard' },
  { label: 'Leads',     path: '/b2b/leads'     },
  { label: 'Survei',    path: '/b2b/survei'    },
  { label: 'Orders',    path: '/b2b/orders'    },
  { label: 'Kalender',  path: '/b2b/kalender'  },
]

const EVENT_SUB = [
  { label: 'Dashboard',  path: '/event/dashboard'  },
  { label: 'Leads',      path: '/event/leads'      },
  { label: 'Konsultasi', path: '/event/konsultasi' },
  { label: 'Orders',     path: '/event/orders'     },
  { label: 'Kalender',   path: '/event/kalender'   },
]

const LAPORAN_SUB = [
  { label: 'Ringkasan Revenue', path: '/laporan/revenue'   },
  { label: 'Laporan Penjualan', path: '/laporan/penjualan' },
  { label: 'Laba & Biaya',      path: '/laporan/laba'      },
  { label: 'Export Laporan',    path: '/laporan/export'    },
]

const OPS_SUB = [
  { label: 'Pelatih',    path: '/ops/pelatih'           },
  { label: 'Mitra',      path: '/ops/mitra'             },
  { label: 'Aset',       path: '/ops/assets'            },
  { label: 'Absensi',    path: '/ops/pelatih/absensi'   },
  { label: 'Honorarium', path: '/ops/pelatih/honorarium' },
]

const menuGroups = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'PROGRAM',
    items: [
      { label: 'Private Program', path: '/pp',  icon: Dumbbell,  menuKey: 'pp',  sub: PP_SUB  },
      { label: 'B2B Management',  path: '/b2b', icon: Building2, menuKey: 'b2b', sub: B2B_SUB },
      { label: 'Event',           path: '/event', icon: Calendar, menuKey: 'event', sub: EVENT_SUB },
    ],
  },
  {
    label: 'OPERASIONAL',
    items: [
      { label: 'Operasional', path: '/ops/pelatih', icon: Users, menuKey: 'ops', sub: OPS_SUB },
    ],
  },
  {
    label: 'LAPORAN & KEUANGAN',
    items: [
      { label: 'Laporan', path: '/laporan', icon: BarChart2, menuKey: 'laporan', sub: LAPORAN_SUB },
    ],
  },
  {
    label: 'LAINNYA',
    items: [
      { label: 'Pengaturan', path: '/settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const settings = getCompanySettings()
  const isPPRoute      = location.pathname.startsWith('/pp')
  const isB2BRoute     = location.pathname.startsWith('/b2b')
  const isEventRoute   = location.pathname.startsWith('/event')
  const isOpsRoute     = ['/ops/', '/attendance', '/payment'].some(p => location.pathname.startsWith(p))
  const isLaporanRoute = location.pathname.startsWith('/laporan')
  const [openMenu, setOpenMenu] = useState(
    isPPRoute ? 'pp' : isB2BRoute ? 'b2b' : isEventRoute ? 'event' : isOpsRoute ? 'ops' : isLaporanRoute ? 'laporan' : null
  )
  const [openSubMenu, setOpenSubMenu] = useState(
    location.pathname.startsWith('/pp/program-db') ? 'pp-program-db' : null
  )

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="flex flex-col h-screen w-60 shrink-0 bg-primary overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          {settings.logoPerusahaan ? (
            <img src={settings.logoPerusahaan} alt="EFM Logo" className="w-full h-full object-contain p-0.5" />
          ) : (
            <span className="text-white font-bold text-xs">EFM</span>
          )}
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">EFM Portal</p>
          <p className="text-white/40 text-[10px] leading-tight">Admin Dashboard</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold tracking-widest text-text-muted uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                const isOpen = item.menuKey && openMenu === item.menuKey

                if (item.sub) {
                  return (
                    <li key={item.path}>
                      {/* Expandable parent */}
                      <button
                        onClick={() => setOpenMenu(prev => prev === item.menuKey ? null : item.menuKey)}
                        className={[
                          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                          active
                            ? 'bg-accent text-white'
                            : 'text-white/70 hover:bg-primary-2 hover:text-white',
                        ].join(' ')}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span>{item.label}</span>
                        <ChevronDown
                          size={13}
                          className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Sub-menu */}
                      {isOpen && (
                        <ul className="mt-1 ml-3.5 pl-3 border-l border-white/15 space-y-0.5">
                          {item.sub.map((sub) => {
                            /* Sub-item with its own nested sub-menu */
                            if (sub.sub) {
                              const isSubOpen = openSubMenu === sub.subKey
                              const subActive = location.pathname.startsWith(sub.path)
                              return (
                                <li key={sub.path}>
                                  <button
                                    onClick={() => {
                                      navigate(sub.path)
                                      setOpenSubMenu(prev => prev === sub.subKey ? null : sub.subKey)
                                    }}
                                    className={[
                                      'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors duration-150',
                                      subActive
                                        ? 'bg-white/15 text-white'
                                        : 'text-white/55 hover:bg-white/10 hover:text-white',
                                    ].join(' ')}
                                  >
                                    {subActive && <span className="w-1 h-1 rounded-full bg-white shrink-0" />}
                                    <span>{sub.label}</span>
                                    <ChevronDown
                                      size={11}
                                      className={`ml-auto transition-transform duration-200 ${isSubOpen ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                  {isSubOpen && (
                                    <ul className="mt-0.5 ml-3 pl-2.5 border-l border-white/10 space-y-0.5">
                                      {sub.sub.map((s) => {
                                        const sActive = location.pathname === s.path
                                        return (
                                          <li key={s.path}>
                                            <NavLink
                                              to={s.path}
                                              className={[
                                                'flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11.5px] font-medium transition-colors duration-150',
                                                sActive
                                                  ? 'bg-white/15 text-white'
                                                  : 'text-white/50 hover:bg-white/10 hover:text-white',
                                              ].join(' ')}
                                            >
                                              {sActive && <span className="w-1 h-1 rounded-full bg-white shrink-0" />}
                                              <span>{s.label}</span>
                                            </NavLink>
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  )}
                                </li>
                              )
                            }

                            /* Regular sub-item */
                            const subActive = location.pathname === sub.path
                            return (
                              <li key={sub.path}>
                                <NavLink
                                  to={sub.path}
                                  className={[
                                    'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors duration-150',
                                    subActive
                                      ? 'bg-white/15 text-white'
                                      : 'text-white/55 hover:bg-white/10 hover:text-white',
                                  ].join(' ')}
                                >
                                  {subActive && <span className="w-1 h-1 rounded-full bg-white shrink-0" />}
                                  <span>{sub.label}</span>
                                </NavLink>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                }

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={[
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                        active
                          ? 'bg-accent text-white'
                          : 'text-white/70 hover:bg-primary-2 hover:text-white',
                      ].join(' ')}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{item.label}</span>
                      {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[10px] text-white/25 text-center tracking-wide">
          © 2026 EFM MANAGEMENT
        </p>
      </div>
    </aside>
  )
}
