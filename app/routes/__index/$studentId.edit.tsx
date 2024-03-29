import { useEffect, useState } from "react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { requireUserId } from "~/utils/session.server";
import {
  createStudent,
  deleteStudent,
  getStudent,
  updateStudent,
} from "~/models/hall-pass.server";

import { Button } from "~/components/common/button";
import { Modal } from "~/components/common/modal";
import { capitalizeString, PERIODS } from "~/utils/utils";
import toast from "react-hot-toast";

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

  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteStudent({ id: params.studentId, userId });

    return redirect("/");
  }

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

const bgUrl =
  "https://images.unsplash.com/photo-1504541095505-011bf592c055?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjI2OTExODE&ixlib=rb-1.2.1&q=80";

export default function EditStudentRoute() {
  const { student } = useLoaderData() as LoaderData;
  const errors = useActionData();
  const [searchParams] = useSearchParams();

  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  const isNewStudent = !student;

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (
      transition.state === "loading" &&
      transition.type === "actionRedirect"
    ) {
      const firstName =
        transition.submission.formData.get("firstName") ?? student?.firstName;
      const lastName =
        transition.submission.formData.get("lastName") ?? student?.lastName;

      if (isDeleting) {
        toast.success(`${firstName} ${lastName} has been retired.`);
      } else if (isCreating) {
        toast.success(`${firstName} ${lastName} has been enrolled.`);
      } else {
        toast.success(
          `Personal records for ${firstName} ${lastName} have been updated.`
        );
      }
    }
  }, [
    transition.state,
    transition.type,
    isCreating,
    isDeleting,
    transition.submission?.formData,
    student?.firstName,
    student?.lastName,
  ]);

  return (
    <div className="relative flex h-full w-full flex-col justify-between">
      <img
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={bgUrl}
      />
      <h1 className="z-10 mt-10 ml-10 flex-grow-0 text-6xl font-extrabold">
        Cadet {isNewStudent ? "Enrollment" : "Profile"}
      </h1>
      <div className="z-10 flex w-1/2 flex-1 items-center justify-center">
        <Form method="post" key={student?.id} className="z-10 ml-10">
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
                defaultValue={
                  student?.firstName ??
                  capitalizeString(searchParams.get("firstname"))
                }
                autoFocus
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
                defaultValue={
                  student?.lastName ??
                  capitalizeString(searchParams.get("lastName"))
                }
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
                defaultValue={
                  student?.period ?? searchParams.get("period") ?? ""
                }
                className={inputClassName}
              >
                {PERIODS.map((period) => (
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
            <Button
              type="submit"
              name="intent"
              value={isNewStudent ? "create" : "update"}
              disabled={isCreating || isUpdating || isDeleting}
            >
              {isCreating}
              {isNewStudent
                ? isCreating
                  ? "Enrolling..."
                  : "Enroll Cadet"
                : null}
              {!isNewStudent
                ? isUpdating
                  ? "Updating..."
                  : "Update Cadet Records"
                : null}
            </Button>
          </div>
        </Form>
        {!isNewStudent ? (
          <div
            className="absolute right-0 bottom-0 m-10"
            onClick={() => setConfirmDelete(true)}
          >
            <Button kind="critical">
              {isDeleting ? "Retiring..." : "Retire Cadet"}
            </Button>
          </div>
        ) : null}
      </div>
      {confirmDelete ? (
        <Modal
          title="Confirm Retirement"
          footer={
            <div className="flex justify-end">
              <Button
                kind="ghostLight"
                className="mr-5"
                disabled={isDeleting}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                kind="critical"
                name="intent"
                value="delete"
                disabled={isDeleting}
                type="submit"
              >
                {isDeleting ? "Retiring" : "Make It So"}
              </Button>
            </div>
          }
          onClose={() => setConfirmDelete(false)}
        >
          <div>
            <h3 className="mb-5 text-2xl font-extrabold text-red-600">
              WARNING:
            </h3>
            <div>
              {`Retiring ${student?.firstName} ${student?.lastName} will permanently destroy
              all records of this cadet and all of their space walks.`}
            </div>
            <div className="mt-3">
              You gotta ask yourself, <i>"is this really what I want to do?"</i>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
