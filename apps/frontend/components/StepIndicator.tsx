"use client";

import { usePathname } from "next/navigation";

const steps = ["Plan & Provider", "Configure", "Review", "Submit"];

function getStepFromPath(pathname: string | null): number {
  if (!pathname) return 1;
  if (pathname.startsWith("/configure/submitted")) return 4;
  if (pathname.startsWith("/configure/review")) return 3;
  if (pathname.startsWith("/configure/options")) return 2;
  if (pathname.startsWith("/configure")) return 1;
  return 1;
}

export function StepIndicator() {
  const pathname = usePathname();
  const currentStep = getStepFromPath(pathname);

  return (
    <nav
      aria-label="Progress"
      className="w-full flex items-center justify-center"
    >
      <ol className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;
          const circleClasses = isActive
            ? "bg-slate-900 text-white border-slate-900"
            : isComplete
              ? "bg-slate-200 text-slate-900 border-slate-200"
              : "bg-white text-slate-600 border-slate-200";

          return (
            <li
              key={label}
              aria-current={isActive ? "step" : undefined}
              className="flex items-center gap-2"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${circleClasses}`}
              >
                {stepNumber}
              </span>
              <span className={isActive ? "text-slate-900" : "text-slate-600"}>
                {label}
              </span>
              {stepNumber < steps.length && (
                <span
                  className="mx-2 h-px w-8 shrink-0 bg-slate-200"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
