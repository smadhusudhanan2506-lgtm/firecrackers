"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useSystem } from "@/context/RealtimeProvider";
import {
  Shield,
  LayoutDashboard,
  Map,
  Radio,
  Bell,
  Route,
  History,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  AlertTriangle,
  X,
} from "lucide-react";
import type { Profile } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/live-map", label: "Live Safety Map", icon: Map },
  { href: "/sensors", label: "Sensors", icon: Radio },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/evacuation", label: "Evacuation", icon: Route },
  { href: "/history", label: "Event History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminItems = [{ href: "/users", label: "Users", icon: Users }];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isEmergency, activeAlerts } = useSystem();
  const [profile, setProfile] = useState<Profile>({
    id: "user-1",
    name: "Safety Officer",
    email: "operator@safetynet.io",
    role: "admin",
    created_at: new Date().toISOString(),
  });

  useEffect(() => {
    async function getProfile() {
      try {
        const stored = localStorage.getItem("safetynet_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // Ignore
      }

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            if (data) setProfile(data);
          }
        } catch {
          // Ignore
        }
      }
    }
    getProfile();
  }, []);

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore
    }
    document.cookie = "safetynet_session=; path=/; max-age=0";
    localStorage.removeItem("safetynet_profile");
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isExpanded = isMobile || !collapsed;

    return (
      <div className="flex flex-col h-full bg-[#0c1017]">
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1c2433]">
          <Link
            href="/dashboard"
            onClick={() => isMobile && setMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${
                isEmergency
                  ? "from-red-600 to-red-800 shadow-red-500/40"
                  : "from-blue-600 to-blue-800 shadow-blue-500/40"
              } shadow-md shrink-0 transition-colors duration-500`}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white tracking-wide truncate">
                  SAFETYNET
                </h2>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Fire & Evacuation
                </p>
              </div>
            )}
          </Link>

          {/* Toggle / Close Button */}
          {isMobile ? (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-[#1a2332] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-[#1a2332] transition-all cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={`w-4 h-4 transition-transform duration-300 ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* Emergency Status Banner */}
        {isEmergency && (
          <div className="mx-3.5 mt-3.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 animate-emergency-pulse">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            {isExpanded && (
              <span className="text-xs font-bold text-red-400 truncate">
                EMERGENCY ACTIVE
              </span>
            )}
          </div>
        )}

        {/* Nav Links with bigger font and comfortable spacing */}
        <nav className="flex-1 px-3.5 py-6 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasNotification =
              item.href === "/alerts" && activeAlerts.length > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all duration-200 relative group ${
                  active
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/35 shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-[#161e2b]"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {isExpanded && <span className="truncate">{item.label}</span>}
                {hasNotification && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                )}
                {!isExpanded && !isMobile && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a2332] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 whitespace-nowrap border border-[#2b394e]">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Admin Navigation Section */}
          {profile?.role === "admin" && (
            <>
              <div className="pt-6 pb-1.5 px-4">
                {isExpanded && (
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => isMobile && setMobileOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all duration-200 relative group ${
                        active
                          ? "bg-blue-600/15 text-blue-400 border border-blue-500/35 shadow-sm"
                          : "text-muted-foreground hover:text-white hover:bg-[#161e2b]"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {isExpanded && <span className="truncate">{item.label}</span>}
                      {!isExpanded && !isMobile && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1a2332] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50 whitespace-nowrap border border-[#2b394e]">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* User Card */}
        <div className="border-t border-[#1c2433] p-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.name || "Safety User"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize font-semibold">
                  {profile?.role || "operator"}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full z-50 w-72 transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent isMobile={true} />
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#1c2433] sticky top-0 h-screen transition-all duration-300 shrink-0 z-30 ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        <SidebarContent isMobile={false} />
      </aside>
    </>
  );
}
