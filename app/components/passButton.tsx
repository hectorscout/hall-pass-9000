import { useUserSettings } from "~/hooks/useUserSettings";
import { formatDurationDigital, getDurationStatus } from "~/utils/utils";
import { Button } from "~/components/common/button";

const statusMessages = {
  good: "Click to bring them back to safety.",
  warning: "Warning: Oxygen levels low",
  critical: "Critical: Oxygen depleted!!",
};

interface PassButtonProps {
  openPassId?: String;
  elapsedDuration?: Duration;
}

export const PassButton = ({
  openPassId,
  elapsedDuration,
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
        <div className="font-mono text-5xl">
          {formatDurationDigital(elapsedDuration)}
        </div>
        <div className="font-mono text-2xl">
          {statusMessages[getDurationStatus(elapsedDuration, userSettings)]}
        </div>
      </Button>
    </div>
  ) : (
    <>
      <Button
        type="submit"
        name="passId"
        value="personal"
        size="big"
        kind="critical"
      >
        Recreational Space Walk
      </Button>
      <Button
        type="submit"
        name="passId"
        value="official"
        size="big"
        kind="critical"
      >
        Official Space Walk
      </Button>
    </>
  );
};

// Jettison Cadet Into The Cold Uncaring Void Of Space
