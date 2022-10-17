import { Modal } from "~/components/common/modal";
import { Button } from "~/components/common/button";
import { useState } from "react";

export const DeleteAllStudentsModal = ({ onClose }: { onClose: Function }) => {
  const [confirmValue, setConfirmValue] = useState("");

  const confirmed = confirmValue.toLowerCase() === "retire all cadets";

  return (
    <Modal
      title="Confirm Mass Retirement"
      footer={
        <div className="flex justify-end">
          <Button
            kind="ghostLight"
            className="mr-5"
            // disabled={isDeleting}
            onClick={() => onClose()}
          >
            Cancel
          </Button>
          <Button
            kind="critical"
            name="intent"
            value="delete"
            disabled={!confirmed}
            type="submit"
          >
            {confirmed ? "Make It So" : "Access Denied"}
            {/*{isDeleting ? "Deleting" : "Make It So"}*/}
          </Button>
        </div>
      }
      onClose={() => onClose()}
    >
      <div>
        <h3 className="mb-5 text-2xl font-extrabold text-red-600">WARNING:</h3>
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
      </div>
    </Modal>
  );
};
