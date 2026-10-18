import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import ProfilePage from '../pages/auth/ProfilePage'
import DashboardPage from '../pages/admin/DashboardPage'
import CustomersPage from '../pages/admin/CustomersPage'
import CustomerFormPage from '../pages/admin/CustomerFormPage'
import CustomerDetailsPage from '../pages/admin/CustomerDetailsPage'
import DevicesPage from '../pages/admin/DevicesPage'
import RepairTicketsPage from '../pages/admin/RepairTicketsPage'
import RepairTicketFormPage from '../pages/admin/RepairTicketFormPage'
import RepairTicketDetailsPage from '../pages/admin/RepairTicketDetailsPage'
import TechniciansPage from '../pages/admin/TechniciansPage'
import InventoryPage from '../pages/admin/InventoryPage'
import InventoryDetailsPage from '../pages/admin/InventoryDetailsPage'
import PaymentsPage from '../pages/admin/PaymentsPage'
import ReportsPage from '../pages/admin/ReportsPage'
import NotificationsPage from '../pages/admin/NotificationsPage'
import SettingsPage from '../pages/admin/SettingsPage'
import TechnicianDashboardPage from '../pages/technician/TechnicianDashboardPage'
import TechnicianRepairsPage from '../pages/technician/TechnicianRepairsPage'
import TrackingPage from '../pages/public/TrackingPage'
import NotFoundPage from '../pages/public/NotFoundPage'
import AccessDeniedPage from '../pages/public/AccessDeniedPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/track/:trackingToken" element={<TrackingPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/new" element={<CustomerFormPage />} />
          <Route path="/customers/:id" element={<CustomerDetailsPage />} />
          <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/repair-tickets" element={<RepairTicketsPage />} />
          <Route path="/repair-tickets/new" element={<RepairTicketFormPage />} />
          <Route path="/repair-tickets/:id/edit" element={<RepairTicketFormPage />} />
          <Route path="/repair-tickets/:id" element={<RepairTicketDetailsPage />} />
          <Route path="/technicians" element={<TechniciansPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/:id" element={<InventoryDetailsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['TECHNICIAN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/technician" element={<TechnicianDashboardPage />} />
          <Route path="/technician/repairs" element={<TechnicianRepairsPage />} />
          <Route path="/technician/repairs/:id" element={<RepairTicketDetailsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN', 'TECHNICIAN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
