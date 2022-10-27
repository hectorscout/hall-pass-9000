import { Modal } from "~/components/common/modal";
import { Button } from "~/components/common/button";
import { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useTransition } from "@remix-run/react";

export const DeleteAllStudentsModal = ({ onClose }: { onClose: Function }) => {
  const [confirmValue, setConfirmValue] = useState("");
  const transition = useTransition();

  const isDeleting =
    transition.submission?.formData.get("delete-all-students") === "true";
  const confirmed = confirmValue.toLowerCase() === "retire all cadets";

  return (
    <Modal
      title="Confirm Mass Retirement"
      footer={
        <div className="flex justify-end">
          <Button
            kind="ghostLight"
            className="mr-5"
            disabled={isDeleting}
            onClick={() => onClose()}
          >
            Cancel
          </Button>
          <Button
            kind="critical"
            name="delete-all-students"
            value="true"
            disabled={!confirmed || isDeleting}
            type="submit"
          >
            {confirmed
              ? isDeleting
                ? "Retiring"
                : "Make It So"
              : "Access Denied"}
          </Button>
        </div>
      }
      onClose={() => onClose()}
    >
      <div>
        <h3 className="mb-5 flex items-center gap-5 text-4xl font-extrabold text-red-600">
          <ExclamationTriangleIcon className="h-12 w-12" /> WARNING:
        </h3>
        <div>
          This action will permanently destroy
          <span className="font-bold italic">all</span> records of{" "}
          <span className="font-bold italic">all</span> cadets and{" "}
          <span className="font-bold italic">all</span> of their space walks.
        </div>
        <div className="mt-3">
          Please enter you access codes below (or type "Retire All Cadets").
        </div>
        <input
          className="mt-3 w-full rounded border border-gray-500 px-2 py-1 text-lg"
          placeholder="Retire All Cadets"
          onChange={(e) => setConfirmValue(e.target.value)}
          value={confirmValue}
        />
        {confirmed ? (
          <div className="mt-3 text-sm">
            (I hope you know what you're doing...)
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
