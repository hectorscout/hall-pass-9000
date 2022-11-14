import { NavLink, Outlet, useTransition } from "@remix-run/react";
import Loader from "~/components/common/loader";

export default function ReportsRoute() {
  const transition = useTransition();

  return (
    <div className="flex flex-1 flex-col">
      <h1 className="z-10 mt-10 ml-10 flex-grow-0 text-6xl font-extrabold">
        Reports
      </h1>
      <div className="mt-10 flex w-full border-b px-10">
        <NavLink
          to="cadets"
          className={({ isActive }) =>
            `mr-10 border-blue-300 text-3xl ${isActive ? "border-b-2" : ""}`
          }
        >
          Cadets
        </NavLink>
        <NavLink
          to="walks"
          className={({ isActive }) =>
            `mr-10 border-blue-300 text-3xl ${isActive ? "border-b-2" : ""}`
          }
        >
          Space Walks
        </NavLink>
      </div>
      <div className="relative flex flex-1 flex-col overflow-auto p-10">
        {transition.state === "loading" ? <Loader /> : null}
        <Outlet />
      </div>
    </div>
  );
}
