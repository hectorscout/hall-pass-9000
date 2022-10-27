import type { Pass } from "@prisma/client";
import { intervalToDuration } from "date-fns";
import type { Duration } from "date-fns";
import React from "react";
import { HallPassLogRow } from "~/components/hallPassLog/hallPassLogRow";
import { formatDurationDigital } from "~/utils/utils";
import type { StatKeys } from "~/components/hallPassHistoryCard";
import type { SerializeFrom } from "@remix-run/server-runtime";

interface HallPassLogProps {
  counts: Record<StatKeys, number>;
  durations: Record<StatKeys, Duration>;
  passes: SerializeFrom<Pass>[];
}

const renderStats = (count: number, duration: Duration) => {
  return (
    <div className="flex gap-3">
      <div>{`${count} walk${count !== 1 ? "s" : ""}`}</div>
      <div>{formatDurationDigital(duration)}</div>
    </div>
  );
};

export const HallPassLog: React.FC<HallPassLogProps> = ({
  counts,
  durations,
  passes,
}) => {
  return (
    <div>
      <div className="flex justify-between">
        <div>Recreational:</div>
        <div>{renderStats(counts.personal, durations.personal)}</div>
      </div>
      <div className="flex justify-between">
        <div>Official:</div>
        <div>{renderStats(counts.official, durations.official)}</div>
      </div>{" "}
      <div className="flex justify-between">
        <div>Total:</div>
        <div>{renderStats(counts.total, durations.total)}</div>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_2fr_1fr] gap-x-2 gap-y-1">
        <div className="text-2xl">Date</div>
        <div className="text-2xl">Time</div>
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
              end: pass.endAt ? new Date(pass.endAt) : new Date(),
            })}
          />
        );
      })}
    </div>
  );
};
