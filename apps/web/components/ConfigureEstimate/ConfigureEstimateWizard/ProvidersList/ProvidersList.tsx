"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProviderLogo } from "../../_shared/ProviderLogo";
import { useProviders } from "./useProviders";
import { Provider } from "@/types/api";

interface Props {
  onSelect: (provider: Provider) => void;
  selectedId?: string;
}

export const ProvidersList: React.FC<Props> = ({ onSelect, selectedId }) => {
  const { providers, isLoading, error } = useProviders();

  if (isLoading) {
    return (
      <Card>
        <div className="text-center py-8">Loading providers...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Provider</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
              selectedId === provider.id
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onSelect(provider)}
          >
            <div className="flex justify-center mb-2">
              <ProviderLogo logoUrl={provider.logo_url} name={provider.name} />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm text-center">
              {provider.name}
            </h4>
            <p className="text-xs text-gray-600 text-center mt-1">
              {provider.location}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
