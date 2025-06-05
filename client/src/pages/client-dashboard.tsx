import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WelcomeSection } from "@/components/client/welcome-section";
import { QuickActions } from "@/components/client/quick-actions";
import { SocialFeed } from "@/components/client/social-feed";
import { TodayClasses } from "@/components/client/today-classes";
import { RecentWorkouts } from "@/components/client/recent-workouts";

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar variant="client" />
        
        <main className="flex-1 p-4 pb-20 md:pb-4">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <WelcomeSection />

            {/* Quick Actions */}
            <QuickActions />

            {/* Social Feed */}
            <SocialFeed />

            {/* Today's Classes */}
            <TodayClasses />

            {/* Recent Workouts */}
            <RecentWorkouts />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
