import SortableHeader from "../../../components/common/sortableHeader";
import { RocketIcon } from "../../../components/common/rocketIcon";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";
import { Link, useLoaderData } from "@remix-run/react";
import { formatDurationDigital } from "~/utils/utils";
import { json, LoaderFunction } from "@remix-run/node";
import { intervalToDuration } from "date-fns";

export const loader: LoaderFunction = () => {
  return json({
    passes: [
      {
        student: {
          id: "taco",
          firstName: "bobby",
          lastName: "tables",
          period: "A1",
        },
        duration: intervalToDuration({ start: new Date(), end: new Date() }),
      },
    ],
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
            key={pass.student.id}
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
