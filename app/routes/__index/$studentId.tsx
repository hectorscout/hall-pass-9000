import {
  ActionFunction,
  json,
  LoaderArgs,
} from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import {
  createHallPass,
  endHallPass,
  getHallPassesForStudent,
  getStudent,
} from "~/models/hall-pass.server";
import invariant from "tiny-invariant";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { useTimeElapsed } from "~/hooks/useTimeElapsed";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.studentId, "params.studentId is required");

  const student = await getStudent({ userId, id: params.studentId });
  if (!student) {
    throw new Response("Not Found", { status: 404 });
  }

  const passes = await getHallPassesForStudent(params.studentId);

  return json({ student, passes });
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
  const { student, passes } = useLoaderData<typeof loader>();
  const elapsedTimes = useTimeElapsed(
    passes.map((pass) => ({
      start: new Date(pass.startAt),
      end: pass.endAt ? new Date(pass.endAt) : undefined,
    }))
  );

  return (
    <div>
      <div>{`${student?.firstName} ${student?.lastName}`}</div>
      <div>{student?.period}</div>
      <Form method="post">
        <label htmlFor="reason">Reason:</label>
        <br />
        <textarea
          id="reason"
          rows={5}
          name="reason"
          className={`${inputClassName} font-mono`}
        />
        <button
          type="submit"
          name="passId"
          value="newPass"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
        >
          Start Hall Pass
        </button>
        <Link to="edit">
          <button className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300">
            Edit
          </button>
        </Link>
        <div>
          {" "}
          Passes:
          {passes.map((pass, index) => {
            return (
              <div key={pass.id}>
                <div>{`${pass.startAt} - ${pass.reason} - ${pass.endAt} - elapsed: ${elapsedTimes[index]}`}</div>
                {!pass.endAt ? (
                  <button name="passId" type="submit" value={pass.id}>
                    end pass
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </Form>
    </div>
  );
}
