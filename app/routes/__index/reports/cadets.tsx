import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { getStudentsAndPasses } from "~/models/hall-pass.server";
import {
  compareDurations,
  formatDurationDigital,
  getPassStats,
} from "~/utils/utils";
import type { PassStats } from "~/utils/utils";
import { Link, useLoaderData, useTransition } from "@remix-run/react";
import { RocketIcon } from "~/components/common/rocketIcon";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import SortableHeader from "~/components/common/sortableHeader";

interface StudentStat {
  id: string;
  firstName: string;
  lastName: string;
  period: string;
  passStats: PassStats;
}

const nameCmp = (a: StudentStat, b: StudentStat) => {
  return (
    a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) ||
    a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase())
  );
};

const countCmp = (
  a: StudentStat,
  b: StudentStat,
  key: "personal" | "official" | "total",
  directionFactor: number
) => {
  const diff =
    (a.passStats.counts[key] - b.passStats.counts[key]) * directionFactor;
  return diff || nameCmp(a, b);
};

const durationCmp = (
  a: StudentStat,
  b: StudentStat,
  key: "personal" | "official" | "total",
  directionFactor: number
) => {
  const diff =
    compareDurations(a.passStats.durations[key], b.passStats.durations[key]) *
    directionFactor;
  return diff || nameCmp(a, b);
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const sortKey = url.searchParams.get("sort-key") ?? "cadet";
  const directionFactor = url.searchParams.get("desc") ? -1 : 1;

  const studentsRaw = await getStudentsAndPasses({ userId });

  const students = studentsRaw.map(
    ({ firstName, id, lastName, period, passes }) => {
      return {
        id,
        firstName,
        lastName,
        period,
        passStats: getPassStats(JSON.parse(JSON.stringify(passes))),
      };
    }
  );

  if (sortKey === "cadet") {
    students.sort((a, b) => nameCmp(a, b) * directionFactor);
  } else if (sortKey === "period") {
    students.sort((a, b) => {
      return (
        a.period.localeCompare(b.period) * directionFactor || nameCmp(a, b)
      );
    });
  } else if (sortKey === "recCount") {
    students.sort((a, b) => countCmp(a, b, "personal", directionFactor));
  } else if (sortKey === "officialCount") {
    students.sort((a, b) => countCmp(a, b, "official", directionFactor));
  } else if (sortKey === "totalCount") {
    students.sort((a, b) => countCmp(a, b, "total", directionFactor));
  } else if (sortKey === "recDuration") {
    students.sort((a, b) => durationCmp(a, b, "personal", directionFactor));
  } else if (sortKey === "officialDuration") {
    students.sort((a, b) => durationCmp(a, b, "official", directionFactor));
  } else if (sortKey === "totalDuration") {
    students.sort((a, b) => durationCmp(a, b, "total", directionFactor));
  }

  return json({ students });
};

export default function CadetsRoute() {
  const { students }: { students: StudentStat[] } =
    useLoaderData<typeof loader>();

  const transition = useTransition();

  return transition.state === "loading" ? (
    <div>Loading...</div>
  ) : (
    <>
      <div className="mb-3 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-x-2 border-b text-2xl">
        <SortableHeader title="Cadet" sortKey="cadet" />
        <SortableHeader title="Period" sortKey="period" />
        <SortableHeader sortKey="recCount">
          <div className="flex gap-3" title="Recreational">
            <RocketIcon className="h-8 w-8" /> Count
          </div>
        </SortableHeader>
        <SortableHeader sortKey="recDuration">Duration</SortableHeader>
        <SortableHeader sortKey="officialCount">
          <div className="flex gap-3" title="Official Business">
            <CheckBadgeIcon className="h-8 w-8" /> Count
          </div>
        </SortableHeader>
        <SortableHeader sortKey="officialDuration">Duration</SortableHeader>
        <SortableHeader sortKey="totalCount">Total Count</SortableHeader>
        <SortableHeader sortKey="totalDuration">Duration</SortableHeader>
      </div>
      {students.map((student) => {
        return (
          <Link
            to={`/${student.id}`}
            key={student.id}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-y-1 gap-x-2 hover:bg-gray-200"
          >
            <div>{`${student.firstName} ${student.lastName}`}</div>
            <div>{student.period}</div>
            <div>{student.passStats.counts.personal}</div>
            <div>
              {formatDurationDigital(student.passStats.durations.personal)}
            </div>
            <div>{student.passStats.counts.official}</div>
            <div>
              {formatDurationDigital(student.passStats.durations.official)}
            </div>
            <div>{student.passStats.counts.total}</div>
            <div>
              {formatDurationDigital(student.passStats.durations.total)}
            </div>
          </Link>
        );
      })}
    </>
  );
}
