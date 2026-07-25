import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { BUDGET_OPTIONS, validateLead, type FieldErrors } from "@/lib/validation";
import type { BudgetRange, LeadInput } from "@/types/database";

interface ServerResponseBody {
  ok?: boolean;
  error?: string;
  errors?: Record<string, string>;
  lead?: unknown;
}

const EMPTY: LeadInput = { name: "", email: "", budget_range: undefined as never, message: "" };

export default function LeadForm() {
  const [form, setForm] = useState<LeadInput>(EMPTY);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof LeadInput>(key: K, value: LeadInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setClientErrors((e) => ({ ...e, [key]: undefined }));
    setServerError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const errors = validateLead(form);
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-lead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            budget_range: form.budget_range,
            message: form.message,
          }),
        }
      );

      const body = (await response.json().catch(() => null)) as ServerResponseBody | null;

      if (response.ok && body?.ok) {
        setSuccess(true);
        setForm(EMPTY);
      } else if (body && (body.errors || body.error)) {
        if (body.errors && Object.keys(body.errors).length > 0) {
          setClientErrors(body.errors);
        }
        setServerError(body.error || "Validation failed. Please check your details.");
      } else {
        setServerError(
          `Could not submit (${response.status}). Please try again.`
        );
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Thanks — we got your message!</h3>
        <p className="text-slate-400 mt-2 text-sm">
          Our team will reach out within one business day.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-5 text-sm text-blue-300 hover:text-blue-200 font-medium"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField label="Full name" error={clientErrors.name} htmlFor="lead-name">
        <input
          id="lead-name"
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Jane Doe"
          maxLength={100}
          className={inputClass(!!clientErrors.name)}
        />
      </FormField>

      <FormField label="Work email" error={clientErrors.email} htmlFor="lead-email">
        <input
          id="lead-email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="jane@company.com"
          className={inputClass(!!clientErrors.email)}
        />
      </FormField>

      <FormField label="Budget range" error={clientErrors.budget_range} htmlFor="lead-budget">
        <select
          id="lead-budget"
          value={form.budget_range ?? ""}
          onChange={(e) => update("budget_range", e.target.value as BudgetRange)}
          className={inputClass(!!clientErrors.budget_range)}
        >
          <option value="" disabled>
            Select a range
          </option>
          {BUDGET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="How can we help?" error={clientErrors.message} htmlFor="lead-message">
        <textarea
          id="lead-message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Tell us about your project, goals, and timeline..."
          rows={4}
          maxLength={2000}
          className={inputClass(!!clientErrors.message) + " resize-none"}
        />
        <div className="text-right text-xs text-slate-500 mt-1">
          {form.message.length}/2000
        </div>
      </FormField>

      {serverError && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send your request
          </>
        )}
      </button>
    </form>
  );
}

function FormField({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-sm font-medium text-slate-200 mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-300 mt-1">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `w-full bg-slate-900/60 border ${
    hasError ? "border-red-500/50" : "border-white/10"
  } rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition`;
}
