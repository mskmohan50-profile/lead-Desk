import { useEffect, useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ExternalLink,
  Inbox,
  Loader2,
  LogOut,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { budgetLabel } from "@/lib/validation";
import type { Lead, LeadStatus } from "@/types/database";

type StatusFilter = "all" | LeadStatus;

const STATUS_META: Record<LeadStatus, { label: string; dot: string; chip: string }> = {
  new: {
    label: "New",
    dot: "bg-blue-400",
    chip: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  contacted: {
    label: "Contacted",
    dot: "bg-amber-400",
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  closed: {
    label: "Closed",
    dot: "bg-emerald-400",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
};

const STATUS_ORDER: LeadStatus[] = ["new", "contacted", "closed"];

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setLeads((data ?? []) as Lead[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q)
      );
    });
  }, [leads, query, statusFilter]);

  const counts = useMemo(() => {
    const c = { all: leads.length, new: 0, contacted: 0, closed: 0 };
    for (const l of leads) c[l.status] += 1;
    return c;
  }, [leads]);

  const cycleStatus = async (lead: Lead) => {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(lead.status) + 1) % STATUS_ORDER.length];
    setUpdatingId(lead.id);
    const { error } = await supabase
      .from("leads")
      .update({ status: next })
      .eq("id", lead.id);
    setUpdatingId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: next } : l))
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-semibold tracking-tight">LeadDesk</span>
            <span className="text-slate-600 mx-2">/</span>
            <span className="text-slate-400 text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-500">{user?.email}</span>
            <Link
              to="/"
              className="text-sm text-slate-300 hover:text-white border border-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View site
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-300 hover:text-white border border-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
            <p className="text-slate-400 text-sm mt-1">
              {counts.all} total · {counts.new} new · {counts.contacted} contacted · {counts.closed} closed
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or message..."
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 transition"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 bg-slate-900/60 border border-white/10 rounded-xl p-1">
            <FilterTab
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label="All"
              count={counts.all}
            />
            <FilterTab
              active={statusFilter === "new"}
              onClick={() => setStatusFilter("new")}
              label="New"
              count={counts.new}
            />
            <FilterTab
              active={statusFilter === "contacted"}
              onClick={() => setStatusFilter("contacted")}
              label="Contacted"
              count={counts.contacted}
            />
            <FilterTab
              active={statusFilter === "closed"}
              onClick={() => setStatusFilter("closed")}
              label="Closed"
              count={counts.closed}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasLeads={leads.length > 0} />
        ) : (
          <div className="space-y-3">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                updating={updatingId === lead.id}
                onToggle={() => cycleStatus(lead)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
        active ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"
      }`}
    >
      {label}
      <span className={`text-xs ${active ? "text-slate-500" : "text-slate-600"}`}>
        {count}
      </span>
    </button>
  );
}

function LeadCard({
  lead,
  updating,
  onToggle,
}: {
  lead: Lead;
  updating: boolean;
  onToggle: () => void;
}) {
  const meta = STATUS_META[lead.status];
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:border-white/20 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold truncate">{lead.name}</h3>
            <a
              href={`mailto:${lead.email}`}
              className="text-sm text-blue-300 hover:text-blue-200 truncate"
            >
              {lead.email}
            </a>
          </div>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed line-clamp-2">
            {lead.message}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              {budgetLabel(lead.budget_range)}
            </span>
            <span>{formatDate(lead.created_at)}</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={updating}
          className={`flex-shrink-0 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${meta.chip}`}
          title="Click to advance status"
        >
          {updating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
          )}
          {meta.label}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasLeads }: { hasLeads: boolean }) {
  return (
    <div className="text-center py-24">
      <div className="mx-auto w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white">
        {hasLeads ? "No leads match your search" : "No leads yet"}
      </h3>
      <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
        {hasLeads
          ? "Try adjusting your search or status filter."
          : "Submit a lead from the public landing page and it will appear here."}
      </p>
      {!hasLeads && (
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mt-5 text-sm text-blue-300 hover:text-blue-200 font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Go to landing page
        </Link>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
