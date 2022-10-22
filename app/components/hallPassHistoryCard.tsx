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
import { formatDate, formatDurationDigital, getPassStats } from "~/utils/utils";
import { HallPassLog } from "~/components/hallPassLog/hallPassLog";
import { useUserSettings } from "~/hooks/useUserSettings";
import { SerializeFrom } from "@remix-run/server-runtime";

export type StatKeys = "total" | "personal" | "official";

interface HallPassHistoryCardProps {
  passes: SerializeFrom<Pass>[];
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

  const stats = getPassStats(passes);

  return (
    <div className="rounded-2xl bg-gray-800/80 p-5 text-gray-300">
      {expanded ? (
        <div>
          <div className="mb-5 flex justify-start">
            <span className="mr-5 text-5xl">Space Walk Log</span>
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
