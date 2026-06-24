import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <TopBar />
      <main className="lg:pl-56 pt-14 pb-20 lg:pb-8 min-h-screen">
        <div className="px-4 py-6 lg:px-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
