import { Link } from "@remix-run/react";
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
    return <CheckBadgeIcon className="h-6 w-6 text-gray-700" />;
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

  return (
    <Link
      to={pass.id}
      title={pass.reason || "No notes for this walk."}
      className="mt-1 grid grid-cols-[30px_2fr_1fr_1fr] gap-x-2 gap-y-1 rounded hover:bg-gray-600"
      key={pass.id}
    >
      {getStatusIcon(pass.isPersonal, status)}
      <div>{formatDateTime(pass.startAt)}</div>
      <div>{pass.endAt ? formatTime(pass.endAt) : "-"}</div>
      <div>{formatDurationDigital(duration)}</div>
    </Link>
  );
};
