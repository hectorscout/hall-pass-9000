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
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { intervalToDuration } from "date-fns";
import React, { useEffect, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/solid";
import { Button } from "~/components/common/button";
import { PassButton } from "~/components/passButton";
import toast from "react-hot-toast";
import { HallPassHistoryCard } from "~/components/hallPassHistoryCard";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.studentId, "params.studentId is required");

  const student = await getStudent({ userId, id: params.studentId });
  if (!student) {
    throw new Response("Not Found", { status: 404 });
  }

  const passes = await getHallPassesForStudent(params.studentId);
  const openPass = passes.find((pass) => !pass.endAt);

  return json({
    openPass,
    student,
    passes,
  });
};

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  invariant(params.studentId, "params.studentId is required");
  const formData = await request.formData();
  const reason = formData.get("reason") ?? "";
  const passId = formData.get("passId");
  invariant(typeof reason === "string", "reason must be a string");
  invariant(typeof passId === "string", "passId must be a string");

  if (["personal", "official"].includes(passId)) {
    await createHallPass({
      studentId: params.studentId,
      userId,
      reason,
      isPersonal: passId === "personal",
    });
  } else {
    await endHallPass({ id: passId });
  }
  return null;
};

// const homeUrl =
//   "https://images.unsplash.com/photo-1518228684816-9135c15ab4ea?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjIwOTM5ODA&ixlib=rb-1.2.1&q=80";
const homeUrl =
  "https://images.unsplash.com/photo-1601892782633-675465fa7f3a?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjIwOTQxMDI&ixlib=rb-1.2.1&q=80";
// const homeUrl =
//   "https://images.unsplash.com/photo-1520442027413-7bf6c51517da?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjIwOTQzNDU&ixlib=rb-1.2.1&q=80";

export default function StudentDetailsRoute() {
  const { openPass, student, passes } = useLoaderData<typeof loader>();
  const transition = useTransition();

  useEffect(() => {
    if (transition.state === "loading" && transition.type === "actionReload") {
      const passId = transition.submission.formData.get("passId") ?? "";
      invariant(typeof passId === "string", "passId must be a string");
      if (["personal", "official"].includes(passId)) {
        toast.success(
          `${student.firstName} has been jettisoned into the cold uncaring void of space.`,
          { duration: 4000 }
        );
      } else {
        toast.success(
          `${student.firstName} has safely returned through the pod bay doors.`,
          { duration: 4000 }
        );
      }
    }
  }, [
    transition.state,
    transition.type,
    transition.submission?.formData,
    student.firstName,
  ]);

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
    <div className="relative flex flex-1 flex-col overflow-hidden bg-blue-900">
      {openPass ? (
        <>
          <img
            src="/images/astronaut200.png"
            className="absolute z-10 h-[145px] w-[145px] animate-dvd-linear"
          />
          <img
            alt=""
            className="absolute inset-0 z-0 h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1591449235870-2d8491bf51ff?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjE3NDQ1NzI&ixlib=rb-1.2.1&q=80"
          />
        </>
      ) : (
        <img
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={homeUrl}
        />
      )}
      <div className="z-10 flex flex-1 flex-col">
        <div className="absolute z-10 flex items-center gap-5 p-10">
          <h1 className="flex items-center gap-5 text-6xl font-extrabold">
            <div className="block uppercase text-red-500 drop-shadow-md">{`${student?.firstName} ${student?.lastName}`}</div>
            <div className="text-3xl text-gray-400">({student.period})</div>
          </h1>
          <Link to="edit" title="Edit Cadet Records">
            <Button kind="ghost">
              <PencilIcon className="h-6 w-6" />
            </Button>
          </Link>
        </div>
        <Form
          method="post"
          className="mx-10 flex flex-1 flex-col items-start justify-center"
        >
          <PassButton
            openPassId={openPass ? openPass.id : undefined}
            elapsedDuration={elapsedDuration}
            isPersonal={openPass ? openPass.isPersonal : false}
          />
        </Form>
        <div className="absolute right-0 top-0 z-10 m-5">
          <HallPassHistoryCard passes={passes} />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
