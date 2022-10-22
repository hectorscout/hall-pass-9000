import { NavLink, Outlet } from "@remix-run/react";

export default function ReportsRoute() {
  return (
    <div className="flex-1">
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
      <div className="p-10">
        <Outlet />
      </div>
    </div>
  );
}
