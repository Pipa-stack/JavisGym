import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { StatsCards } from "@/components/admin/stats-cards";
import { ScheduleManagement } from "@/components/admin/schedule-management";
import { MemberManagement } from "@/components/admin/member-management";
import { RecentActivity } from "@/components/admin/recent-activity";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar variant="admin" />
        
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Admin Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground">Panel de Administración</h2>
              <p className="text-gray-600 dark:text-muted-foreground">Gestiona tu gimnasio de manera eficiente</p>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Schedule Management */}
              <ScheduleManagement />

              {/* Recent Activity */}
              <RecentActivity />
            </div>

            {/* Member Management Table */}
            <MemberManagement />
          </div>
        </main>
      </div>
    </div>
  );
}
