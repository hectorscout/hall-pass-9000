import { Button } from "~/components/common/button";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import {
  ArrowsPointingInIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import type { Pass } from "@prisma/client";
import { add, intervalToDuration } from "date-fns";
import type { Duration } from "date-fns";
import { formatDate, formatDurationDigital } from "~/utils/utils";
import { HallPassLog } from "~/components/hallPassLog/hallPassLog";
import { useUserSettings } from "~/hooks/useUserSettings";

export type StatKeys = "total" | "personal" | "official";

interface HallPassHistoryCardProps {
  passes: (Pick<Pass, "id" | "isPersonal" | "reason"> & {
    startAt: string;
    endAt: string | null;
  })[];
}

const getStatString = (count: number, duration: Duration) => {
  return `${count} walk${count !== 1 ? "s" : ""} ${formatDurationDigital(
    duration
  )}`;
};

export const HallPassHistoryCard = ({ passes }: HallPassHistoryCardProps) => {
  const { expandPassLog } = useUserSettings();
  const [expanded, setExpanded] = useState(expandPassLog);

  if (passes.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-800 p-5 text-gray-300">
        This Cadet has not walked in space.
      </div>
    );
  }

  const now = new Date();
  const emptyDuration = intervalToDuration({ start: now, end: now });
  const stats = passes.reduce(
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
      } as Record<StatKeys, null | Date>,
      durations: {
        total: emptyDuration,
        personal: emptyDuration,
        official: emptyDuration,
      } as Record<StatKeys, Duration>,
    }
  );

  return (
    <div className="rounded-2xl bg-gray-800/80 p-5 text-gray-300">
      {expanded ? (
        <div>
          <div className="mb-5 flex justify-start">
            <span className="mr-5 text-5xl">Space Walk Log:</span>
            <Button kind="ghost" onClick={() => setExpanded(false)}>
              <ArrowsPointingInIcon className="h-9 w-9" />
            </Button>
          </div>
          <HallPassLog
            counts={stats.counts}
            durations={stats.durations}
            passes={passes}
          />
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <div>
            <div className="text-2xl">
              {getStatString(stats.counts.personal, stats.durations.personal)}
            </div>
            <div className="flex items-center justify-between">
              <div>Last: {formatDate(stats.last.personal)}</div>
              <span title="Only recreational space walks are included here.">
                <InformationCircleIcon className="h-5 w-5" />
              </span>
            </div>
          </div>
          <Button
            kind="ghost"
            onClick={() => setExpanded(true)}
            title="View full space walk log."
          >
            <ArrowsPointingOutIcon className="h-9 w-9" />
          </Button>
        </div>
      )}
    </div>
  );
};
