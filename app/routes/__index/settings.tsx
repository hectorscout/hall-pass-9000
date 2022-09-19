import { Form, useActionData, useMatches } from "@remix-run/react";
import { useRouteData } from "remix-utils";
import { RootLoaderData } from "../../root";
import { Button } from "~/components/common/button";
import { ActionFunction, json } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { upsertSetting } from "~/models/settings.server";
import invariant from "tiny-invariant";

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

type ActionData =
  | {
      warning: null | string;
      critical: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const warning = formData.get("warning");
  const critical = formData.get("critical");

  invariant(typeof warning === "string", "warning must be a string");
  invariant(typeof critical === "string", "critical must be a string");
  const warningNumber = +warning;
  const criticalNumber = +critical;
  invariant(typeof warningNumber === "number", "warning must be a number");
  invariant(typeof criticalNumber === "number", "critical must be a number");

  const errors: ActionData = {
    warning: getWarningError(warningNumber),
    critical: getCriticalError(criticalNumber, warningNumber),
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  await upsertSetting({ userId, name: "warning", value: warning });
  await upsertSetting({ userId, name: "critical", value: critical });

  return null;
};

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function SettingsRoute() {
  const rootData = useRouteData<RootLoaderData>("root");
  console.log(rootData?.userSettings);

  const errors = useActionData();

  return (
    <Form method="post">
      <div>
        <label>
          Warning:
          {errors?.warning ? (
            <em className="text-red-600">{errors.warning}</em>
          ) : null}
          <input
            type="number"
            name="warning"
            className={inputClassName}
            defaultValue={rootData?.userSettings.warning ?? 5}
          />
          Minutes
        </label>
      </div>
      <div>
        <label>
          Critical:
          {errors?.critical ? (
            <em className="text-red-600">{errors.critical}</em>
          ) : null}
          <input
            type="number"
            name="critical"
            className={inputClassName}
            defaultValue={rootData?.userSettings.critical ?? 10}
          />
          Minutes
        </label>
      </div>
      <Button type="submit">Update Settings</Button>
    </Form>
  );
}
