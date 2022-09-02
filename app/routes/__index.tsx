import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getStudents } from "~/models/hall-pass.server";
import { requireUserId } from "~/utils/session.server";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { useUser } from "~/utils/utils";
import { Header } from "~/components/header";
import styles from "~/components/hal9000/hal9000.css";
// import { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import { StudentList } from "~/components/studentList";
import { useState } from "react";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const students = await getStudents({ userId });

  return json({ students });
};

export default function HallMonitorPage() {
  const { students } = useLoaderData<typeof loader>();
  const user = useUser();

  const [studentSearch, setStudentSearch] = useState("");

  return (
    <div className="flex h-full flex-col">
      <Header username={user.displayName} profileImgUrl={user.profileImgUrl} />
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-100 pl-10">
          <h2 className="my-5 text-3xl">
            <Link to="">Home</Link>
          </h2>
          <h2 className="text-2xl">
            <Link to={`new/edit?firstname=${studentSearch}`}>
              + New Student
            </Link>
          </h2>
          <div className="mt-10">
            <input
              className="mb-2"
              name="studentSearch"
              value={studentSearch}
              placeholder="Ethan"
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <StudentList students={students} studentSearch={studentSearch} />
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
