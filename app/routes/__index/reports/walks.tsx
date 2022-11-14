import SortableHeader from "../../../components/common/sortableHeader";
import { RocketIcon } from "../../../components/common/rocketIcon";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { Link, useLoaderData } from "@remix-run/react";
import { compareDurations, formatDurationDigital } from "~/utils/utils";
import { json, LoaderFunction } from "@remix-run/node";
import { intervalToDuration } from "date-fns";
import { requireUserId } from "~/utils/session.server";
import { getAllHallPasses } from "~/models/hall-pass.server";

interface Pass {
  student: {
    firstName: string;
    lastName: string;
  };
  duration: Duration;
}

// TODO: put in utils
const nameCmp = (a: Pass, b: Pass) => {
  return (
    a.student.firstName
      .toLowerCase()
      .localeCompare(b.student.firstName.toLowerCase()) ||
    a.student.lastName
      .toLowerCase()
      .localeCompare(b.student.lastName.toLowerCase())
  );
};

const durationCmp = (a: Pass, b: Pass, directionFactor: number) => {
  const diff = compareDurations(a.duration, b.duration) * directionFactor;
  return diff || nameCmp(a, b);
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const sortKey = url.searchParams.get("sort-key") ?? "cadet";
  const directionFactor = url.searchParams.get("desc") ? -1 : 1;

  const passesRaw = await getAllHallPasses(userId);

  const passes = passesRaw.map(({ student, startAt, endAt }) => {
    return {
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        period: student.period,
      },
      duration: intervalToDuration({
        start: startAt,
        end: endAt ?? new Date(),
      }),
    };
  });

  console.log(sortKey, directionFactor);
  if (sortKey === "cadet") {
    passes.sort((a, b) => nameCmp(a, b) * directionFactor);
  } else if (sortKey === "period") {
    passes.sort((a, b) => {
      return (
        a.student.period.localeCompare(b.student.period) * directionFactor ||
        nameCmp(a, b)
      );
    });
  } else if (sortKey === "duration") {
    passes.sort((a, b) => durationCmp(a, b, directionFactor));
  }
  return json({
    passes,
  });
};

export default function WalksRoute() {
  const { passes } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="mb-3 grid grid-cols-[1fr_1fr_1fr] gap-x-2 border-b text-2xl">
        <SortableHeader title="Cadet" sortKey="cadet" />
        <SortableHeader title="Period" sortKey="period" />
        <SortableHeader sortKey="duration">Duration</SortableHeader>
      </div>
      {passes.map((pass: any) => {
        return (
          <Link
            to={`/${pass.student.id}`}
            key={pass.id}
            className="grid grid-cols-[1fr_1fr_1fr] gap-y-1 gap-x-2 odd:bg-gray-100  hover:bg-gray-200"
          >
            <div>{`${pass.student.firstName} ${pass.student.lastName}`}</div>
            <div>{pass.student.period}</div>
            {formatDurationDigital(pass.duration)}
          </Link>
        );
      })}
    </>
  );
}
