import React from "react";
import type { MouseEventHandler } from "react";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { Button } from "~/components/common/button";
import { Form } from "@remix-run/react";

interface ModalProps {
  title: string;
  onClose: MouseEventHandler;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal = ({ title, onClose, children, footer }: ModalProps) => {
  return (
    <Form method="post">
      <div
        className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-auto bg-gray-800/50"
        onClick={onClose}
      >
        <div
          className="w-1/3 min-w-fit rounded-2xl bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between rounded-t-2xl bg-blue-400 px-10 py-5">
            <div className="mr-10 text-3xl">{title}</div>

            <Button kind="ghostLight" onClick={onClose}>
              <XMarkIcon className="h-10 w-10" />
            </Button>
          </div>
          <div className="bg-gray-100 p-10">{children}</div>
          {footer ? (
            <div className="rounded-b-2xl border-t-2 bg-gray-100 px-10 py-5">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </Form>
  );
};
