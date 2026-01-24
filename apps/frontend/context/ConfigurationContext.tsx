"use client";

import { Plan, Provider } from "@/types";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type ConfigurationContextValue = {
  selectedProvider?: Provider;
  selectedPlan?: Plan;
  setSelectedProvider: (provider?: Provider) => void;
  setSelectedPlan: (plan?: Plan) => void;
  reset: () => void;
  warningBarData?: { type: "error" | "warning"; message: string };
  setWarningBarData: (
    data: { type: "error" | "warning"; message: string } | undefined,
  ) => void;
};

const ConfigurationContext = createContext<ConfigurationContextValue | null>(
  null,
);

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const [selectedProvider, setSelectedProvider] = useState<Provider>();
  const [selectedPlan, setSelectedPlan] = useState<Plan>();
  const [warningBarData, setWarningBarData] = useState<{
    type: "error" | "warning";
    message: string;
  }>();
  const router = useRouter();

  const reset = () => {
    setSelectedProvider(undefined);
    setSelectedPlan(undefined);
    router.push("/configure");
  };

  const value = useMemo<ConfigurationContextValue>(
    () => ({
      selectedProvider,
      selectedPlan,
      setSelectedProvider,
      setSelectedPlan,
      reset,
      warningBarData,
      setWarningBarData,
    }),
    [
      selectedPlan,
      selectedProvider,
      warningBarData,
      setWarningBarData,
      reset,
      setSelectedPlan,
      setSelectedProvider,
    ],
  );

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfiguration() {
  const ctx = useContext(ConfigurationContext);
  if (!ctx) {
    throw new Error(
      "useConfiguration must be used within a ConfigurationProvider",
    );
  }
  return ctx;
}
