import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import {
  createStudent,
  getStudent,
  updateStudent,
} from "~/models/hall-pass.server";
import invariant from "tiny-invariant";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";

type LoaderData = { student?: Awaited<ReturnType<typeof getStudent>> };

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  invariant(params.studentId, "params.studentId is required");

  if (params.studentId === "new") {
    return json<LoaderData>({});
  }

  const student = await getStudent({ userId, id: params.studentId });
  if (!student) {
    throw new Response("Not Found", { status: 404 });
  }

  return json<LoaderData>({ student });
};

type ActionData =
  | {
      firstName: null | string;
      lastName: null | string;
      period: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request);
  invariant(params.studentId, "params.studentId is required");
  const formData = await request.formData();

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const period = formData.get("period");
  const notes = formData.get("notes") ?? "";

  const errors: ActionData = {
    firstName: firstName ? null : "First Name is required",
    lastName: lastName ? null : "Last Name is required",
    period: period ? null : "Period is required",
  };

  invariant(typeof firstName === "string", "firstName must be a string");
  invariant(typeof lastName === "string", "lastName must be a string");
  invariant(typeof period === "string", "period must be a string");
  invariant(typeof notes === "string", "notes must be a string");

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  if (params.studentId === "new") {
    const newStudent = await createStudent({
      userId,
      firstName,
      lastName,
      period,
      notes,
    });
    return redirect(`/${newStudent.id}`);
  } else {
    const student = await updateStudent({
      id: params.studentId,
      firstName,
      lastName,
      period,
      notes,
      userId,
    });
    return redirect(`/${student.id}`);
  }
};

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function EditStudentRoute() {
  const { student } = useLoaderData() as LoaderData;
  const errors = useActionData();

  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  // const isDeleting = transition.submission?.formData.get("intent") === "delete";
  const isNewStudent = !student;

  const periods = ["A1", "A2", "A3", "A4", "B5", "B6", "B7", "B8"];

  return (
    <Form method="post" key={student?.id}>
      <p>
        <label>
          First Name:{" "}
          {errors?.firstName ? (
            <em className="text-red-600">{errors.firstName}</em>
          ) : null}
          <input
            type="text"
            name="firstName"
            className={inputClassName}
            defaultValue={student?.firstName ?? ""}
          />
        </label>
      </p>
      <p>
        <label>
          Last Name:{" "}
          {errors?.lastName ? (
            <em className="text-red-600">{errors.lastName}</em>
          ) : null}
          <input
            type="text"
            name="lastName"
            className={inputClassName}
            defaultValue={student?.lastName ?? ""}
          />
        </label>
      </p>
      <p>
        <label>
          Period:{" "}
          {errors?.period ? (
            <em className="text-red-600">{errors.period}</em>
          ) : null}
          <select
            name="period"
            defaultValue={student?.period ?? ""}
            className={inputClassName}
          >
            {periods.map((period) => (
              <option value={period} key={period}>
                {period}
              </option>
            ))}
          </select>
        </label>
      </p>
      <p>
        <label htmlFor="notes">
          Notes:{" "}
          {errors?.notes ? (
            <em className="text-red-600">{errors.notes}</em>
          ) : null}
        </label>
        <br />
        <textarea
          id="notes"
          rows={10}
          name="notes"
          className={`${inputClassName} font-mono`}
          defaultValue={student?.notes ?? ""}
        />
      </p>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          name="intent"
          value="create"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating || isUpdating}
        >
          {isNewStudent
            ? isCreating
              ? "Creating..."
              : "Create Student"
            : null}
          {!isNewStudent
            ? isUpdating
              ? "Updating..."
              : "Update Student"
            : null}
        </button>
      </div>
    </Form>
  );
}
