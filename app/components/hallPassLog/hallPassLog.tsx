import type { Pass } from "@prisma/client";
import { useParams } from "@remix-run/react";
import { formatDuration } from "date-fns";
import React from "react";
import { HallPassLogRow } from "~/components/hallPassLog/hallPassLogRow";

type ExtendedPass = Pick<Pass, "id" | "reason"> & {
  duration: Duration;
  startAt: string;
  endAt: string | null;
  isPersonal: boolean;
};

interface HallPassLogProps {
  elapsedDuration: Duration;
  openPass?: Pick<Pass, "id" | "reason" | "isPersonal"> & { startAt: string };
  passes: ExtendedPass[];
  personalCount: Number;
  personalDuration: Duration;
}

export const HallPassLog: React.FC<HallPassLogProps> = ({
  elapsedDuration,
  openPass,
  passes,
  personalCount,
  personalDuration,
}) => {
  const { passId } = useParams();

  return (
    <div>
      <h2 className="mb-5 flex justify-between align-middle">
        <div className="text-5xl">Space Walk Log:</div>
        {personalCount ? (
          <div className="flex flex-col justify-center">
            <span className="ml-10">{`${personalCount} walk${
              personalCount > 1 ? "s" : ""
            }`}</span>
            <span className="ml-10">{formatDuration(personalDuration)}</span>
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
