import type {
  ActionFunction,
  LoaderArgs,
  LoaderFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import invariant from "tiny-invariant";
import {
  deleteHallPass,
  getHallPass,
  updateHallPass,
} from "~/models/hall-pass.server";
import { Form, useLoaderData } from "@remix-run/react";
import { formatDate, formatTime } from "~/utils/utils";
import { useEffect, useState } from "react";
import { add, formatDistanceToNow, intervalToDuration } from "date-fns";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Button } from "~/components/common/button";

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

  const intent = formData.get("intent");
  if (intent === "close") {
    return redirect(`/${params.studentId}`);
  }

  if (intent === "delete") {
    await deleteHallPass({ id: params.passId, userId });
    return redirect(`/${params.studentId}`);
  }

  const reason = formData.get("reason") ?? "";
  const endAt = formData.get("endAt") ?? "";

  invariant(typeof reason === "string", "reason must be a string");
  invariant(typeof endAt === "string", "endAt must be a string");

  await updateHallPass({
    id: params.passId,
    endAt: endAt ? new Date(endAt) : undefined,
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
  }, [duration, pass.startAt]);

  return (
    <div className="absolute right-0 top-0 z-10 h-full w-1/3 bg-gray-500 px-10 text-gray-300">
      <Form method="post">
        <div className="absolute right-0 m-5">
          <Button kind="ghost" type="submit" name="intent" value="close">
            <XMarkIcon className="h-10 w-10" />
          </Button>
        </div>
      </Form>
      <div className="my-10">
        <h2 className="text-5xl">
          {formatDate(pass.startAt)}{" "}
          <span className="text-2xl">
            ({formatDistanceToNow(new Date(pass.startAt))} ago)
          </span>
        </h2>
        <div className="text-3xl">
          {`${formatTime(pass.startAt)} - ${formatTime(
            pass.endAt ? endAt : null
          )}`}
          {pass.endAt && duration.days ? ` +${duration.days}` : null}
        </div>
        {pass.endAt ? (
          <>
            <h3 className="mt-10 text-3xl">Duration: </h3>
            <div className="text-6xl text-gray-900">
              {duration.days ? (
                <>
                  <label className="font-mono text-gray-900">
                    {(duration.days ?? 0) < 10 ? "0" : null}
                    <input
                      className={`relative appearance-none border-none bg-gray-500 p-1 outline-none ${
                        (duration.days ?? 0) < 10 ? "w-14" : "w-24"
                      }`}
                      type="number"
                      min="0"
                      value={duration.days}
                      onChange={({ target: { value } }) =>
                        updateDuration({ days: parseInt(value) })
                      }
                    />
                  </label>{" "}
                  :
                </>
              ) : null}
              <label className="font-mono text-gray-900">
                {(duration.hours ?? 0) < 10 ? "0" : null}
                <input
                  className={`relative appearance-none border-none bg-gray-500 p-1 outline-none ${
                    (duration.hours ?? 0) < 10 ? "w-14" : "w-24"
                  }`}
                  type="number"
                  max="23"
                  min={duration.days === 0 ? "0" : undefined}
                  value={duration.hours}
                  onChange={({ target: { value } }) =>
                    updateDuration({ hours: parseInt(value) })
                  }
                />
              </label>
              :
              <label className="font-mono text-gray-900">
                {(duration.minutes ?? 0) < 10 ? "0" : null}
                <input
                  className={`relative appearance-none border-none bg-gray-500 p-1 outline-none ${
                    (duration.minutes ?? 0) < 10 ? "w-14" : "w-24"
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
              <label className="font-mono text-gray-900">
                {(duration.seconds ?? 0) < 10 ? "0" : null}
                <input
                  className={`relative appearance-none border-none bg-gray-500 p-1 outline-none ${
                    (duration.seconds ?? 0) < 10 ? "w-14" : "w-24"
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
          </>
        ) : (
          <div className="py-2">
            You'll need to return the student before you can modify this space
            walk duration. You can still add notes though.
          </div>
        )}
        <div>
          <Form method="post" key={pass.id}>
            {pass.endAt ? (
              <input type="hidden" name="endAt" value={endAtStr} />
            ) : null}
            <label className="text-2xl">
              <h3 className="my-3 text-3xl"> Space Walk Notes: </h3>
              <textarea
                id="reason"
                rows={5}
                name="reason"
                className={`w-full rounded p-2 font-mono text-gray-800`}
                placeholder="Out fixing the photon torpedo bays."
                defaultValue={pass.reason ?? ""}
              />
            </label>
            <br />
            <Button>Update Space Walk</Button>
            <div className="absolute right-0 bottom-0 m-5">
              <Button name="intent" value="delete" kind="critical">
                Delete
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
