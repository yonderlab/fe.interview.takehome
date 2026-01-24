"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { ConfigurationProvider } from "@/context/ConfigurationContext";
import { Theme } from "@radix-ui/themes";

export interface ProvidersProps {
  children: React.ReactNode;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export function Providers({ children }: ProvidersProps) {
  return (
    <Theme>
      <ConfigurationProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ConfigurationProvider>
    </Theme>
  );
}
