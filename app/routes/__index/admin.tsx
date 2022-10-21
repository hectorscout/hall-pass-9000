import { Form, useActionData, useTransition } from "@remix-run/react";
import { Button } from "~/components/common/button";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { upsertSetting } from "~/models/settings.server";
import invariant from "tiny-invariant";
import { useUserSettings } from "~/hooks/useUserSettings";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Toggle } from "~/components/common/toggle";
import { DeleteAllStudentsModal } from "~/components/deleteAllStudentsModal";
import { deleteAllStudents } from "~/models/hall-pass.server";

type ActionData =
  | {
      errors:
        | {
            warning: null | string;
            critical: null | string;
          }
        | undefined;
    }
  | { success: string };

const getWarningError = (warning: number) => {
  if (!warning) return "Warning is required";
  if (warning < 0) return "Warning must be positive";

  return null;
};

const getCriticalError = (critical: number, warning: number) => {
  if (!critical) return "Critical is required";
  if (critical < 0) return "Critical must be positive";
  if (critical <= warning) return "Critical must be greater than warning";

  return null;
};

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const deleteAllStudentsValue = formData.get("delete-all-students") === "true";

  if (deleteAllStudentsValue) {
    await deleteAllStudents({ userId });
    return { success: "All cadets have been retired" };
  }

  const warning = +(formData.get("warning") ?? "");
  const critical = +(formData.get("critical") ?? "");
  const expandPassLog = formData.get("expand-pass-log") === "true";

  invariant(typeof warning === "number", "warning must be a number");
  invariant(typeof critical === "number", "critical must be a number");
  invariant(
    typeof expandPassLog === "boolean",
    "expandPassLog must be a boolean"
  );

  const errors = {
    warning: getWarningError(warning),
    critical: getCriticalError(critical, warning),
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>({ errors });
  }

  await upsertSetting({
    userId,
    value: { warning, critical, expandPassLog },
  });

  return { success: "Settings successfully updated." };
};

const bgUrl =
  "https://images.unsplash.com/photo-1504541095505-011bf592c055?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjI2OTExODE&ixlib=rb-1.2.1&q=80";

export default function AdminRoute() {
  const userSettings = useUserSettings();
  const { errors, success } = useActionData() ?? {};
  const transition = useTransition();

  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const isUpdatingSettings = !!transition.submission?.formData.get("warning");
  const isDeletingAllStudents =
    transition.submission?.formData.get("delete-all-students") === "true";

  useEffect(() => {
    if (transition.state === "loading" && transition.type === "actionReload") {
      if (errors) {
        toast.error("Please correct any errors and try again.");
      } else {
        setConfirmDeleteAll(false);
        toast.success(success);
      }
    }
  }, [transition.state, transition.type, errors, success]);

  const [criticalVal, setCriticalVal] = useState(+userSettings.critical);
  const [warningVal, setWarningVal] = useState(+userSettings.warning);

  return (
    <div className="relative flex h-full w-full flex-col justify-between">
      <img
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={bgUrl}
      />
      <h1 className="z-10 mt-10 ml-10 flex-grow-0 text-6xl font-extrabold">
        Administration
      </h1>
      <div className="relative z-10 flex w-1/2 flex-1 items-center justify-center">
        <Form method="post">
          <div className="mb-10 text-6xl">
            {errors?.warning ? (
              <em className="block text-2xl text-red-600">{errors.warning}</em>
            ) : null}
            <label className="font-mono text-gray-900">
              <div className="text-warning">Warning:</div>
              {(warningVal ?? 0) < 10 ? "0" : null}
              <input
                className={`relative appearance-none border-none bg-transparent p-1 outline-none ${
                  (warningVal ?? 0) < 10 ? "w-14" : "w-24"
                }`}
                type="number"
                min="0"
                max="58"
                name="warning"
                defaultValue={warningVal}
                onChange={({ target: { value } }) => setWarningVal(+value)}
              />
              Minute{warningVal !== 1 ? "s" : ""}
            </label>
          </div>
          <div className="mb-10 text-6xl">
            {errors?.critical ? (
              <em className="block text-2xl text-red-600">{errors.critical}</em>
            ) : null}
            <label className="font-mono text-gray-900">
              <div className="text-critical">Critical:</div>
              {(criticalVal ?? 0) < 10 ? "0" : null}
              <input
                className={`relative appearance-none border-none bg-transparent p-1 outline-none ${
                  (criticalVal ?? 0) < 10 ? "w-14" : "w-24"
                }`}
                type="number"
                min="0"
                max="59"
                name="critical"
                defaultValue={criticalVal}
                onChange={({ target: { value } }) => setCriticalVal(+value)}
              />
              Minutes
            </label>
          </div>
          <Toggle
            name="expand-pass-log"
            value="true"
            defaultChecked={userSettings.expandPassLog}
          >
            <h3 className="flex-1 text-3xl">
              Expand Space Walk Log By Default:
            </h3>
          </Toggle>
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={transition.state !== "idle"}>
              {isUpdatingSettings ? "Updating Settings..." : "Update Settings"}
            </Button>
          </div>
        </Form>
      </div>
      <Button
        kind="critical"
        className="absolute right-0 bottom-0 m-10"
        onClick={() => setConfirmDeleteAll(true)}
        disabled={transition.state !== "idle"}
      >
        {isDeletingAllStudents
          ? "Reitiring All Cadets..."
          : "Retire All Cadets"}
      </Button>
      {confirmDeleteAll ? (
        <DeleteAllStudentsModal onClose={() => setConfirmDeleteAll(false)} />
      ) : null}
    </div>
  );
}
