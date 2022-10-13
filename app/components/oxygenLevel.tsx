import { useUserSettings } from "~/hooks/useUserSettings";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getDurationStatus } from "~/utils/utils";

const statusMessages = {
  good: "",
  warning: "Warning",
  critical: "Critical!!",
};

export const OxygenLevel = ({
  oxygenLevel,
  elapsedDuration,
}: {
  oxygenLevel: number;
  elapsedDuration: Duration;
}) => {
  const userSettings = useUserSettings();
  const status = getDurationStatus(elapsedDuration, userSettings);
  const warningSeconds = userSettings.warning * 60;
  const criticalSeconds = userSettings.critical * 60;
  const oxygenPercent = Math.max((oxygenLevel / criticalSeconds) * 100, 0);
  const warningPercent = Math.min(
    oxygenPercent,
    (1 - warningSeconds / criticalSeconds) * 100
  );

  return (
    <div className={`flex flex-col gap-5`}>
      <div className="flex justify-between text-3xl">
        <div className="py-1">Oxygen Level:</div>
        {status !== "good" ? (
          <div
            className={`animate-pulse bg-${status} flex items-center gap-2 rounded-full px-3 py-1`}
          >
            <ExclamationTriangleIcon className="h-8 w-8" />{" "}
            {statusMessages[status]}
          </div>
        ) : null}
      </div>
      <div
        className={`relative h-5 w-full rounded-full ${
          oxygenPercent === 0 ? "bg-critical" : "bg-gray-200"
        } ${oxygenPercent === warningPercent ? "animate-pulse" : ""}`}
      >
        <div
          className="h-5 rounded-full bg-green-600"
          style={{
            width: `${oxygenPercent}%`,
          }}
        ></div>
        <div
          className="absolute top-0 h-5 rounded-full bg-warning"
          style={{
            width: `${warningPercent}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
