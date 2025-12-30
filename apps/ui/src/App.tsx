import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  DollarSign,
  FileText,
  Image,
  Settings
} from 'lucide-react'

import { AppShell, NavigationItem } from './components/shell'
import {
  UpdateNotification,
  OfflineIndicator,
  InstallPrompt,
} from './components/pwa'
import { initDB, initSync } from './lib/pwa'
import DashboardPage from './pages/DashboardPage'
import CalendarPage from './pages/CalendarPage'
import MessagesPage from './pages/MessagesPage'
import ExpensesPage from './pages/ExpensesPage'
import DocumentsPage from './pages/DocumentsPage'
import TimelinePage from './pages/TimelinePage'
import SettingsPage from './pages/SettingsPage'
import OnboardingPage from './pages/OnboardingPage'
import FamilySetupPage from './pages/FamilySetupPage'

const App = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Initialize PWA features
  useEffect(() => {
    // Initialize IndexedDB
    initDB().catch((error) => {
      console.error('Failed to initialize IndexedDB:', error)
    })

    // Initialize background sync
    initSync()
  }, [])

  // Mock user data - this will be replaced with real Auth0 data later
  const user = {
    name: 'Demo Parent',
    avatarUrl: undefined,
  }

  const handleLogout = () => {
    console.log('Logout clicked')
    // Auth0 logout will be implemented later
  }

  const handleNavigate = (href: string) => {
    navigate(href)
  }

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      isActive: location.pathname === '/dashboard' || location.pathname === '/',
    },
    {
      label: 'Calendar',
      href: '/calendar',
      icon: <Calendar className="w-5 h-5" />,
      isActive: location.pathname === '/calendar',
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: <MessageSquare className="w-5 h-5" />,
      isActive: location.pathname === '/messages',
    },
    {
      label: 'Expenses',
      href: '/expenses',
      icon: <DollarSign className="w-5 h-5" />,
      isActive: location.pathname === '/expenses',
    },
    {
      label: 'Documents',
      href: '/documents',
      icon: <FileText className="w-5 h-5" />,
      isActive: location.pathname === '/documents',
    },
    {
      label: 'Timeline',
      href: '/timeline',
      icon: <Image className="w-5 h-5" />,
      isActive: location.pathname === '/timeline',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
      isActive: location.pathname === '/settings',
    },
  ]

  return (
    <>
      <AppShell
        navigationItems={navigationItems}
        user={user}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/family-setup" element={<FamilySetupPage />} />
        </Routes>
      </AppShell>

      {/* PWA Components */}
      <UpdateNotification />
      <OfflineIndicator />
      <InstallPrompt />
    </>
  )
}

export default App
