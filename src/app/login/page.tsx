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
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("operator@safetynet.io");
  const [password, setPassword] = useState("safetynet2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      const maxAge = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
      const role = email.includes("admin") ? "admin" : "operator";
      const name = email.split("@")[0].replace(/[._]/g, " ").toUpperCase();

      // Set session cookie for Next.js middleware / layout
      document.cookie = `safetynet_session=active; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem(
        "safetynet_profile",
        JSON.stringify({
          name: name || "Safety Officer",
          email,
          role,
        })
      );

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        } catch {
          // Fallback to active local session
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login redirect:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoQuickFill = (role: "admin" | "operator") => {
    const defaultEmail =
      role === "admin" ? "admin@safetynet.io" : "operator@safetynet.io";
    const defaultPassword = role === "admin" ? "admin123" : "operator123";

    setEmail(defaultEmail);
    setPassword(defaultPassword);

    // Auto-login on quick fill click
    const maxAge = 60 * 60 * 24 * 7;
    document.cookie = `safetynet_session=active; path=/; max-age=${maxAge}; SameSite=Lax`;
    localStorage.setItem(
      "safetynet_profile",
      JSON.stringify({
        name: role === "admin" ? "ADMIN OFFICER" : "FLOOR OPERATOR",
        email: defaultEmail,
        role,
      })
    );

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#080b10]">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(239,68,68,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4 my-8">
        {/* Logo section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 mb-4 shadow-lg shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            SafetyNet
          </h1>
          <p className="text-sm text-[#6b7a90] mt-1.5 font-medium">
            Smart Fire Detection & Emergency Evacuation
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111620] border border-[#1e2738] rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Status indicators */}
          <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#1e2738]">
            <div className="flex items-center gap-2 text-xs font-medium text-[#6b7a90]">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
              <span>System Online</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#6b7a90]">
              <Radio className="w-3 h-3 text-green-500" />
              <span>Sensors Ready</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#6b7a90]">
              <Flame className="w-3 h-3 text-blue-400" />
              <span>Protected</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-scale-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#8b95a8] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@safetynet.io"
                className="w-full px-4 py-3 bg-[#0c0f14] border border-[#252d3d] rounded-xl text-white placeholder:text-[#3d4a5c] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-sm"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#8b95a8]"
                >
                  Password
                </label>
                <span className="text-xs text-muted-foreground">
                  (Any password or quick fill)
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-[#0c0f14] border border-[#252d3d] rounded-xl text-white placeholder:text-[#3d4a5c] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all text-sm"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#8b95a8] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
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
                className="text-sm text-[#6b7a90] cursor-pointer select-none"
                onClick={() => setRememberMe(!rememberMe)}
              >
                Remember this session
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Entering SafetyNet...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Secure Login</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-[#1e2738]">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs text-[#6b7a90]">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Instant Quick Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoQuickFill("operator")}
                className="py-2 px-3 rounded-lg bg-[#161c28] hover:bg-[#1f2838] border border-[#252d3d] text-xs text-[#a0aec0] hover:text-white transition-all font-medium cursor-pointer"
              >
                Operator Role →
              </button>
              <button
                type="button"
                onClick={() => handleDemoQuickFill("admin")}
                className="py-2 px-3 rounded-lg bg-[#161c28] hover:bg-[#1f2838] border border-[#252d3d] text-xs text-[#a0aec0] hover:text-white transition-all font-medium cursor-pointer"
              >
                Admin Role →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-[#3d4a5c]">
            Protected by SafetyNet Security Protocol
          </p>
          <p className="text-xs text-[#2a3344]">
            © 2026 SafetyNet — Industrial Safety Monitoring
          </p>
        </div>
      </div>
    </div>
  );
}
