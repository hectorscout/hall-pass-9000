import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { endHallPass, getOpenHallPasses } from "~/models/hall-pass.server";
import { requireUserId } from "~/utils/session.server";
import { Form, useLoaderData } from "@remix-run/react";
import { useTimeElapsed } from "~/hooks/useTimeElapsed";
import invariant from "tiny-invariant";

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
  const { openPasses } = useLoaderData<typeof loader>();
  const elapsedTimes = useTimeElapsed(
    openPasses.map((openPass) => ({ start: new Date(openPass.startAt) }))
  );

  return (
    <div>
      <Form method="post">
        {openPasses.length
          ? openPasses.map((openPass, index) => {
              const { duration, status } = elapsedTimes[index] ?? {
                duration: undefined,
                status: "good",
              };
              const textColor =
                status === "error"
                  ? "text-red-600"
                  : status === "warning"
                  ? "text-orange-500"
                  : undefined;

              return (
                <div key={openPass.id}>
                  <div className={textColor}>
                    {`${openPass.student.firstName} has been out there for ${duration}.`}
                  </div>
                  <button name="passId" type="submit" value={openPass.id}>
                    Back Inside
                  </button>
                </div>
              );
            })
          : "The pod bay doors are closed (nobody is out there)."}
      </Form>
      <div>
        If you'd like me to open the pod bay doors, select a candidate from the
        menu.
      </div>
    </div>
  );
}
