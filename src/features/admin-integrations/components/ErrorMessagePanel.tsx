"use client";

import { AlertCircle, HelpCircle } from "lucide-react";

export function ErrorMessagePanel({ message, status }: { message: string; status: string }) {
  const remediation: Record<string, string[]> = {
    AUTHENTICATION_FAILED: [
      "Verify your API credentials are correct",
      "Check that the API key hasn't expired",
      "Ensure you've entered the correct authentication method",
    ],
    RATE_LIMITED: [
      "Wait a few minutes before retrying",
      "Check your API usage limits",
      "Consider upgrading your plan if consistently hitting limits",
    ],
    SERVICE_UNAVAILABLE: [
      "The provider service may be down temporarily",
      "Try again in a few moments",
      "Check the provider's status page",
    ],
    FAILED: [
      "Review the error message carefully",
      "Double-check all required credentials",
      "Consult the provider's documentation",
    ],
  };

  const suggestions = remediation[status] || remediation.FAILED;

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-3 space-y-2">
      <div className="flex gap-2 items-start">
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800">Connection Failed</p>
          <p className="text-xs text-red-700 mt-1 line-clamp-2">{message}</p>
        </div>
      </div>
      <div className="ml-6 space-y-1">
        <div className="flex items-center gap-1 text-xs text-red-700 font-medium">
          <HelpCircle className="w-3 h-3" />
          Try this:
        </div>
        <ul className="text-xs text-red-700 space-y-1 ml-4">
          {suggestions.map((suggestion, i) => (
            <li key={i} className="list-disc">
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
