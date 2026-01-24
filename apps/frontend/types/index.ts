export type Provider = {
  id: string;
  name: string;
  location?: string;
  logo_url?: string;
};

export type PlanOption = {
  code: string;
  description?: string;
  required: boolean;
  values: string[];
};

export type PlanAddon = {
  id: string;
  name: string;
  price_cents: number;
  currency: string;
};

export enum ApprovalType {
  None = "none",
  ManagerReview = "manager_review",
}

export type Plan = {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  base_price_cents: number;
  currency: string;
  approval_type: ApprovalType;
  min_participants: number;
  lead_time_days: number;
  options: PlanOption[];
  addons: PlanAddon[];
};

export type ProvidersResponse = { items: Provider[] };
export type PlansResponse = { items: Plan[] };

export enum EstimateStatus {
  Draft = "draft",
  Submitted = "submitted",
  QuoteAvailable = "quote_available",
  PendingApproval = "pending_approval",
  Finalised = "finalised",
  Rejected = "rejected",
  Expired = "expired",
}

export type Estimate = {
  id: string;
  status: EstimateStatus;
  plan?: { id: string; name: string };
  selections: {
    [optionCode: string]: string | string[];
    addons: string[];
  };
  pricing: {
    base: number;
    addons: number;
    total: number;
    currency: string;
  };
  blocking_reasons: string[];
};

export type UpdateEstimateBody = {
  plan_id?: string;
  selections?: {
    addons?: string[];
    [optionCode: string]: unknown;
  };
};
