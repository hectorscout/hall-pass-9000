import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { getStudentsAndPasses } from "~/models/hall-pass.server";
import {
  compareDurations,
  formatDurationDigital,
  getPassStats,
  PassStats,
} from "~/utils/utils";
import { useLoaderData } from "@remix-run/react";
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

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const sortKey = url.searchParams.get("sort-key") ?? "";
  const direction = url.searchParams.get("desc") ? "desc" : "asc";

  let orderBy = undefined;
  if (["firstName", "period"].includes(sortKey)) {
    orderBy = { [sortKey]: direction };
  }

  const studentsRaw = await getStudentsAndPasses({ userId, orderBy });

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

  const directionFactor = direction === "asc" ? 1 : -1;
  if (sortKey === "recCount") {
    students.sort(
      (a, b) =>
        a.passStats.counts.personal -
        b.passStats.counts.personal * directionFactor
    );
  } else if (sortKey === "officialCount") {
    students.sort(
      (a, b) =>
        a.passStats.counts.official -
        b.passStats.counts.official * directionFactor
    );
  } else if (sortKey === "totalCount") {
    students.sort(
      (a, b) =>
        a.passStats.counts.total - b.passStats.counts.total * directionFactor
    );
  } else if (sortKey === "recDuration") {
    students.sort((a, b) => {
      return direction === "asc"
        ? compareDurations(
            a.passStats.durations.personal,
            b.passStats.durations.personal
          )
        : compareDurations(
            b.passStats.durations.personal,
            a.passStats.durations.personal
          );
    });
  } else if (sortKey === "officialDuration") {
    students.sort((a, b) => {
      return direction === "asc"
        ? compareDurations(
            a.passStats.durations.official,
            b.passStats.durations.official
          )
        : compareDurations(
            b.passStats.durations.official,
            a.passStats.durations.official
          );
    });
  } else if (sortKey === "totalDuration") {
    students.sort((a, b) => {
      return direction === "asc"
        ? compareDurations(
            a.passStats.durations.total,
            b.passStats.durations.total
          )
        : compareDurations(
            b.passStats.durations.total,
            a.passStats.durations.total
          );
    });
  }

  if (["recCount", "officialCount", "totalCount"].includes(sortKey)) {
  }

  return json({ students });
};

export default function CadetsRoute() {
  const { students }: { students: StudentStat[] } =
    useLoaderData<typeof loader>();

  return (
    <>
      <div className="mb-3 grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-x-2 border-b text-2xl">
        <SortableHeader title="Cadet" sortKey="firstName" />
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
          <div
            key={student.id}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-y-1 gap-x-2"
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
          </div>
        );
      })}
    </>
  );
}
