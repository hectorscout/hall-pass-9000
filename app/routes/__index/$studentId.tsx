import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import {
  createHallPass,
  endHallPass,
  getHallPassesForStudent,
  getStudent,
} from "~/models/hall-pass.server";
import invariant from "tiny-invariant";
import { Form, Link, Outlet, useLoaderData, useParams } from "@remix-run/react";
import { add, formatDuration, intervalToDuration } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  formatDateTime,
  formatDurationDigital,
  getDurationStatus,
} from "~/utils/utils";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { PencilIcon } from "@heroicons/react/24/solid";
import { HallPassLog } from "~/components/hallPassLog";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.studentId, "params.studentId is required");

  const student = await getStudent({ userId, id: params.studentId });
  if (!student) {
    throw new Response("Not Found", { status: 404 });
  }

  const passes = await getHallPassesForStudent(params.studentId);
  const closedPasses = passes
    .filter((pass) => pass.endAt)
    .map((pass) => {
      const duration = intervalToDuration({
        start: new Date(pass.startAt),
        end: new Date(pass.endAt || ""),
      });
      return {
        ...pass,
        duration,
        status: getDurationStatus(duration),
      };
    });
  const openPass = passes.find((pass) => !pass.endAt);

  const now = new Date();
  const nowPlusTotalDuration = passes.reduce((total, pass) => {
    return add(
      total,
      intervalToDuration({
        start: new Date(pass.startAt),
        end: pass.endAt ? new Date(pass.endAt) : now,
      })
    );
  }, now);
  const totalDuration = intervalToDuration({
    start: now,
    end: nowPlusTotalDuration,
  });
  return json({ openPass, closedPasses, student, totalDuration });
};

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  invariant(params.studentId, "params.studentId is required");
  const formData = await request.formData();
  const reason = formData.get("reason") ?? "";
  const passId = formData.get("passId");
  invariant(typeof reason === "string", "reason must be a string");
  invariant(typeof passId === "string", "passId must be a string");

  if (passId === "newPass") {
    await createHallPass({ studentId: params.studentId, userId, reason });
  } else {
    await endHallPass({ id: passId });
  }
  return null;
};

// const inputClassName =
//   "w-full rounded border border-gray-500 px-2 py-1 text-lg";

const buttonColors = {
  good: "bg-green-500 text-white hover:bg-green-600 focus:bg-green-400 disabled:bg-green-300",
  warning:
    "bg-yellow-500 text-gray-800 animate-pulse hover:bg-yellow-600 focus:bg-yellow-400 disabled:bg-yellow-300",
  error:
    "bg-red-700 text-white animate-pulse hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300",
};

const statusMessages = {
  good: "Click to bring them home",
  warning: "Warning: Oxygen levels low",
  error: "Critical: Oxygen depleted!!",
};

// const homeUrl =
//   "https://images.unsplash.com/photo-1518228684816-9135c15ab4ea?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjIwOTM5ODA&ixlib=rb-1.2.1&q=80";
const homeUrl =
  "https://images.unsplash.com/photo-1601892782633-675465fa7f3a?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjIwOTQxMDI&ixlib=rb-1.2.1&q=80";
// const homeUrl =
//   "https://images.unsplash.com/photo-1520442027413-7bf6c51517da?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjIwOTQzNDU&ixlib=rb-1.2.1&q=80";

export default function StudentDetailsRoute() {
  const { openPass, closedPasses, student, totalDuration } =
    useLoaderData<typeof loader>();
  const [elapsedDuration, setElapsedDuration] = useState(
    intervalToDuration({
      start: openPass ? new Date(openPass.startAt) : new Date(),
      end: new Date(),
    })
  );

  useEffect(() => {
    const tick = () => {
      setElapsedDuration(
        intervalToDuration({
          start: openPass ? new Date(openPass.startAt) : new Date(),
          end: new Date(),
        })
      );
    };
    tick();
    const interval = openPass ? setInterval(tick, 1000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [openPass]);

  return (
    <div className="relative flex flex-1 flex-col bg-blue-900">
      {openPass ? (
        <img
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1591449235870-2d8491bf51ff?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjE3NDQ1NzI&ixlib=rb-1.2.1&q=80"
        />
      ) : (
        <img
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={homeUrl}
        />
      )}
      <div className="z-10 flex flex-1 flex-col">
        <div className="z-10 flex p-10">
          <h1 className="flex flex-1 items-center text-6xl font-extrabold">
            <div className="block uppercase text-red-500 drop-shadow-md">{`${student?.firstName} ${student?.lastName}`}</div>
            <div className="ml-5 text-3xl text-gray-400">
              ({student.period})
            </div>
          </h1>
          <Link to="edit" className="justify-end" title="Edit Student">
            <button className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300">
              <PencilIcon className="h-6 w-6" />
            </button>
          </Link>
        </div>
        <Form method="post" className="flex flex-1 flex-col">
          <div className="flex justify-center">
            {openPass ? (
              <button
                type="submit"
                name="passId"
                value={openPass.id}
                className={`justify-center rounded py-12 px-14 font-mono text-4xl ${
                  buttonColors[getDurationStatus(elapsedDuration)]
                }`}
              >
                <div>{formatDurationDigital(elapsedDuration)}</div>
                <div className="text-2xl">
                  {statusMessages[getDurationStatus(elapsedDuration)]}
                </div>
              </button>
            ) : (
              <button
                type="submit"
                name="passId"
                value="newPass"
                className="justify-center rounded bg-red-500 py-12 px-14 text-3xl text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
              >
                Jettison Student Into The Cold Uncaring Void Of Space
              </button>
            )}
          </div>
          <div className="mt-10 flex-1 bg-blue-300/60 p-10">
            <HallPassLog
              passes={closedPasses}
              totalDuration={totalDuration}
              openPass={openPass}
              elapsedDuration={elapsedDuration}
            />
          </div>
        </Form>
        <Outlet />
      </div>
    </div>
  );
}
