import { useUserSettings } from "~/hooks/useUserSettings";
import { formatDurationDigital, getDurationStatus } from "~/utils/utils";
import { Button } from "~/components/common/button";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

const statusMessages = {
  good: "Click to bring them back to safety.",
  warning: "Warning: Oxygen levels low",
  critical: "Critical: Oxygen depleted!!",
};

interface PassButtonProps {
  openPassId?: String;
  elapsedDuration?: Duration;
  isPersonal?: boolean;
}

// For some reason RocketLaunchIcon isn't showing up....
const rocketIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-12 w-12"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
    />
  </svg>
);

export const PassButton = ({
  openPassId,
  elapsedDuration,
  isPersonal,
}: PassButtonProps) => {
  const userSettings = useUserSettings();

  return openPassId && elapsedDuration ? (
    <div
      className={
        getDurationStatus(elapsedDuration, userSettings) !== "good"
          ? "animate-pulse"
          : ""
      }
    >
      <Button
        type="submit"
        name="passId"
        value={openPassId}
        size="big"
        kind={getDurationStatus(elapsedDuration, userSettings)}
      >
        <div className="it mb-3 flex items-center justify-center gap-5 font-mono text-5xl">
          {isPersonal ? (
            rocketIcon
          ) : (
            <CheckBadgeIcon className="h-13 w-13 inline-block" />
          )}
          <div>{formatDurationDigital(elapsedDuration)}</div>
          {isPersonal ? (
            rocketIcon
          ) : (
            <CheckBadgeIcon className="h-13 w-13 inline-block" />
          )}
        </div>
        <div className="font-mono text-2xl">
          {statusMessages[getDurationStatus(elapsedDuration, userSettings)]}
        </div>
      </Button>
    </div>
  ) : (
    <div className="flex gap-5">
      <Button type="submit" name="passId" value="personal" size="big">
        <div className="flex items-center justify-center gap-5">
          {rocketIcon}
          Recreational Space Walk
          {rocketIcon}
        </div>
      </Button>
      <Button
        type="submit"
        name="passId"
        value="official"
        size="big"
        kind="info"
        title={`"Official" space walks don't count in overall counts and durations`}
      >
        <div className="flex items-center justify-center gap-5">
          <CheckBadgeIcon className="inline-block h-12 w-12" />
          Official Business
          <CheckBadgeIcon className="inline-block h-12 w-12" />
        </div>
      </Button>
    </div>
  );
};

// Jettison Cadet Into The Cold Uncaring Void Of Space
