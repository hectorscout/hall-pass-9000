import { Link } from "@remix-run/react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { formatDateTime, getDurationStatus } from "~/utils/utils";
import { formatDuration } from "date-fns";
import { useUserSettings } from "~/hooks/useUserSettings";

interface HallPassLogRowProps {
  pass: {
    id: string;
    reason: string;
    startAt: string;
    endAt?: string | null;
  };
  duration: Duration;
  selectedPassId?: string;
}

const statusColors = {
  good: undefined,
  warning: "text-warning",
  critical: "text-critical",
};

export const HallPassLogRow: React.FC<HallPassLogRowProps> = ({
  pass,
  selectedPassId,
  duration,
}) => {
  const userSettings = useUserSettings();
  const status = getDurationStatus(duration, userSettings);

  return (
    <Link
      to={pass.id}
      title={pass.reason || "No notes for this walk."}
      className={`mt-1 grid grid-cols-[30px_1fr_1fr_1fr] gap-x-2 gap-y-1 rounded hover:bg-gray-200 ${
        pass.id === selectedPassId ? "bg-gray-200" : ""
      }`}
      key={pass.id}
    >
      {status !== "good" ? (
        <ExclamationTriangleIcon
          className={`h-6 w-6 ${statusColors[status]}`}
        />
      ) : (
        <div></div>
      )}
      <div>{formatDateTime(pass.startAt)}</div>
      <div>{pass.endAt ? formatDateTime(pass.endAt) : "-"}</div>
      <div>{formatDuration(duration)}</div>
    </Link>
  );
};
