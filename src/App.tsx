import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Receivables } from './pages/Receivables';
import { Payables } from './pages/Payables';
import { Loans } from './pages/Loans';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/receivables" element={<Receivables />} />
            <Route path="/payables" element={<Payables />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
