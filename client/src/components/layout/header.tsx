import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { RefreshCw, Dumbbell } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const isAdminView = location === "/admin";

  const toggleView = () => {
    setLocation(isAdminView ? "/" : "/admin");
  };

  return (
    <header className="bg-white dark:bg-card shadow-sm border-b border-gray-200 dark:border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary flex items-center">
                <Dumbbell className="mr-2 h-6 w-6" />
                FitConnect
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user?.isAdmin && (
              <Button
                onClick={toggleView}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isAdminView ? "Vista Cliente" : "Vista Admin"}
              </Button>
            )}
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <img
                src={user?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-foreground hidden sm:block">
                {user?.fullName || "Usuario"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
