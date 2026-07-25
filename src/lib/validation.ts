import type { BudgetRange, LeadInput } from "@/types/database";

export const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-25k", label: "$5,000 – $25,000" },
  { value: "25k-100k", label: "$25,000 – $100,000" },
  { value: "100k+", label: "$100,000+" },
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type FieldErrors = Partial<Record<keyof LeadInput, string>>;

export function validateLead(input: Partial<LeadInput>): FieldErrors {
  const errors: FieldErrors = {};

  const name = input.name?.trim() ?? "";
  if (name.length < 1) errors.name = "Please enter your name.";
  else if (name.length > 100) errors.name = "Name must be 100 characters or fewer.";

  const email = input.email?.trim() ?? "";
  if (!email) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";

  if (!input.budget_range) {
    errors.budget_range = "Please select a budget range.";
  }

  const message = input.message?.trim() ?? "";
  if (message.length < 10) errors.message = "Message must be at least 10 characters.";
  else if (message.length > 2000) errors.message = "Message must be 2000 characters or fewer.";

  return errors;
}

export function budgetLabel(value: BudgetRange): string {
  return BUDGET_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
