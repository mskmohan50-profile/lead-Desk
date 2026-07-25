import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Inbox,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import LeadForm from "@/components/LeadForm";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />
      <Hero />
      <Features />
      <FormSection />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-semibold tracking-tight">LeadDesk</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#contact" className="hover:text-white transition-colors">
            Get started
          </a>
          <Link
            to="/login"
            className="text-white border border-white/15 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Lead capture, simplified
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto">
          Capture every lead.
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Close every deal.
          </span>
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          A fast, focused lead-capture pipeline. Collect inbound inquiries, organize
          them by status, and follow up before they go cold.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl px-5 py-3 transition-colors"
          >
            Get started
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 border border-white/15 hover:bg-white/5 text-white font-semibold rounded-xl px-5 py-3 transition-colors"
          >
            Admin dashboard
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Set up in minutes
          </span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: <Inbox className="w-5 h-5" />,
      title: "Unified inbox",
      desc: "Every submission lands in one organized dashboard — no spreadsheets, no missed emails.",
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Instant search",
      desc: "Find any lead by name, email, or message in milliseconds. Filter by status in one click.",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Status pipeline",
      desc: "Move leads from New to Contacted to Closed so your team always knows what's next.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Validated & secure",
      desc: "Every submission is checked on the client and server. Your data is locked behind admin auth.",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Zero follow-up lag",
      desc: "Leads are stored instantly with timestamps so you can respond while interest is hot.",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Built to scale",
      desc: "Powered by Postgres with row-level security — enterprise-grade storage from day one.",
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Everything you need to work leads
        </h2>
        <p className="text-slate-400 mt-4">
          A complete toolkit for capturing, tracking, and converting inbound interest.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <div
            key={item.title}
            className="group rounded-2xl bg-white/[0.03] border border-white/10 p-6 hover:bg-white/[0.06] hover:border-white/20 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FormSection() {
  return (
    <section id="contact" className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="lg:sticky lg:top-24">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Let's get you started
          </h2>
          <p className="text-slate-400 mt-4 text-lg leading-relaxed">
            Tell us a bit about your team and what you're looking for. We'll get back
            to you within one business day.
          </p>
          <ul className="mt-8 space-y-3 text-slate-300">
            {[
              "Personalized onboarding",
              "Custom workflow setup",
              "No long-term contracts",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 sm:p-8 backdrop-blur-xl">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-5 text-center text-xs text-slate-500">
  <p>
    Built for{" "}
    <a
      href="https://digitalheroesco.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-400 hover:text-cyan-300 underline"
    >
      Digital Heroes Training Task
    </a>
  </p>

  <p className="mt-2">
    Live Demo:{" "}
    <a
      href="https://your-live-url.com"
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-400 hover:text-cyan-300 underline"
    >
      https://your-live-url.com
    </a>
  </p>
</footer>
  );
}
