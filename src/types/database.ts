export type LeadStatus = "new" | "contacted" | "closed";
export type BudgetRange = "under-5k" | "5k-25k" | "25k-100k" | "100k+";

export interface Lead {
  id: string;
  name: string;
  email: string;
  budget_range: BudgetRange;
  message: string;
  status: LeadStatus;
  created_at: string;
}

export interface LeadInput {
  name: string;
  email: string;
  budget_range: BudgetRange;
  message: string;
}
