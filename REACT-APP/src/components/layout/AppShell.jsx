import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { BreadcrumbProvider } from '../../context/BreadcrumbContext'

export default function AppShell({ children }) {
  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-bg-page">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  )
}
