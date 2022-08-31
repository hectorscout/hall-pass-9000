import type {
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import invariant from "tiny-invariant";
import { getHallPass, updateHallPass } from "~/models/hall-pass.server";
import { Form, useLoaderData } from "@remix-run/react";
import { formatDateTime } from "~/utils/utils";
import { useEffect, useState } from "react";
import { add, intervalToDuration } from "date-fns";

export const loader: LoaderFunction = async ({
  params,
  request,
}: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.passId, "params.passId is required");

  const pass = await getHallPass({ id: params.passId, userId });

  return json({ pass });
};

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  invariant(params.passId, "params.passId is required");
  invariant(params.studentId, "params.studentId is required");
  const formData = await request.formData();

  const reason = formData.get("reason") ?? "";
  const endAt = formData.get("endAt");

  invariant(typeof endAt === "string", "endAt must be a string");
  invariant(typeof reason === "string", "reason must be a string");

  const pass = await updateHallPass({
    id: params.passId,
    endAt: new Date(endAt),
    reason,
  });

  return redirect(`/${params.studentId}`);
};

export default function PassDetailsRoute() {
  const { pass } = useLoaderData<typeof loader>();

  const [endAt, setEndAt] = useState(pass.endAt ? new Date(pass.endAt) : "");
  const [endAtStr, setEndAtStr] = useState(pass.endAt ?? "");
  const [duration, setDuration] = useState(
    intervalToDuration({
      start: new Date(pass.startAt),
      end: new Date(pass.endAt),
    })
  );

  const updateDuration = (change: Partial<Duration>) => {
    setDuration(
      intervalToDuration({
        start: new Date(pass.startAt),
        end: add(new Date(pass.startAt), { ...duration, ...change }),
      })
    );
  };

  useEffect(() => {
    setDuration(
      intervalToDuration({
        start: new Date(pass.startAt),
        end: new Date(pass.endAt),
      })
    );
  }, [pass]);

  useEffect(() => {
    const newEndAt = add(new Date(pass.startAt), duration);
    setEndAt(newEndAt);
    setEndAtStr(newEndAt.toISOString());
  }, [duration]);

  return (
    <div className="absolute right-0 h-full w-1/3 bg-gray-500 p-10 text-gray-300">
      <div>Start: {formatDateTime(pass.startAt)}</div>
      <div>End: {formatDateTime(endAt)}</div>
      <div className="text-4xl text-gray-900">
        {duration.hours ? (
          <>
            <label className="font-mono text-4xl text-gray-900">
              {(duration.hours ?? 0) < 10 ? "0" : null}
              <input
                className={`relative appearance-none border-none bg-gray-500 p-1 outline-none ${
                  (duration.hours ?? 0) < 10 ? "w-14" : "w-20"
                }`}
                type="number"
                min={duration.days === 0 ? "0" : undefined}
                value={duration.hours}
                onChange={({ target: { value } }) =>
                  updateDuration({ hours: parseInt(value) })
                }
              />
            </label>{" "}
            :
          </>
        ) : null}
        <label className="font-mono text-4xl text-gray-900">
          {(duration.minutes ?? 0) < 10 ? "0" : null}
          <input
            className={`relative appearance-none border-none bg-gray-500 p-1 outline-none ${
              (duration.minutes ?? 0) < 10 ? "w-14" : "w-20"
            }`}
            type="number"
            min={duration.hours === 0 ? "0" : undefined}
            value={duration.minutes}
            onChange={({ target: { value } }) =>
              updateDuration({ minutes: parseInt(value) })
            }
          />
        </label>
        :
        <label className="font-mono text-4xl text-gray-900">
          {(duration.seconds ?? 0) < 10 ? "0" : null}
          <input
            className={`relative appearance-none border-none bg-gray-500 p-1 outline-none ${
              (duration.seconds ?? 0) < 10 ? "w-14" : "w-20"
            }`}
            type="number"
            min={duration.minutes === 0 ? "0" : undefined}
            value={duration.seconds}
            onChange={({ target: { value } }) =>
              updateDuration({ seconds: parseInt(value) })
            }
          />
        </label>
      </div>
      <div>
        <Form method="post" key={pass.id}>
          <input type="hidden" name="endAt" value={endAtStr} />
          <label>
            Space Walk Notes: <br />
            <textarea
              id="reason"
              rows={5}
              name="reason"
              className={`w-full font-mono text-gray-800`}
              defaultValue={pass.reason ?? ""}
            />
          </label>
          <br />
          <button className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300">
            Update Space Walk
          </button>
        </Form>
      </div>
    </div>
  );
}
