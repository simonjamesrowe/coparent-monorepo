import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  DollarSign,
  FileText,
  Image,
  Settings,
} from 'lucide-react';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { UpdateNotification, OfflineIndicator, InstallPrompt } from './components/pwa';
import type { NavigationItem } from './components/shell';
import { AppShell } from './components/shell';
import { initDB, initSync } from './lib/pwa';
import CalendarPage from './pages/CalendarPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import ExpensesPage from './pages/ExpensesPage';
import FamilySetupPage from './pages/FamilySetupPage';
import MessagesPage from './pages/MessagesPage';
import OnboardingPage from './pages/OnboardingPage';
import SettingsPage from './pages/SettingsPage';
import TimelinePage from './pages/TimelinePage';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize PWA features
  useEffect(() => {
    // Initialize IndexedDB
    initDB().catch((error) => {
      console.error('Failed to initialize IndexedDB:', error);
    });

    // Initialize background sync
    initSync();
  }, []);

  // Mock user data - this will be replaced with real Auth0 data later
  const user = {
    name: 'Demo Parent',
    avatarUrl: undefined,
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Auth0 logout will be implemented later
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      isActive: location.pathname === '/dashboard' || location.pathname === '/',
    },
    {
      label: 'Calendar',
      href: '/calendar',
      icon: <Calendar className="h-5 w-5" />,
      isActive: location.pathname === '/calendar',
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: <MessageSquare className="h-5 w-5" />,
      isActive: location.pathname === '/messages',
    },
    {
      label: 'Expenses',
      href: '/expenses',
      icon: <DollarSign className="h-5 w-5" />,
      isActive: location.pathname === '/expenses',
    },
    {
      label: 'Documents',
      href: '/documents',
      icon: <FileText className="h-5 w-5" />,
      isActive: location.pathname === '/documents',
    },
    {
      label: 'Timeline',
      href: '/timeline',
      icon: <Image className="h-5 w-5" />,
      isActive: location.pathname === '/timeline',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      isActive: location.pathname === '/settings',
    },
  ];

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
  );
};

export default App;
