import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Assess from './pages/Assess';
import AssessResult from './pages/AssessResult';
import Investigations from './pages/Investigations';
import InvestigationDetail from './pages/InvestigationDetail';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Audit from './pages/Audit';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Landing page — no sidebar layout */}
          <Route path="/" element={<LandingPage />} />

          {/* App pages — inside Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assess" element={<Assess />} />
            <Route path="/assess/result/:id" element={<AssessResult />} />
            <Route path="/investigations" element={<Investigations />} />
            <Route path="/investigations/:id" element={<InvestigationDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit" element={<Audit />} />
            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
