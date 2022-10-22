import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { getStudentsAndPasses } from "~/models/hall-pass.server";
import { formatDurationDigital, getPassStats, PassStats } from "~/utils/utils";
import { useLoaderData } from "@remix-run/react";
import { RocketIcon } from "~/components/common/rocketIcon";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

interface StudentStat {
  firstName: string;
  lastName: string;
  period: string;
  passStats: PassStats;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);

  const studentsRaw = await getStudentsAndPasses({ userId });

  const students = studentsRaw.map(
    ({ firstName, lastName, period, passes }) => {
      return {
        firstName,
        lastName,
        period,
        passStats: getPassStats(JSON.parse(JSON.stringify(passes))),
      };
    }
  );

  return json({ students });
};

export default function CadetsRoute() {
  const { students }: { students: StudentStat[] } =
    useLoaderData<typeof loader>();

  return (
    <>
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-x-2 border-b text-2xl">
        <div>Cadet</div>
        <div>Period</div>
        <div className="flex gap-3" title="Recreational">
          <RocketIcon className="h-8 w-8" /> Count
        </div>
        <div>Duration</div>
        <div className="flex gap-3" title="Official Business">
          <CheckBadgeIcon className="h-8 w-8" /> Count
        </div>
        <div>Duration</div>
        <div>Total Count</div>
        <div>Duration</div>
      </div>
      {students.map((student) => {
        return (
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-y-1 gap-x-2">
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
