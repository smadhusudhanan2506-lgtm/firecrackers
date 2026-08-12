"use client";

import { useState } from "react";
import { RealtimeProvider } from "@/context/RealtimeProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-background flex text-foreground">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          <TopBar onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 md:p-6 w-full max-w-[1500px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </RealtimeProvider>
  );
}
