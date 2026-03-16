import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/layout/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
