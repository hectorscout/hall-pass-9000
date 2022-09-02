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
import { useTimeElapsed } from "~/hooks/useTimeElapsed";
import { add, formatDuration, intervalToDuration } from "date-fns";
import React from "react";
import { formatDateTime, formatDurationDigital } from "~/utils/utils";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.studentId, "params.studentId is required");

  const student = await getStudent({ userId, id: params.studentId });
  if (!student) {
    throw new Response("Not Found", { status: 404 });
  }

  const passes = await getHallPassesForStudent(params.studentId);
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
  const totalDuration = formatDuration(
    intervalToDuration({
      start: now,
      end: nowPlusTotalDuration,
    })
  );

  return json({ openPass, passes, student, totalDuration });
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

export default function StudentDetailsRoute() {
  const { openPass, passes, student, totalDuration } =
    useLoaderData<typeof loader>();
  const elapsedTimes = useTimeElapsed(
    passes.map((pass) => ({
      start: new Date(pass.startAt),
      end: pass.endAt ? new Date(pass.endAt) : undefined,
    }))
  );
  const { passId } = useParams();
  const lastElapsedTime = elapsedTimes[elapsedTimes.length - 1] ?? {
    status: "good",
    duration: {},
    formattedDuration: "",
  };

  return (
    <div className="relative flex flex-1 flex-col bg-blue-900">
      {openPass ? (
        <img
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1591449235870-2d8491bf51ff?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjE3NDQ1NzI&ixlib=rb-1.2.1&q=80"
        />
      ) : null}
      <div className="z-10 flex flex-1 flex-col">
        <div className="z-10 flex p-10">
          <h1 className="flex flex-1 items-center text-6xl font-extrabold">
            <div className="block uppercase text-red-500 drop-shadow-md">{`${student?.firstName} ${student?.lastName}`}</div>
            <div className="ml-5 text-3xl text-gray-400">
              ({student.period})
            </div>
          </h1>
          <div>
            <Link to="edit" className="justify-end">
              <button className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300">
                Edit
              </button>
            </Link>
          </div>
        </div>
        <Form method="post" className="flex flex-1 flex-col">
          <div className="flex justify-center">
            {openPass ? (
              <button
                type="submit"
                name="passId"
                value={openPass.id}
                className={`justify-center rounded py-12 px-14 font-mono text-4xl ${
                  buttonColors[lastElapsedTime.status]
                }`}
              >
                <div>{formatDurationDigital(lastElapsedTime.duration)}</div>
                <div className="text-2xl">
                  {statusMessages[lastElapsedTime.status]}
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
            <div>
              <h2 className="mb-5 flex justify-between align-middle">
                <div className="text-5xl">Space Walk Log:</div>
                {passes.length ? (
                  <div className="flex flex-col justify-center">
                    <span className="ml-10">{`${passes.length} walk${
                      passes.length > 1 ? "s" : ""
                    }`}</span>
                    <span className="ml-10">{totalDuration}</span>
                  </div>
                ) : null}
              </h2>
              <div className="mt-1 grid grid-cols-[30px_1fr_1fr_1fr] gap-x-2 gap-y-1">
                <div />
                <div className="text-2xl">Start</div>
                <div className="text-2xl">End</div>
                <div className="text-2xl">Duration</div>
                <hr className="col-span-4 mb-2" />
                {passes.map((pass, index) => {
                  const { formattedDuration, status } = elapsedTimes[index] ?? {
                    duration: undefined,
                    status: "good",
                  };
                  const statusColor =
                    status === "error"
                      ? "bg-red-600"
                      : status === "warning"
                      ? "bg-yellow-600"
                      : undefined;
                  return (
                    <React.Fragment key={pass.id}>
                      <Link
                        to={pass.id}
                        title={pass.reason || "N/A"}
                        className={pass.id === passId ? "bg-amber-100" : ""}
                      >
                        <div
                          className={`${statusColor} rounded-full text-center text-gray-200`}
                        >
                          {status !== "good" ? "!" : ""}
                        </div>
                      </Link>
                      <Link
                        to={pass.id}
                        title={pass.reason || "N/A"}
                        className={pass.id === passId ? "bg-amber-100" : ""}
                      >
                        <div>{`${formatDateTime(pass.startAt)}`}</div>
                      </Link>
                      <Link
                        to={pass.id}
                        title={pass.reason || "N/A"}
                        className={pass.id === passId ? "bg-amber-100" : ""}
                      >
                        <div>{`${formatDateTime(pass.endAt)}`}</div>
                      </Link>
                      <Link
                        to={pass.id}
                        title={pass.reason || "N/A"}
                        className={pass.id === passId ? "bg-amber-100" : ""}
                      >
                        <div>{formattedDuration}</div>
                      </Link>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </Form>
        <Outlet />
      </div>
    </div>
  );
}
