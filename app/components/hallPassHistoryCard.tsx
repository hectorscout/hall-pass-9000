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
  const [expanded, setExpanded] = useState(false);

  if (passes.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-800 p-5 text-gray-300">
        This Cadet has not walked in space.
      </div>
    );
  }

  const now = new Date();
  const stats = passes.reduce(
    (c, pass) => {
      const startDate = new Date(pass.startAt);
      const duration = intervalToDuration({
        start: startDate,
        end: pass.endAt ? new Date(pass.endAt) : now,
      });

      c.durations.total = add(c.durations.total, duration);
      c.last.total = c.last.total
        ? new Date(Math.max(c.last.total.valueOf(), startDate.valueOf()))
        : startDate;
      c.counts.total++;
      if (pass.isPersonal) {
        c.durations.personal = add(c.durations.personal, duration);
        c.counts.personal++;
        c.last.personal = c.last.personal
          ? new Date(Math.max(c.last.personal.valueOf(), startDate.valueOf()))
          : startDate;
      } else {
        c.durations.official = add(c.durations.official, duration);
        c.counts.official++;
      }
      return c;
    },
    {
      durations: { total: now, personal: now, official: now },
      counts: { total: 0, personal: 0, official: 0 },
      last: { total: null, personal: null, official: null } as Record<
        "total" | "personal" | "official",
        null | Date
      >,
    }
  );
  const durations = {
    total: intervalToDuration({
      start: now,
      end: stats.durations.total,
    }),
    personal: intervalToDuration({
      start: now,
      end: stats.durations.personal,
    }),
    official: intervalToDuration({
      start: now,
      end: stats.durations.official,
    }),
  };

  return (
    <div className="rounded-2xl bg-gray-800 p-5 text-gray-300">
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
            durations={durations}
            passes={passes}
          />
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <div>
            <div className="text-2xl">
              {getStatString(stats.counts.personal, durations.personal)}
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
