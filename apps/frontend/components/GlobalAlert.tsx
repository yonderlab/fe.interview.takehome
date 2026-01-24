"use client";
import { useConfiguration } from "@/context/ConfigurationContext";
import { Button, Callout } from "@radix-ui/themes";
import { CircleX, TriangleAlertIcon } from "lucide-react";

export const GlobalAlert = () => {
  const { warningBarData, setWarningBarData } = useConfiguration();

  if (!warningBarData) {
    return null;
  }

  const clearWarning = () => {
    setWarningBarData(undefined);
  };
  const color = warningBarData.type === "warning" ? "amber" : "red";
  return (
    <Callout.Root
      color={color}
      role="alert"
      style={{ display: "flex", width: "100%" }}
    >
      <Callout.Icon>
        <TriangleAlertIcon />
      </Callout.Icon>
      <Callout.Text style={{ flex: 1 }}>
        <span className="flex justify-between items-center w-full">
          {warningBarData.message}
          <Button variant="ghost" onClick={clearWarning}>
            <CircleX />
          </Button>
        </span>
      </Callout.Text>
    </Callout.Root>
  );
};
