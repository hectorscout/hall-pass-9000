import { formatDurationDigital } from "~/utils/utils";
import { Button } from "~/components/common/button";
import { RocketIcon } from "~/components/common/rocketIcon";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { OxygenLevel } from "~/components/oxygenLevel";

interface OpenPassDashboardProps {
  openPassId: String;
  elapsedDuration: Duration;
  oxygenLevel: number;
  isPersonal: boolean;
}

export const OpenPassDashboard = ({
  openPassId,
  elapsedDuration,
  oxygenLevel,
  isPersonal,
}: OpenPassDashboardProps) => {
  return (
    <div
      className={`flex w-1/2 flex-col gap-10 rounded-2xl bg-gray-800/80 p-5 text-gray-300`}
    >
      <div className="flex justify-between">
        <h1 className="text-5xl">Current Space Walk</h1>
        {isPersonal ? <RocketIcon /> : <CheckBadgeIcon className="h-12 w-12" />}
      </div>
      <div className="flex items-center justify-center font-mono text-9xl">
        {formatDurationDigital(elapsedDuration)}
      </div>
      <OxygenLevel
        oxygenLevel={oxygenLevel}
        elapsedDuration={elapsedDuration}
      />
      <Button type="submit" name="passId" value={openPassId} size="big">
        <div>Return Cadet</div>
      </Button>
    </div>
  );
};
