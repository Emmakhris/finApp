import React, { createContext, useContext, useState } from 'react';
import { startOfMonth } from 'date-fns';

type AccountFilter = 'all' | 'personal' | 'business';

interface AppContextValue {
  accountFilter: AccountFilter;
  setAccountFilter: (f: AccountFilter) => void;
  selectedMonth: Date;
  setSelectedMonth: (d: Date) => void;
  openModal: string | null;
  setOpenModal: (m: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [openModal, setOpenModal] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{
      accountFilter, setAccountFilter,
      selectedMonth, setSelectedMonth,
      openModal, setOpenModal,
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
