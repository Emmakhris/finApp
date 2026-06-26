import React, { createContext, useContext, useState } from 'react';
import { startOfMonth } from 'date-fns';
import { clearToken } from '../lib/apiClient';

type AccountFilter = 'all' | 'personal' | 'business';

interface CurrentUser {
  id: number;
  email: string;
  name: string;
}

interface AppContextValue {
  accountFilter: AccountFilter;
  setAccountFilter: (f: AccountFilter) => void;
  selectedMonth: Date;
  setSelectedMonth: (d: Date) => void;
  openModal: string | null;
  setOpenModal: (m: string | null) => void;
  currentUser: CurrentUser | null;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem('finapp_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(loadUser);

  function logout() {
    clearToken();
    setCurrentUser(null);
    window.location.href = '/login';
  }

  return (
    <AppContext.Provider value={{
      accountFilter, setAccountFilter,
      selectedMonth, setSelectedMonth,
      openModal, setOpenModal,
      currentUser,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
