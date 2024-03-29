import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getStudentsAndOpenPasses } from "~/models/hall-pass.server";
import { requireUserId } from "~/utils/session.server";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { useUser } from "~/utils/utils";
import { Header } from "~/components/header";
import hal9000Styles from "~/components/hal9000/hal9000.css";
import { StudentList } from "~/components/studentList";
import { useEffect, useState } from "react";
import { HomeModernIcon } from "@heroicons/react/24/solid";

export const links = () => {
  return [{ rel: "stylesheet", href: hal9000Styles }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const studentsAndOpenPasses = await getStudentsAndOpenPasses({ userId });

  return json({ studentsAndOpenPasses });
};

const getAvailablePeriods = (students: { period: string }[]) => {
  return Array.from(new Set(students.map((student) => student.period))).sort();
};

export default function HallMonitorPage() {
  const { studentsAndOpenPasses } = useLoaderData<typeof loader>();
  const user = useUser();

  const [studentSearch, setStudentSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  const location = useLocation();
  useEffect(() => {
    setStudentSearch("");
  }, [location]);

  return (
    <div className="flex h-full flex-col">
      <Header username={user.displayName} profileImgUrl={user.profileImgUrl} />
      <main className="flex flex h-full overflow-hidden bg-white">
        <div className="flex h-full w-80 flex-col overflow-hidden bg-gray-100">
          <div className="pl-10">
            <h2 className="my-5 text-3xl">
              <Link to="">
                <HomeModernIcon className="h-10 w-10" />
                Home
              </Link>
            </h2>
            <h2 className="text-2xl">
              <Link
                to={`new/edit?firstname=${
                  studentSearch.split(" ")[0]
                }&lastName=${
                  studentSearch.split(" ")[1] ?? ""
                }&period=${periodFilter}`}
              >
                + New Cadet
              </Link>
            </h2>
          </div>
          {studentsAndOpenPasses.length ? (
            <div className="mt-10 flex flex-col overflow-hidden">
              <div className="mx-10 mb-2 flex justify-between">
                <input
                  className="w-2/3 outline-none"
                  name="studentSearch"
                  value={studentSearch}
                  placeholder="Ethan"
                  type="search"
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <select
                  className="cursor-pointer bg-gray-100 outline-none"
                  onChange={({ target }) => setPeriodFilter(target.value)}
                >
                  <option value="">All</option>
                  {getAvailablePeriods(studentsAndOpenPasses).map((period) => {
                    return (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    );
                  })}
                </select>
              </div>
              <StudentList
                studentsAndOpenPasses={studentsAndOpenPasses}
                studentSearch={studentSearch}
                periodFilter={periodFilter}
              />
            </div>
          ) : null}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
