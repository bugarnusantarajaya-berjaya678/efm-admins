import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { BreadcrumbProvider } from '../../context/BreadcrumbContext'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-bg-page">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar onMenuToggle={() => setSidebarOpen(v => !v)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  )
}
