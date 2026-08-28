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
import PPDocumentsPage from './pages/pp/PPDocumentsPage'
import PPAgreementDetailPage from './pages/pp/PPAgreementDetailPage'
import PPInvoicePage from './pages/pp/PPInvoicePage'
import PPInvoiceDetailPage from './pages/pp/PPInvoiceDetailPage'
import PPReceiptPage from './pages/pp/PPReceiptPage'
import PPReceiptDetailPage from './pages/pp/PPReceiptDetailPage'
import PPOrderDetailPage from './pages/pp/PPOrderDetailPage'
import PPOrderNewPage from './pages/pp/PPOrderNewPage'
import PPScreeningPage from './pages/pp/PPScreeningPage'
import PPFitnessAssessmentPage from './pages/pp/PPFitnessAssessmentPage'
import PPLeadDetailPage from './pages/pp/PPLeadDetailPage'
import PPLeadNewPage from './pages/pp/PPLeadNewPage'
import PPProgramFormPage from './pages/pp/PPProgramFormPage'

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
import EventLeadNewPage from './pages/event/EventLeadNewPage'
import EventLeadDetailPage from './pages/event/EventLeadDetailPage'
import EventKonsultasiPage from './pages/event/EventKonsultasiPage'
import EventKonsultasiDetailPage from './pages/event/EventKonsultasiDetailPage'
import EventOrdersPage from './pages/event/EventOrdersPage'
import EventOrderDetailPage from './pages/event/EventOrderDetailPage'
import EventOrderNewPage from './pages/event/EventOrderNewPage'
import EventInvoicePage from './pages/event/EventInvoicePage'
import EventReceiptPage from './pages/event/EventReceiptPage'
import EventKalenderPage from './pages/event/EventKalenderPage'

// OPS
import ContractPage from './pages/contract/ContractPage'
import OPSPICPage from './pages/pic/OPSPICPage'
import PICDetail  from './pages/pic/PICDetail'
import OPSMitraPage from './pages/pic/OPSMitraPage'
import OPSAssetsPage from './pages/assignment/OPSAssetsPage'

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
      <Route path="/ops/pelatih"     element={<AppShell><OPSPICPage /></AppShell>} />
      <Route path="/ops/pelatih/:id" element={<AppShell><PICDetail  /></AppShell>} />
      <Route path="/pic"     element={<Navigate to="/ops/pelatih" replace />} />
      <Route path="/pic/:id" element={<Navigate to="/ops/pelatih" replace />} />
      <Route path="/ops/mitra" element={<AppShell><OPSMitraPage /></AppShell>} />
      <Route path="/ops/assets" element={<AppShell><OPSAssetsPage /></AppShell>} />

      {/* PP Routes */}
      <Route path="/pp/dashboard" element={<AppShell><PPDashboard /></AppShell>} />
      <Route path="/pp/leads" element={<AppShell><PPLeadsPage /></AppShell>} />
      <Route path="/pp/leads/new" element={<AppShell><PPLeadNewPage /></AppShell>} />
      <Route path="/pp/leads/:id" element={<AppShell><PPLeadDetailPage /></AppShell>} />
      <Route path="/pp/screening" element={<AppShell><PPScreeningPage /></AppShell>} />
      <Route path="/pp/screening/:id" element={<AppShell><PPFitnessAssessmentPage /></AppShell>} />
      <Route path="/pp/orders" element={<AppShell><PPOrdersPage /></AppShell>} />
      <Route path="/pp/orders/new" element={<AppShell><PPOrderNewPage /></AppShell>} />
      <Route path="/pp/orders/:id" element={<AppShell><PPOrderDetailPage /></AppShell>} />
      <Route path="/pp/program-db" element={<AppShell><PPProgramDBPage /></AppShell>} />
      <Route path="/pp/program-db/new" element={<AppShell><PPProgramFormPage /></AppShell>} />
      <Route path="/pp/program-db/:progId/edit" element={<AppShell><PPProgramFormPage /></AppShell>} />
      <Route path="/pp/documents" element={<AppShell><PPDocumentsPage /></AppShell>} />
      <Route path="/pp/invoice" element={<AppShell><PPInvoicePage /></AppShell>} />
      <Route path="/pp/invoice/:id" element={<AppShell><PPInvoiceDetailPage /></AppShell>} />
      <Route path="/pp/receipt" element={<AppShell><PPReceiptPage /></AppShell>} />
      <Route path="/pp/receipt/:id" element={<AppShell><PPReceiptDetailPage /></AppShell>} />
      <Route path="/pp/agreement/:id" element={<AppShell><PPAgreementDetailPage /></AppShell>} />

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
      <Route path="/event/leads"        element={<AppShell><EventLeadsPage      /></AppShell>} />
      <Route path="/event/leads/new"    element={<AppShell><EventLeadNewPage    /></AppShell>} />
      <Route path="/event/leads/:id"    element={<AppShell><EventLeadDetailPage /></AppShell>} />
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
      <Route path="/ops/pelatih/kontrak"    element={<AppShell><ContractPage /></AppShell>} />
      <Route path="/contract" element={<Navigate to="/ops/pelatih/kontrak" replace />} />

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
