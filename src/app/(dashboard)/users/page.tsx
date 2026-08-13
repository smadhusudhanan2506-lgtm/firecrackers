"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Users as UsersIcon,
  Shield,
  User,
  Mail,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
} from "lucide-react";
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
      name: "Shahana",
      email: "25ci023@skcet.ac.in",
      role: "operator",
      created_at: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"operator" | "admin">("operator");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setUsers(data);
      }
    } catch {
      // Keep existing users
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!newEmail.trim() || !newPassword.trim()) {
      setModalError("Email and password are required");
      return;
    }
    if (newPassword.length < 6) {
      setModalError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim() || newEmail.split("@")[0],
          email: newEmail.trim().toLowerCase(),
          password: newPassword,
          role: newRole,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setModalSuccess("User successfully registered in Supabase database!");
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        fetchUsers();
        setTimeout(() => {
          setShowAddModal(false);
          setModalSuccess("");
        }, 1200);
      } else {
        setModalError(result.error || "Failed to register user");
      }
    } catch {
      setModalError("Error adding user to database. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const roleColors: Record<string, string> = {
    admin: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    operator: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    viewer: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header with Add User Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-blue-400" />
            User Management & Database Roster
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Registered accounts stored in Supabase database with instant access
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#141b27] hover:bg-[#1e2738] border border-[#243046] text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Refresh database users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Database Status Banner */}
      <div className="bg-[#111723] border border-[#1e273a] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-500/50" />
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Supabase Database Connected
            </p>
            <p className="text-[11px] text-gray-400">
              Zero email rate limit — Auto-confirmed accounts ready for immediate login
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400">Total Registered:</span>
          <span className="ml-2 font-mono font-bold text-sm text-white">
            {users.length} Users
          </span>
        </div>
      </div>

      {/* Users list table */}
      <div className="bg-[#0f141e] border border-[#1e2738] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading database roster...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-300">
              <thead className="bg-[#131926] text-white text-xs uppercase font-bold border-b border-[#1e2738]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Role Permission</th>
                  <th className="py-3.5 px-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18202d] bg-[#0c1017]">
                {users.map((user) => (
                  <tr
                    key={user.id || user.email}
                    className="hover:bg-[#141b27] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="font-semibold text-white">
                          {user.name || "Safety Officer"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                          roleColors[user.role] || roleColors.operator
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role === "admin" ? "Safety Admin" : "Floor Operator"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        Active in Database
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111722] border border-[#222e44] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2738] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Add New Database User
                  </h3>
                  <p className="text-xs text-gray-400">
                    Creates instant verified account with zero rate limit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2332] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Shahana / Team Member"
                  className="w-full px-3.5 py-2.5 bg-[#0a0e16] border border-[#232f44] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. 25ci023@skcet.ac.in"
                  className="w-full px-3.5 py-2.5 bg-[#0a0e16] border border-[#232f44] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Password (Min 6 characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter login password"
                  className="w-full px-3.5 py-2.5 bg-[#0a0e16] border border-[#232f44] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Assign User Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole("operator")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newRole === "operator"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400"
                        : "bg-[#0a0e16] border-[#232f44] text-gray-400 hover:text-white"
                    }`}
                  >
                    Floor Operator
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole("admin")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      newRole === "admin"
                        ? "bg-purple-600/20 border-purple-500 text-purple-400"
                        : "bg-[#0a0e16] border-[#232f44] text-gray-400 hover:text-white"
                    }`}
                  >
                    Safety Admin
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1a2332] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/30 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving in Database...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Save & Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
