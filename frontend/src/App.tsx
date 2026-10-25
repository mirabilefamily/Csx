import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth, useAuth } from '@/components/auth/AuthContext'
import { AppShell } from '@/components/shell/AppShell'
import { DemoStateSwitcher } from '@/components/DemoStateSwitcher'
import { Toaster } from '@/components/ui/sonner'
import { UnsavedGuardProvider } from '@/components/UnsavedGuard'
import { TooltipProvider } from '@/components/ui/overlay'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import InboxPage from '@/pages/InboxPage'
import GuidancePage from '@/pages/GuidancePage'
import SettingsPage from '@/pages/SettingsPage'
import StyleguidePage from '@/pages/StyleguidePage'
import NotFoundPage from '@/pages/NotFoundPage'
import WidgetDemoPage from '@/pages/WidgetDemoPage'
import SurveyPage from '@/pages/SurveyPage'
import ThemeEditorPage from '@/pages/ThemeEditorPage'

function NotFoundRoute() {
  const { user } = useAuth()
  return user ? <AppShell><NotFoundPage /></AppShell> : <NotFoundPage />
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <UnsavedGuardProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/styleguide" element={<StyleguidePage />} />
            <Route path="/widget-demo" element={<WidgetDemoPage />} />
            <Route path="/widget-demo/theme-editor" element={<ThemeEditorPage />} />
            <Route path="/survey/:token" element={<SurveyPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inbox/:ticketId?" element={<InboxPage />} />
                <Route path="/guidance" element={<GuidancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/:tab" element={<SettingsPage />} />
                <Route path="/settings/integrations/:integrationId" element={<SettingsPage />} />
                <Route path="/settings/integrations/:integrationId/:sub" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundRoute />} />
          </Routes>
          <DemoStateSwitcher />
          <Toaster />
          </UnsavedGuardProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  )
}
