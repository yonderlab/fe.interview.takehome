"use client";

import React from "react";
import { WizardStep } from "./WizardStep";

interface Props {
  steps: WizardStep[];
}

export const Wizard: React.FC<Props> = ({ steps }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={step.onClick}
                disabled={!step.isCompleted && !step.isActive}
                className={`flex items-center transition-all ${
                  step.isCompleted || step.isActive
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    step.isCompleted
                      ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                      : step.isActive
                        ? "bg-blue-100 border-blue-600 text-blue-600 ring-2 ring-blue-200"
                        : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {step.isCompleted ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div
                    className={`text-sm font-medium ${
                      step.isActive
                        ? "text-blue-600"
                        : step.isCompleted
                          ? "text-gray-900"
                          : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </button>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 min-w-[40px] transition-colors ${
                  step.isCompleted ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      {steps.map((step) => (
        <div
          key={step.id}
          className={step.isActive ? "block animate-fadeIn" : "hidden"}
        >
          <section>{step.component}</section>
        </div>
      ))}
    </div>
  );
};
