import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";
import { format, intervalToDuration } from "date-fns";
import { Pass } from "@prisma/client";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function getRequiredEnvVariable(name: string): string {
  const envVar = process.env[name];

  if (!envVar) {
    throw new Error("Missing required env variable " + name);
  }

  return envVar;
}

// Time utils
export const formatDateTime = (dateTimeStr: string | Date | null) => {
  if (!dateTimeStr) return "N/A";
  return format(new Date(dateTimeStr), "d-MMM-yy h:mm aaa");
};

export const formatDate = (dateTimeStr: string | Date | null) => {
  if (!dateTimeStr) return "N/A";
  return format(new Date(dateTimeStr), "d-MMM-yy");
};

export const formatTime = (dateTimeStr: string | Date | null) => {
  if (!dateTimeStr) return "N/A";
  return format(new Date(dateTimeStr), "h:mm aaa");
};

export const formatDurationDigital = (duration: Duration) => {
  return `${String(duration.hours).padStart(2, "0")}:${String(
    duration.minutes
  ).padStart(2, "0")}:${String(duration.seconds).padStart(2, "0")}`;
};

const WARNING_TIME_LIMIT = 5;
const ERROR_TIME_LIMIT = 10;
export type DurationStatus = "good" | "warning" | "critical";

export const getDurationStatus = (duration: Duration): DurationStatus => {
  const { years, months, weeks, days, hours, minutes } = duration;
  if (
    years ||
    months ||
    weeks ||
    days ||
    hours ||
    (minutes && minutes >= ERROR_TIME_LIMIT)
  ) {
    return "critical";
  } else if (minutes && minutes >= WARNING_TIME_LIMIT) {
    return "warning";
  }
  return "good";
};

export const getPassStatus = (pass: Pass) => {
  return getDurationStatus(
    intervalToDuration({
      start: new Date(pass.startAt),
      end: pass.endAt ? new Date(pass.endAt) : new Date(),
    })
  );
};
