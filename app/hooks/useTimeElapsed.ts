import { useEffect, useState } from "react";
import { clearInterval } from "timers";
import { formatDuration, intervalToDuration } from "date-fns";

export const useTimeElapsed = (
  intervals: (Partial<Interval> & Pick<Interval, "start">)[]
) => {
  const hasOpen = intervals.some((interval) => !interval.end);
  const createDurations = (): Duration[] => {
    return intervals.map(({ start, end }) =>
      intervalToDuration({
        start,
        end: end ?? new Date(),
      })
    );
  };

  const [elapsedDurations, setElapsedDurations] = useState(createDurations());

  useEffect(() => {
    const tick = () => {
      setElapsedDurations(createDurations());
    };

    const interval = hasOpen ? setInterval(tick, 1000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  });

  return elapsedDurations.map((elapsedDuration) =>
    formatDuration(elapsedDuration)
  );
};
