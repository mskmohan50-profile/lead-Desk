import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fn = isSignup ? signUp : signIn;
    const { error } = await fn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">LeadDesk</span>
          </Link>
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Turn inbound leads into closed deals.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Capture, organize, and follow up with every prospect — all from one
              streamlined admin workspace.
            </p>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} LeadDesk Mini</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">LeadDesk</span>
            </Link>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              {isSignup ? "Create your admin account" : "Sign in to your dashboard"}
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              {isSignup
                ? "Set up the admin account that manages incoming leads."
                : "Welcome back. Manage your leads below."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field
                label="Email"
                icon={<Mail className="w-4 h-4" />}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
                autoComplete="email"
              />
              <Field
                label="Password"
                icon={<Lock className="w-4 h-4" />}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="At least 6 characters"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />

              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold rounded-lg py-2.5 hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isSignup ? "Create account" : "Sign in"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-slate-400 mt-6 text-center">
              {isSignup ? "Already have an account? " : "Need an admin account? "}
              <Link
                to={isSignup ? "/login" : "/signup"}
                className="text-blue-300 hover:text-blue-200 font-medium"
              >
                {isSignup ? "Sign in" : "Create one"}
              </Link>
            </p>
          </div>

          <p className="text-slate-500 text-xs mt-6 text-center">
            <Link to="/" className="hover:text-slate-400">
              ← Back to landing page
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-300 mb-1.5">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition"
        />
      </div>
    </label>
  );
}
