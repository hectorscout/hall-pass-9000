import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/models/user.server";
import { add, format, intervalToDuration } from "date-fns";
import type { Pass } from "@prisma/client";
import type { UserSettings } from "~/hooks/useUserSettings";
import { SerializeFrom } from "@remix-run/server-runtime";

const DEFAULT_REDIRECT = "/";
export const PERIODS = ["A1", "A2", "A3", "A4", "B5", "B6", "B7", "B8"];

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
  const hoursString = duration.hours
    ? `${String(duration.hours).padStart(2, "0")}:`
    : "";
  return `${hoursString}${String(duration.minutes).padStart(2, "0")}:${String(
    duration.seconds
  ).padStart(2, "0")}`;
};

export const compareDurations = (a: Duration, b: Duration) => {
  const diff =
    (a.years ?? 0) - (b.years ?? 0) ||
    (a.months ?? 0) - (b.months ?? 0) ||
    (a.weeks ?? 0) - (b.weeks ?? 0) ||
    (a.days ?? 0) - (b.days ?? 0) ||
    (a.hours ?? 0) - (b.hours ?? 0) ||
    (a.minutes ?? 0) - (b.minutes ?? 0) ||
    (a.seconds ?? 0) - (b.seconds ?? 0);
  return diff;
};

export type DurationStatus = "good" | "warning" | "critical";

export const getDurationStatus = (
  duration: Duration,
  userSettings: UserSettings
): DurationStatus => {
  const { years, months, weeks, days, hours, minutes } = duration;
  if (
    years ||
    months ||
    weeks ||
    days ||
    hours ||
    (minutes && minutes >= userSettings.critical)
  ) {
    return "critical";
  } else if (minutes && minutes >= userSettings.warning) {
    return "warning";
  }
  return "good";
};

export const getPassStatus = (pass: Pass, userSettings: UserSettings) => {
  return getDurationStatus(
    intervalToDuration({
      start: new Date(pass.startAt),
      end: pass.endAt ? new Date(pass.endAt) : new Date(),
    }),
    userSettings
  );
};

export type StatKeys = "total" | "personal" | "official";
export interface PassStats {
  counts: Record<StatKeys, number>;
  last: Record<StatKeys, null | Date>;
  durations: Record<StatKeys, Duration>;
  times: Record<StatKeys, Date>;
}
export const getPassStats = (passes: SerializeFrom<Pass>[]): PassStats => {
  const now = new Date();
  const emptyDuration = intervalToDuration({ start: now, end: now });
  return passes.reduce(
    (accum, pass) => {
      const startDate = new Date(pass.startAt);
      const passDuration = intervalToDuration({
        start: startDate,
        end: pass.endAt ? new Date(pass.endAt) : now,
      });

      const updateStat = (key: StatKeys, duration: Duration) => {
        accum.times[key] = add(accum.times[key], duration);
        accum.durations[key] = intervalToDuration({
          start: now,
          end: accum.times[key],
        });
        accum.last[key] = accum.last[key]
          ? new Date(
              Math.max(accum.last[key]?.valueOf() || 0, startDate.valueOf())
            )
          : startDate;
        accum.counts[key]++;
      };

      updateStat("total", passDuration);
      updateStat(pass.isPersonal ? "personal" : "official", passDuration);
      return accum;
    },
    {
      times: { total: now, personal: now, official: now },
      counts: { total: 0, personal: 0, official: 0 },
      last: {
        total: null,
        personal: null,
        official: null,
      },
      durations: {
        total: emptyDuration,
        personal: emptyDuration,
        official: emptyDuration,
      },
    } as PassStats
  );
};

export const capitalizeString = (s: string | undefined | null) => {
  if (!s) {
    return "";
  }
  return s[0].toUpperCase() + s.substring(1);
};
