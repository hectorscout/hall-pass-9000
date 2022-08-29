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
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useTimeElapsed } from "~/hooks/useTimeElapsed";
import { add, format, formatDuration, intervalToDuration } from "date-fns";
import React from "react";

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

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function StudentDetailsRoute() {
  const { openPass, passes, student, totalDuration } =
    useLoaderData<typeof loader>();
  const elapsedTimes = useTimeElapsed(
    passes.map((pass) => ({
      start: new Date(pass.startAt),
      end: pass.endAt ? new Date(pass.endAt) : undefined,
    }))
  );

  const formatDateTime = (dateTimeStr: string | null) => {
    if (!dateTimeStr) return "N/A";
    return format(new Date(dateTimeStr), "d-MMM-yy h:mm aaa");
  };

  return (
    <div className="flex flex-1 flex-col px-10">
      <div className="flex py-10">
        <h1 className="flex-1 text-center text-6xl font-extrabold">
          <span className="block uppercase text-red-500 drop-shadow-md">{`${student?.firstName} ${student?.lastName}`}</span>
          <span>({student.period})</span>
        </h1>
        <div>
          <Link to="edit" className="justify-end">
            <button className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300">
              Edit
            </button>
          </Link>
        </div>
      </div>
      <Form method="post">
        <div className="flex flex-1 justify-center">
          {openPass ? (
            <button
              type="submit"
              name="passId"
              value={openPass.id}
              className="justify-center rounded bg-red-500 py-12 px-14 text-3xl text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
            >
              Return Student From The Cold Uncaring Void Of Space
            </button>
          ) : (
            <button
              type="submit"
              name="passId"
              value="newPass"
              className="justify-center rounded bg-green-500 py-12 px-14 text-3xl text-white hover:bg-green-600 focus:bg-green-400 disabled:bg-green-300"
            >
              Jettison Student Into The Cold Uncaring Void Of Space
            </button>
          )}
        </div>
        {/*/!*<label htmlFor="reason">Reason:</label>*!/*/}
        {/*/!*<br />*!/*/}
        {/*/!*<div className="flex gap-2">*!/*/}
        {/*/!*  <textarea*!/*/}
        {/*// id="reason" // rows={1}*/}
        {/*// name="reason" // className={`${inputClassName} font-mono`}*/}
        {/*/!*  />*!/*/}
        {/*/!*</div>*!/*/}
        <div className="mt-10">
          <h2 className="mb-5">
            <span className="text-5xl">Space Walk Log:</span>
            {passes.length ? (
              <>
                <span className="ml-10">{`${passes.length} walk${
                  passes.length > 1 ? "s" : ""
                }`}</span>
                <span className="ml-10">{totalDuration}</span>
              </>
            ) : null}
          </h2>
          <div className="mt-1 grid grid-cols-3">
            <div className="text-2xl">Start</div>
            <div className="text-2xl">End</div>
            <div className="text-2xl">Duration</div>
            <hr className="col-span-3 mb-2" />
            {passes.map((pass, index) => {
              const { formattedDuration, status } = elapsedTimes[index] ?? {
                duration: undefined,
                status: "good",
              };
              const textColor =
                status === "error"
                  ? "text-red-600"
                  : status === "warning"
                  ? "text-yellow-500"
                  : undefined;
              return (
                <React.Fragment key={pass.id}>
                  <div className={textColor}>{`${formatDateTime(
                    pass.startAt
                  )}`}</div>
                  <div className={textColor}>{`${formatDateTime(
                    pass.endAt
                  )}`}</div>
                  <div className={textColor}>{formattedDuration}</div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Form>
    </div>
  );
}
