import { Pass } from "@prisma/client";
import { Link, useParams } from "@remix-run/react";
import { formatDuration } from "date-fns";
import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import {
  DurationStatus,
  formatDateTime,
  getDurationStatus,
} from "~/utils/utils";

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

const statusColors = {
  good: undefined,
  warning: "text-yellow-600",
  error: "text-red-600",
};

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
      {passes.map(({ duration, id, reason, startAt, endAt, status }) => {
        return (
          <>
            <Link
              to={id}
              title={reason || "N/A"}
              className={`mt-1 grid grid-cols-[30px_1fr_1fr_1fr] gap-x-2 gap-y-1 hover:bg-gray-200 ${
                id === passId ? "bg-amber-100" : ""
              }`}
              key={id}
            >
              {status !== "good" ? (
                <ExclamationTriangleIcon
                  className={`h-6 w-6 ${statusColors[status]}`}
                />
              ) : (
                <div></div>
              )}
              <div>{`${formatDateTime(startAt)}`}</div>
              <div>{`${formatDateTime(endAt)}`}</div>
              <div>{formatDuration(duration)}</div>
            </Link>
          </>
        );
      })}
      {openPass ? (
        <Link
          to={openPass.id}
          title={openPass.reason || "N/A"}
          className={`mt-1 grid grid-cols-[30px_1fr_1fr_1fr] gap-x-2 gap-y-1 hover:bg-gray-200 ${
            openPass.id === passId ? "bg-amber-100" : ""
          }`}
        >
          {getDurationStatus(elapsedDuration) !== "good" ? (
            <ExclamationTriangleIcon
              className={`h-6 w-6 ${
                statusColors[getDurationStatus(elapsedDuration)]
              }`}
            />
          ) : (
            <div></div>
          )}
          <div>{`${formatDateTime(openPass.startAt)}`}</div>
          <div>N/A</div>
          <div>{formatDuration(elapsedDuration)}</div>
        </Link>
      ) : null}
    </div>
  );
};
