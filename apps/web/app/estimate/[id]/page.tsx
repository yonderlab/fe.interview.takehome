"use client";

import { useParams, useRouter } from "next/navigation";
import { ConfigureEstimate } from "@/components/ConfigureEstimate";

export default function EstimatePage() {
  const params = useParams();
  const router = useRouter();
  const estimateId = params.id as string;

  return (
    <ConfigureEstimate
      estimateId={estimateId}
      onBackToEstimates={() => router.push("/")}
    />
  );
}
