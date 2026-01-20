// API Types based on the backend schemas

export interface Provider {
  id: string;
  name: string;
  location: string;
  logo_url: string | null;
}

export interface ProvidersResponse {
  items: Provider[];
}

export interface PlanOption {
  code: string;
  description?: string;
  required: boolean;
  values: string[];
}

export interface PlanAddon {
  id: string;
  name: string;
  price_cents: number;
  currency: string;
}

export interface Plan {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  base_price_cents: number;
  currency: string;
  approval_type: "none" | "manager_review";
  min_participants: number;
  lead_time_days: number;
  options: PlanOption[];
  addons: PlanAddon[];
}

export interface PlansResponse {
  items: Plan[];
}

export interface EstimatePlan {
  id: string;
  name: string;
}

export interface Pricing {
  base: number;
  addons: number;
  total: number;
  currency: string;
}

export type EstimateStatus =
  | "draft"
  | "submitted"
  | "quote_available"
  | "pending_approval"
  | "finalised"
  | "rejected"
  | "expired";

export interface Estimate {
  id: string;
  status: EstimateStatus;
  plan: EstimatePlan;
  selections: Record<string, string | string[]>;
  pricing: Pricing;
  blocking_reasons: string[];
}

export interface EstimatesResponse {
  items: Estimate[];
}

export interface UpdateEstimateRequest {
  plan_id: string;
  selections: Record<string, string | string[]>;
}

export interface FinaliseEstimateResponse {
  id: string;
  status: EstimateStatus;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
