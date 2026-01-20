"use client";

import { useRouter } from "next/navigation";
import { EstimatesManagement } from "@/components/EstimatesManagement";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <EstimatesManagement
          onCreateClick={(estimateId: string) => {
            router.push(`/estimate/${estimateId}`);
          }}
          onClick={(estimateId: string) => {
            router.push(`/estimate/${estimateId}`);
          }}
        />
      </div>
    </main>
  );
}
