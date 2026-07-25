import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";
declare const Deno: any;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const BUDGETS = ["under-5k", "5k-25k", "25k-100k", "100k+"] as const;
type Budget = (typeof BUDGETS)[number];

interface LeadInput {
  name?: unknown;
  email?: unknown;
  budget_range?: unknown;
  message?: unknown;
}

function validate(input: LeadInput): {
  ok: boolean;
  errors: Record<string, string>;
  clean?: { name: string; email: string; budget_range: Budget; message: string };
} {
  const errors: Record<string, string> = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const budget_range = typeof input.budget_range === "string" ? input.budget_range : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (name.length < 1 || name.length > 100) {
    errors.name = "Name must be between 1 and 100 characters.";
  }
  if (!EMAIL_RE.test(email)) {
    errors.email = "Please provide a valid email address.";
  }
  if (!BUDGETS.includes(budget_range as Budget)) {
    errors.budget_range = "Please select a valid budget range.";
  }
  if (message.length < 10 || message.length > 2000) {
    errors.message = "Message must be between 10 and 2000 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    errors: {},
    clean: {
      name,
      email,
      budget_range: budget_range as Budget,
      message,
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body: LeadInput;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body.", errors: {} }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const result = validate(body);
  if (!result.ok) {
    return new Response(
      JSON.stringify({ error: "Validation failed.", errors: result.errors }),
      { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { name, email, budget_range, message } = result.clean!;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase
    .from("leads")
    .insert([{ name, email, budget_range, message, status: "new" }])
    .select("id, name, email, budget_range, message, status, created_at")
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Could not save your submission. Please try again.", errors: {} }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, lead: data }),
    { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
