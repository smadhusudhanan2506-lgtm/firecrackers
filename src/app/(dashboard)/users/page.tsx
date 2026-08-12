"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Users as UsersIcon, Shield, User, Mail } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([
    {
      id: "u-1",
      name: "Admin Officer",
      email: "admin@safetynet.io",
      role: "admin",
      created_at: new Date().toISOString(),
    },
    {
      id: "u-2",
      name: "Floor Operator",
      email: "operator@safetynet.io",
      role: "operator",
      created_at: new Date().toISOString(),
    },
    {
      id: "u-3",
      name: "Safety Inspector",
      email: "inspector@safetynet.io",
      role: "viewer",
      created_at: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const supabase = createClient();
      async function fetchUsers() {
        setLoading(true);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (data && data.length > 0) setUsers(data);
        setLoading(false);
      }
      fetchUsers();
    } catch {
      setLoading(false);
    }
  }, []);

  const roleColors: Record<string, string> = {
    admin: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    operator: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    viewer: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage system users and access roles (Admin view)
        </p>
      </div>

      {/* Users list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UsersIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No users found. Create users via Supabase Auth.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/20">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {user.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      roleColors[user.role] || roleColors.viewer
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
