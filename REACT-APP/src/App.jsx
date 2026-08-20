import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'

// Auth
import LoginPage from './pages/auth/LoginPage'

// Dashboard
import DashboardAdmin from './pages/dashboard/DashboardAdmin'
import DashboardOwnerPage from './pages/dashboard/DashboardOwnerPage'

// PP (Private Program)
import PPDashboard from './pages/pp/PPDashboard'
import PPLeadsPage from './pages/pp/PPLeadsPage'
import PPOrdersPage from './pages/pp/PPOrdersPage'
import PPProgramDBPage from './pages/pp/PPProgramDBPage'
import PPJenisProgramPage from './pages/pp/PPJenisProgramPage'
import PPDocumentsPage from './pages/pp/PPDocumentsPage'
import PPInvoicePage from './pages/pp/PPInvoicePage'
import PPReceiptPage from './pages/pp/PPReceiptPage'
import PPOrderDetailPage from './pages/pp/PPOrderDetailPage'
import PPOrderNewPage from './pages/pp/PPOrderNewPage'
import PPScreeningPage from './pages/pp/PPScreeningPage'
import PPLeadDetailPage from './pages/pp/PPLeadDetailPage'

// B2B
import B2BDashboardPage from './pages/b2b/B2BDashboardPage'
import B2BLeadsPage from './pages/b2b/B2BLeadsPage'
import B2BOrdersPage from './pages/b2b/B2BOrdersPage'
import B2BSurveyPage from './pages/b2b/B2BSurveyPage'
import B2BInvoicePage from './pages/b2b/B2BInvoicePage'
import B2BReceiptPage from './pages/b2b/B2BReceiptPage'
import B2BKalenderPage from './pages/b2b/B2BKalenderPage'
import B2BOrderDetailPage from './pages/b2b/B2BOrderDetailPage'
import B2BOrderNewPage    from './pages/b2b/B2BOrderNewPage'
import B2BSurveiDetailPage from './pages/b2b/B2BSurveiDetailPage'

// Event
import EventDashboardPage from './pages/event/EventDashboardPage'
import EventLeadsPage from './pages/event/EventLeadsPage'
import EventKonsultasiPage from './pages/event/EventKonsultasiPage'
import EventKonsultasiDetailPage from './pages/event/EventKonsultasiDetailPage'
import EventOrdersPage from './pages/event/EventOrdersPage'
import EventOrderDetailPage from './pages/event/EventOrderDetailPage'
import EventOrderNewPage from './pages/event/EventOrderNewPage'
import EventInvoicePage from './pages/event/EventInvoicePage'
import EventReceiptPage from './pages/event/EventReceiptPage'
import EventKalenderPage from './pages/event/EventKalenderPage'

// OPS
import OPSPICPage from './pages/pic/OPSPICPage'
import PICDetail  from './pages/pic/PICDetail'
import OPSMitraPage from './pages/pic/OPSMitraPage'
import OPSAssetsPage from './pages/assignment/OPSAssetsPage'
import PaymentPage from './pages/payment/PaymentPage'
import AttendancePage from './pages/attendance/AttendancePage'

// Contract
import ContractPage from './pages/contract/ContractPage'

// Laporan
import LaporanRevenuePage   from './pages/laporan/LaporanRevenuePage'
import LaporanPenjualanPage from './pages/laporan/LaporanPenjualanPage'
import LaporanLabaPage      from './pages/laporan/LaporanLabaPage'
import LaporanExportPage    from './pages/laporan/LaporanExportPage'

// Settings
import SettingsPage from './pages/settings/SettingsPage'

function AppRoutes() {
  return (
    <Routes>
      {/* Auth — no shell */}
      <Route path="/login" element={<LoginPage />} />

      {/* All authenticated routes — wrapped in AppShell */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/dashboard" element={<AppShell><DashboardAdmin /></AppShell>} />
      <Route path="/owner-dashboard" element={<AppShell><DashboardOwnerPage /></AppShell>} />

      {/* OPS — database pages */}
      <Route path="/pic"     element={<AppShell><OPSPICPage /></AppShell>} />
      <Route path="/pic/:id" element={<AppShell><PICDetail  /></AppShell>} />
      <Route path="/ops/mitra" element={<AppShell><OPSMitraPage /></AppShell>} />
      <Route path="/ops/assets" element={<AppShell><OPSAssetsPage /></AppShell>} />

      {/* PP Routes */}
      <Route path="/pp/dashboard" element={<AppShell><PPDashboard /></AppShell>} />
      <Route path="/pp/leads" element={<AppShell><PPLeadsPage /></AppShell>} />
      <Route path="/pp/leads/:id" element={<AppShell><PPLeadDetailPage /></AppShell>} />
      <Route path="/pp/screening" element={<AppShell><PPScreeningPage /></AppShell>} />
      <Route path="/pp/orders" element={<AppShell><PPOrdersPage /></AppShell>} />
      <Route path="/pp/orders/new" element={<AppShell><PPOrderNewPage /></AppShell>} />
      <Route path="/pp/orders/:id" element={<AppShell><PPOrderDetailPage /></AppShell>} />
      <Route path="/pp/program-db" element={<AppShell><PPProgramDBPage /></AppShell>} />
      <Route path="/pp/program-db/jenis-program" element={<AppShell><PPJenisProgramPage /></AppShell>} />
      <Route path="/pp/documents" element={<AppShell><PPDocumentsPage /></AppShell>} />
      <Route path="/pp/invoice" element={<AppShell><PPInvoicePage /></AppShell>} />
      <Route path="/pp/receipt" element={<AppShell><PPReceiptPage /></AppShell>} />

      {/* B2B Routes */}
      <Route path="/b2b/dashboard" element={<AppShell><B2BDashboardPage /></AppShell>} />
      <Route path="/b2b/leads"     element={<AppShell><B2BLeadsPage    /></AppShell>} />
      <Route path="/b2b/survei"        element={<AppShell><B2BSurveyPage        /></AppShell>} />
      <Route path="/b2b/survei/new"    element={<AppShell><B2BSurveiDetailPage  /></AppShell>} />
      <Route path="/b2b/survei/:id"    element={<AppShell><B2BSurveiDetailPage  /></AppShell>} />
      <Route path="/b2b/orders"      element={<AppShell><B2BOrdersPage      /></AppShell>} />
      <Route path="/b2b/orders/new" element={<AppShell><B2BOrderNewPage    /></AppShell>} />
      <Route path="/b2b/orders/:id" element={<AppShell><B2BOrderDetailPage /></AppShell>} />
      <Route path="/b2b/kalender"   element={<AppShell><B2BKalenderPage    /></AppShell>} />
      <Route path="/b2b/invoice"   element={<AppShell><B2BInvoicePage  /></AppShell>} />
      <Route path="/b2b/receipt"   element={<AppShell><B2BReceiptPage  /></AppShell>} />

      {/* Event Routes */}
      <Route path="/event"              element={<AppShell><EventDashboardPage /></AppShell>} />
      <Route path="/event/dashboard"    element={<AppShell><EventDashboardPage /></AppShell>} />
      <Route path="/event/leads"        element={<AppShell><EventLeadsPage     /></AppShell>} />
      <Route path="/event/konsultasi"     element={<AppShell><EventKonsultasiPage /></AppShell>} />
      <Route path="/event/konsultasi/new" element={<AppShell><EventKonsultasiDetailPage /></AppShell>} />
      <Route path="/event/konsultasi/:id" element={<AppShell><EventKonsultasiDetailPage /></AppShell>} />
      <Route path="/event/orders"       element={<AppShell><EventOrdersPage      /></AppShell>} />
      <Route path="/event/orders/new"   element={<AppShell><EventOrderNewPage    /></AppShell>} />
      <Route path="/event/orders/:id"   element={<AppShell><EventOrderDetailPage /></AppShell>} />
      <Route path="/event/kalender"     element={<AppShell><EventKalenderPage    /></AppShell>} />
      <Route path="/event/invoice"      element={<AppShell><EventInvoicePage   /></AppShell>} />
      <Route path="/event/receipt"      element={<AppShell><EventReceiptPage   /></AppShell>} />

      {/* OPS */}
      <Route path="/attendance" element={<AppShell><AttendancePage /></AppShell>} />
      <Route path="/payment" element={<AppShell><PaymentPage /></AppShell>} />

      {/* Contract */}
      <Route path="/contract" element={<AppShell><ContractPage /></AppShell>} />

      {/* Laporan & Keuangan */}
      <Route path="/laporan/revenue"   element={<AppShell><LaporanRevenuePage /></AppShell>} />
      <Route path="/laporan/penjualan" element={<AppShell><LaporanPenjualanPage /></AppShell>} />
      <Route path="/laporan/laba"      element={<AppShell><LaporanLabaPage /></AppShell>} />
      <Route path="/laporan/export"    element={<AppShell><LaporanExportPage /></AppShell>} />

      {/* Settings */}
      <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
