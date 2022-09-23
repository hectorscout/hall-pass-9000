import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { endHallPass, getOpenHallPasses } from "~/models/hall-pass.server";
import { requireUserId } from "~/utils/session.server";
import { Form, useLoaderData } from "@remix-run/react";
import { useTimeElapsed } from "~/hooks/useTimeElapsed";
import invariant from "tiny-invariant";
import { formatDurationDigital, getDurationStatus } from "~/utils/utils";
import { useState } from "react";
import { useUserSettings } from "~/hooks/useUserSettings";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const openPasses = await getOpenHallPasses(userId);

  return json({ openPasses });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const passId = formData.get("passId");
  invariant(typeof passId === "string", "passId must be a string");

  await endHallPass({ id: passId });

  return null;
};

export default function HallMonitorIndexPage() {
  const userSettings = useUserSettings();
  const { openPasses } = useLoaderData<typeof loader>();
  const [intervals, setIntervals] = useState(
    openPasses.map((openPass) => ({ start: new Date(openPass.startAt) }))
  );
  const elapsedTimes = useTimeElapsed(intervals);

  // TODO: figure out dependencies. Currently has bugs if there's more than one pass
  // useEffect(() => {
  //   setIntervals(
  //     openPasses.map((openPass) => ({ start: new Date(openPass.startAt) }))
  //   );
  // }, openPasses);

  return (
    <div className="relative flex flex-1">
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        src="https://images.unsplash.com/photo-1591449235870-2d8491bf51ff?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjE3NDQ1NzI&ixlib=rb-1.2.1&q=80"
      />
      <Form
        method="post"
        className="flex flex-1 flex-col items-center justify-center"
      >
        {openPasses.length ? (
          openPasses.map(({ id, student }, index) => {
            const duration = elapsedTimes[index];
            const status = getDurationStatus(duration, userSettings);
            const textColor =
              status === "critical"
                ? "text-red-600 animate-pulse"
                : status === "warning"
                ? "text-yellow-500 animate-pulse"
                : undefined;

            return (
              <button
                name="passId"
                type="submit"
                value={id}
                key={id}
                className="z-40 mt-10 flex flex-col items-center rounded-full bg-gray-800 p-10 text-gray-400 hover:bg-gray-700"
              >
                <h1 className="mb-5 text-5xl">
                  {`${student.firstName} ${student.lastName}`} is out there.
                </h1>
                <div
                  className={`font-mono text-6xl ${textColor}`}
                >{`${formatDurationDigital(duration)}`}</div>
              </button>
            );
          })
        ) : (
          <div className="z-40 mt-10 flex flex-col items-center rounded-full bg-gray-800 p-10 text-4xl text-gray-400 hover:bg-gray-700">
            The pod bay doors are closed (nobody is out there).{" "}
          </div>
        )}
      </Form>
    </div>
  );
}
