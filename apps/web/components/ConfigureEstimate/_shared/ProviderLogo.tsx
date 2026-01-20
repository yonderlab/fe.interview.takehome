"use client";

import { useState } from "react";
import { VenueSkeleton } from "@/components/ui/VenueSkeleton";

interface Props {
  logoUrl: string | null;
  name: string;
  size?: "small" | "medium";
}

export const ProviderLogo: React.FC<Props> = ({
  logoUrl,
  name,
  size = "medium",
}) => {
  const [imageError, setImageError] = useState(false);

  if (!logoUrl || imageError) {
    return (
      <VenueSkeleton className={size === "small" ? "h-8 w-8" : "h-12 w-12"} />
    );
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      className={size === "small" ? "h-6 w-auto" : "h-8 w-auto"}
      onError={() => setImageError(true)}
    />
  );
};
