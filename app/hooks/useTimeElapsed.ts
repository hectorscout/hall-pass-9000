import { useEffect, useState } from "react";
import { clearInterval } from "timers";
import { formatDuration, intervalToDuration } from "date-fns";

const WARNING_TIME_LIMIT = 5;
const ERROR_TIME_LIMIT = 10;
export type DurationStatus = "good" | "warning" | "error";

export const useTimeElapsed = (
  intervals: (Partial<Interval> & Pick<Interval, "start">)[]
) => {
  const getDurationStatus = (duration: Duration): DurationStatus => {
    const { years, months, weeks, days, hours, minutes } = duration;
    if (
      years ||
      months ||
      weeks ||
      days ||
      hours ||
      (minutes && minutes >= ERROR_TIME_LIMIT)
    ) {
      return "error";
    } else if (minutes && minutes >= WARNING_TIME_LIMIT) {
      return "warning";
    }
    return "good";
  };
  const hasOpen = intervals.some((interval) => !interval.end);
  const createDurations = (): {
    duration: Duration;
    formattedDuration: string;
    status: DurationStatus;
  }[] => {
    return intervals.map(({ start, end }) => {
      const duration = intervalToDuration({
        start,
        end: end ?? new Date(),
      });
      return {
        duration,
        formattedDuration: formatDuration(duration),
        status: getDurationStatus(duration),
      };
    });
  };

  const [elapsedDurations, setElapsedDurations] = useState(createDurations());

  useEffect(() => {
    const tick = () => {
      setElapsedDurations(createDurations());
    };

    // TODO: figure out how to make this work
    // const interval = hasOpen ? setInterval(tick, 1000) : null;
    const interval = setInterval(tick, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  });

  return elapsedDurations;
};
