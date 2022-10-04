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
import {
  useLoaderData,
  useNavigate,
  useParams,
  useTransition,
} from "@remix-run/react";
import { formatDate, formatTime } from "~/utils/utils";
import { useEffect, useState } from "react";
import { add, formatDistanceToNow, intervalToDuration } from "date-fns";
import { Button } from "~/components/common/button";
import toast from "react-hot-toast";
import { Modal } from "~/components/common/modal";
import { Toggle } from "~/components/common/toggle";
import { DurationInput } from "~/components/durationInput";

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
  if (intent === "delete") {
    await deleteHallPass({ id: params.passId, userId });
    return redirect(`/${params.studentId}`);
  }

  const reason = formData.get("reason") ?? "";
  const endAt = formData.get("endAt") ?? "";
  const official = formData.get("official") === "true";

  invariant(typeof reason === "string", "reason must be a string");
  invariant(typeof endAt === "string", "endAt must be a string");
  invariant(typeof official === "boolean", "official must be a boolean");

  await updateHallPass({
    id: params.passId,
    endAt: endAt ? new Date(endAt) : undefined,
    reason,
    isPersonal: !official,
  });

  return redirect(`/${params.studentId}`);
};

export default function PassDetailsRoute() {
  const { pass } = useLoaderData<typeof loader>();
  const { studentId } = useParams();
  const transition = useTransition();
  const navigate = useNavigate();

  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.type === "actionRedirect"
    ) {
      if (transition.submission.formData.get("intent") === "delete") {
        toast.success("Successfully deleted space walk.");
      } else {
        toast.success("Successfully updated space walk.");
      }
    }
  }, [transition.state, transition.type, transition.submission?.formData]);

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

  const handleOnClose = () => {
    navigate(`/${studentId}`);
  };

  return (
    <Modal
      title="Space Walk Details"
      onClose={handleOnClose}
      footer={
        <div className="flex flex-1 items-end justify-between">
          <Button
            name="intent"
            value="delete"
            kind="critical"
            disabled={isUpdating || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            name="intent"
            value="update"
            className="self-end"
            disabled={isUpdating || isDeleting}
          >
            {isUpdating ? "Updating..." : "Update Space Walk"}
          </Button>
        </div>
      }
    >
      <div className="flex w-[40rem] flex-1 flex-col gap-5">
        {pass.endAt ? (
          <input type="hidden" name="endAt" value={endAtStr} />
        ) : null}
        <div>
          <div className="flex justify-between">
            <h2 className="text-5xl">{formatDate(pass.startAt)} </h2>
            <div className="text-3xl">
              ({formatDistanceToNow(new Date(pass.startAt))} ago)
            </div>
          </div>
          <div className="text-3xl">
            {`${formatTime(pass.startAt)} - ${formatTime(
              pass.endAt ? endAt : null
            )}`}
            {pass.endAt && duration.days ? ` +${duration.days}` : null}
          </div>
        </div>
        {pass.endAt ? (
          <div className="flex justify-center">
            <DurationInput
              duration={duration}
              updateDuration={updateDuration}
            />
          </div>
        ) : (
          <div>
            You'll need to return the cadet before you can modify this space
            walk duration. You can still add notes though.
          </div>
        )}
        <label>
          <h3 className="mb-2 text-3xl"> Space Walk Notes: </h3>
          <textarea
            id="reason"
            rows={5}
            name="reason"
            className={`w-full rounded p-2 font-mono text-gray-800`}
            placeholder="Out fixing the photon torpedo bays."
            defaultValue={pass.reason ?? ""}
          />
        </label>
        <Toggle name="official" value="true" defaultChecked={!pass.isPersonal}>
          <h3 className="flex-1 text-3xl">Official Business:</h3>
        </Toggle>
      </div>
    </Modal>
  );
}
