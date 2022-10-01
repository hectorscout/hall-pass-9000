import type { Pass } from "@prisma/client";
import { intervalToDuration } from "date-fns";
import type { Duration } from "date-fns";
import React from "react";
import { HallPassLogRow } from "~/components/hallPassLog/hallPassLogRow";
import { formatDurationDigital } from "~/utils/utils";

type StatKeys = "total" | "personal" | "official";

interface HallPassLogProps {
  counts: Record<StatKeys, number>;
  durations: Record<StatKeys, Duration>;
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

export const HallPassLog: React.FC<HallPassLogProps> = ({
  counts,
  durations,
  passes,
}) => {
  return (
    <div>
      <div className="flex justify-between">
        <div>Recreational:</div>
        <div>{getStatString(counts.personal, durations.personal)}</div>
      </div>
      <div className="flex justify-between">
        <div>Official:</div>
        <div>{getStatString(counts.official, durations.official)}</div>
      </div>{" "}
      <div className="flex justify-between">
        <div>Total:</div>
        <div>{getStatString(counts.total, durations.total)}</div>
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
              end: pass.endAt ? new Date(pass.endAt) : new Date(),
            })}
          />
        );
      })}
    </div>
  );
};
