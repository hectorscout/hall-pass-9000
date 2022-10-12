import { Link, useParams } from "@remix-run/react";
import {
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import {
  formatDateTime,
  formatDurationDigital,
  formatTime,
  getDurationStatus,
} from "~/utils/utils";
import type { DurationStatus } from "~/utils/utils";
import { useUserSettings } from "~/hooks/useUserSettings";

interface HallPassLogRowProps {
  pass: {
    id: string;
    reason: string;
    isPersonal: Boolean;
    startAt: string;
    endAt?: string | null;
  };
  duration: Duration;
}

const statusColors = {
  good: undefined,
  warning: "text-warning",
  critical: "text-critical",
};

const getStatusIcon = (isPersonal: Boolean, status: DurationStatus) => {
  if (!isPersonal) {
    return (
      <div title="Official Business">
        <CheckBadgeIcon className="h-6 w-6 text-gray-500" />
      </div>
    );
  }

  if (status === "good") {
    return <div></div>;
  }

  return (
    <ExclamationTriangleIcon className={`h-6 w-6 ${statusColors[status]}`} />
  );
};

export const HallPassLogRow: React.FC<HallPassLogRowProps> = ({
  pass,
  duration,
}) => {
  const userSettings = useUserSettings();
  const status = getDurationStatus(duration, userSettings);
  const { passId } = useParams();

  return (
    <Link
      to={pass.id}
      title={pass.reason || "No notes for this walk."}
      className={`mt-1 grid grid-cols-[2fr_1fr_1fr] gap-x-2 gap-y-1 rounded hover:bg-gray-600 ${
        passId === pass.id ? "bg-gray-600" : ""
      }`}
      key={pass.id}
    >
      <div>{formatDateTime(pass.startAt)}</div>
      <div>{pass.endAt ? formatTime(pass.endAt) : "-"}</div>
      <div className="mr-2 flex justify-between">
        <div>{formatDurationDigital(duration)}</div>
        {getStatusIcon(pass.isPersonal, status)}
      </div>
    </Link>
  );
};
