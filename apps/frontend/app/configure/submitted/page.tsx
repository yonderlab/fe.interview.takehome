"use client";

import { useConfiguration } from "@/context/ConfigurationContext";
import { useEstimateWithDrift } from "@/fetch/hooks";
import { EstimateStatus } from "@/types";
import { Badge, Button, Card, Spinner } from "@radix-ui/themes";

const statusMap: Record<string, string> = {
  pending_approval: "Pending Review",
  finalised: "Finalised",
  rejected: "Rejected",
};
export default function SubmittedPage() {
  const { data, isLoading } = useEstimateWithDrift();
  const { reset } = useConfiguration();

  const handleStartNew = () => {
    reset();
  };

  if (isLoading) {
    return (
      <Card>
        <Spinner loading={true}>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        </Spinner>
      </Card>
    );
  }

  const status = data?.estimate ? statusMap[data.estimate.status] : "";
  return (
    <Card>
      <h1 className="text-2xl font-bold mb-4">
        Thank you for your submission!
      </h1>
      <p className="mb-2">
        Your estimate is:
        {data?.estimate.status === EstimateStatus.Finalised && (
          <Badge size={"3"} color="green" className="ml-2">
            {status}
          </Badge>
        )}
        {data?.estimate.status === EstimateStatus.PendingApproval && (
          <Badge size={"3"} color="yellow" className="ml-2">
            {status}
          </Badge>
        )}
      </p>
      <Button onClick={handleStartNew}>Start New</Button>
    </Card>
  );
}
