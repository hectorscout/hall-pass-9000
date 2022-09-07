import { useEffect, useState } from "react";
import { clearInterval } from "timers";
import { intervalToDuration } from "date-fns";

export const useTimeElapsed = (intervals: Pick<Interval, "start">[]) => {
  const [elapsedDurations, setElapsedDurations] = useState<Duration[]>(
    intervals.map(({ start }) => intervalToDuration({ start, end: new Date() }))
  );

  useEffect(() => {
    const tick = () => {
      setElapsedDurations(
        intervals.map(({ start }) =>
          intervalToDuration({ start, end: new Date() })
        )
      );
    };

    tick();
    const interval = intervals.length ? setInterval(tick, 1000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [intervals]);

  return elapsedDurations;
};
