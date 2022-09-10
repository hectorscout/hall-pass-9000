import type { Pass } from "@prisma/client";
import { useParams } from "@remix-run/react";
import { formatDuration } from "date-fns";
import React from "react";
import type { DurationStatus } from "~/utils/utils";
import { HallPassLogRow } from "~/components/hallPassLog/hallPassLogRow";

type ExtendedPass = Pick<Pass, "id" | "reason"> & {
  status: DurationStatus;
  duration: Duration;
  startAt: string;
  endAt: string | null;
};

interface HallPassLogProps {
  elapsedDuration: Duration;
  openPass?: Pick<Pass, "id" | "reason"> & { startAt: string };
  passes: ExtendedPass[];
  totalDuration: Duration;
}

export const HallPassLog: React.FC<HallPassLogProps> = ({
  passes,
  totalDuration,
  openPass,
  elapsedDuration,
}) => {
  const { passId } = useParams();

  return (
    <div>
      <h2 className="mb-5 flex justify-between align-middle">
        <div className="text-5xl">Space Walk Log:</div>
        {passes.length ? (
          <div className="flex flex-col justify-center">
            <span className="ml-10">{`${passes.length} walk${
              passes.length > 1 ? "s" : ""
            }`}</span>
            <span className="ml-10">{formatDuration(totalDuration)}</span>
          </div>
        ) : null}
      </h2>
      <div className="mt-1 grid grid-cols-[30px_1fr_1fr_1fr] gap-x-2 gap-y-1">
        <div />
        <div className="text-2xl">Start</div>
        <div className="text-2xl">End</div>
        <div className="text-2xl">Duration</div>
        <hr className="col-span-4 mb-2" />
      </div>
      {openPass ? (
        <HallPassLogRow
          pass={openPass}
          duration={elapsedDuration}
          selectedPassId={passId}
        />
      ) : null}
      {passes.map((pass) => {
        return (
          <HallPassLogRow
            key={pass.id}
            pass={pass}
            duration={pass.duration}
            selectedPassId={passId}
          />
        );
      })}
    </div>
  );
};
