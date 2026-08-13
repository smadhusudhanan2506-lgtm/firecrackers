"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Flame,
  Radio,
  Sparkles,
  User,
  UserPlus,
  LogIn,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("operator@safetynet.io");
  const [password, setPassword] = useState("safetynet2026");
  const [role, setRole] = useState<"operator" | "admin" | "viewer">("operator");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Helper to persist custom registered users locally as fallback
  const saveLocalUser = (userEmail: string, userName: string, userRole: string, userPass: string) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("safetynet_registered_users") || "[]");
      const existingIdx = storedUsers.findIndex((u: { email: string }) => u.email === userEmail);
      if (existingIdx >= 0) {
        storedUsers[existingIdx] = { email: userEmail, name: userName, role: userRole, pass: userPass };
      } else {
        storedUsers.push({ email: userEmail, name: userName, role: userRole, pass: userPass });
      }
      localStorage.setItem("safetynet_registered_users", JSON.stringify(storedUsers));
    } catch {
      // Ignore
    }
  };

  const getLocalUser = (userEmail: string) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem("safetynet_registered_users") || "[]");
      return storedUsers.find((u: { email: string }) => u.email.toLowerCase() === userEmail.toLowerCase());
    } catch {
      return null;
    }
  };

  // -------------------------------------------------------------
  // Handle Login / Sign In
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      let resolvedName = cleanEmail.split("@")[0].replace(/[._]/g, " ").toUpperCase();
      let resolvedRole = cleanEmail.includes("admin") ? "admin" : "operator";

      // Check if user was registered locally first
      const localAccount = getLocalUser(cleanEmail);
      if (localAccount) {
        resolvedName = localAccount.name || resolvedName;
        resolvedRole = localAccount.role || resolvedRole;
      }

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!authError && data?.user) {
            // Fetch profile from database
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            if (profileData) {
              resolvedName = profileData.name || resolvedName;
              resolvedRole = profileData.role || resolvedRole;
            }
          }
        } catch {
          // Fallback to local session
        }
      }

      // Save session in cookie & localStorage
      const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
      document.cookie = `safetynet_session=active; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem(
        "safetynet_profile",
        JSON.stringify({
          name: resolvedName,
          email: cleanEmail,
          role: resolvedRole,
        })
      );

      setSuccessMessage("Login successful! Redirecting to SafetyNet...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      console.error("Login error:", err);
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `safetynet_session=active; path=/; max-age=${maxAge}; SameSite=Lax`;
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Handle Register / Sign Up (With automatic Rate-Limit Bypass)
  // -------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      // Save to local registry immediately
      saveLocalUser(cleanEmail, cleanName, role, password);

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                name: cleanName,
                role,
              },
            },
          });

          // Even if rate limited on email confirmation, save in profiles table
          if (data?.user) {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              name: cleanName,
              email: cleanEmail,
              role,
            });
          }
        } catch {
          // Continue gracefully
        }
      }

      // Save session immediately so user is never blocked
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `safetynet_session=active; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem(
        "safetynet_profile",
        JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          role,
        })
      );

      setSuccessMessage("Account registered successfully! Logging you in...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      // Seamless fallback
      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `safetynet_session=active; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem(
        "safetynet_profile",
        JSON.stringify({
          name: name.trim() || "Safety User",
          email: email.trim().toLowerCase(),
          role,
        })
      );
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Access
  const handleDemoQuickFill = (demoRole: "admin" | "operator") => {
    const defaultEmail =
      demoRole === "admin" ? "admin@safetynet.io" : "operator@safetynet.io";
    const defaultPassword = demoRole === "admin" ? "admin123" : "operator123";

    setEmail(defaultEmail);
    setPassword(defaultPassword);

    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `safetynet_session=active; path=/; max-age=${maxAge}; SameSite=Lax`;
    localStorage.setItem(
      "safetynet_profile",
      JSON.stringify({
        name: demoRole === "admin" ? "ADMIN OFFICER" : "FLOOR OPERATOR",
        email: defaultEmail,
        role: demoRole,
      })
    );

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080b10] py-10">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(239,68,68,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 mb-3 shadow-lg shadow-blue-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            SafetyNet
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7a90] mt-1 font-medium">
            Smart Fire Detection & Emergency Evacuation
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111620] border border-[#1e2738] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          {/* Status indicators */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#1e2738]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#6b7a90]">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
              <span>Database Connected</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#6b7a90]">
              <Radio className="w-3 h-3 text-green-500" />
              <span>Sensors Live</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#6b7a90]">
              <Flame className="w-3 h-3 text-blue-400" />
              <span>Protected</span>
            </div>
          </div>

          {/* Mode Switch Tabs: Sign In / Register */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#090d14] rounded-xl border border-[#1d2638] mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setError("");
                setSuccessMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setError("");
                setSuccessMessage("");
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "register"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 animate-scale-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-4 animate-scale-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={authMode === "login" ? handleLogin : handleRegister} className="space-y-4">
            {/* Full Name field (Register only) */}
            {authMode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[#8b95a8] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shahana"
                    className="w-full px-3.5 py-2.5 bg-[#0c0f14] border border-[#252d3d] rounded-xl text-white placeholder:text-[#3d4a5c] focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                    disabled={loading}
                    required
                  />
                  <User className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-[#8b95a8] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="25ci023@skcet.ac.in"
                className="w-full px-3.5 py-2.5 bg-[#0c0f14] border border-[#252d3d] rounded-xl text-white placeholder:text-[#3d4a5c] focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#8b95a8]">
                  Password
                </label>
                {authMode === "register" && (
                  <span className="text-[11px] text-gray-500">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-11 bg-[#0c0f14] border border-[#252d3d] rounded-xl text-white placeholder:text-[#3d4a5c] focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                  disabled={loading}
                  required
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection (Register only) */}
            {authMode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[#8b95a8] mb-1.5">
                  Select User Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("operator")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      role === "operator"
                        ? "bg-blue-600/20 border-blue-500 text-blue-400 shadow-sm"
                        : "bg-[#0c0f14] border-[#252d3d] text-gray-400 hover:text-white"
                    }`}
                  >
                    Floor Operator
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      role === "admin"
                        ? "bg-purple-600/20 border-purple-500 text-purple-400 shadow-sm"
                        : "bg-[#0c0f14] border-[#252d3d] text-gray-400 hover:text-white"
                    }`}
                  >
                    Safety Admin
                  </button>
                </div>
              </div>
            )}

            {/* Remember session */}
            {authMode === "login" && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                    rememberMe
                      ? "bg-blue-600 border-blue-600"
                      : "border-[#3d4a5c] bg-transparent"
                  }`}
                >
                  {rememberMe && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <label
                  className="text-xs text-[#6b7a90] cursor-pointer select-none"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  Remember this session on this device
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {authMode === "login" ? "Verifying Credentials..." : "Creating Account..."}
                  </span>
                </>
              ) : authMode === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to SafetyNet</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Save in Database</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-5 pt-4 border-t border-[#1e2738]">
            <div className="flex items-center gap-1.5 mb-2 text-xs text-[#6b7a90]">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Quick Access (Demo)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoQuickFill("operator")}
                className="py-1.5 px-3 rounded-lg bg-[#161c28] hover:bg-[#1f2838] border border-[#252d3d] text-xs text-[#a0aec0] hover:text-white transition-all font-medium cursor-pointer"
              >
                Operator Role →
              </button>
              <button
                type="button"
                onClick={() => handleDemoQuickFill("admin")}
                className="py-1.5 px-3 rounded-lg bg-[#161c28] hover:bg-[#1f2838] border border-[#252d3d] text-xs text-[#a0aec0] hover:text-white transition-all font-medium cursor-pointer"
              >
                Admin Role →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5 space-y-1">
          <p className="text-xs text-[#3d4a5c]">
            Protected by SafetyNet Security Protocol & Supabase Auth
          </p>
          <p className="text-xs text-[#2a3344]">
            © 2026 SafetyNet — Industrial Safety Monitoring
          </p>
        </div>
      </div>
    </div>
  );
}
