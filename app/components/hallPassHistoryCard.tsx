import { Button } from "~/components/common/button";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { ArrowsPointingInIcon } from "@heroicons/react/20/solid";
import { Pass } from "@prisma/client";
import { add, Duration, intervalToDuration } from "date-fns";
import { formatDate, formatDurationDigital } from "~/utils/utils";
import { HallPassLogRow } from "~/components/hallPassLog/hallPassLogRow";

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
  const [expanded, setExpanded] = useState(true);

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
  const totalDuration = intervalToDuration({
    start: now,
    end: stats.durations.total,
  });
  const personalDuration = intervalToDuration({
    start: now,
    end: stats.durations.personal,
  });
  const officialDuration = intervalToDuration({
    start: now,
    end: stats.durations.official,
  });

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
          <div className="flex justify-between">
            <div>Recreational:</div>
            <div>{getStatString(stats.counts.personal, personalDuration)}</div>
          </div>
          <div className="flex justify-between">
            <div>Official:</div>
            <div>{getStatString(stats.counts.official, officialDuration)}</div>
          </div>{" "}
          <div className="flex justify-between">
            <div>Total:</div>
            <div>{getStatString(stats.counts.total, totalDuration)}</div>
          </div>
          <div className="mt-5 grid grid-cols-[30px_2fr_1fr_1fr] gap-x-2 gap-y-1">
            <div />
            <div className="text-2xl">Start</div>
            <div className="text-2xl">End</div>
            <div className="text-2xl">Duration</div>
            <hr className="col-span-4 mb-2" />
          </div>
          {passes.map((pass) => {
            return (
              <HallPassLogRow
                key={pass.id}
                pass={pass}
                duration={intervalToDuration({
                  start: new Date(pass.startAt),
                  end: new Date(pass.endAt || ""),
                })}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-5">
          <div title="Only recreational space walks are included here.">
            <div className="text-2xl">
              {getStatString(stats.counts.personal, personalDuration)}
            </div>
            <div>Last: {formatDate(stats.last.personal)}</div>
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
