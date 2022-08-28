import { json, LoaderArgs } from "@remix-run/node";
import { getStudents } from "~/models/hall-pass.server";
import { requireUserId } from "~/utils/session.server";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { useUser } from "~/utils/utils";
import { Header } from "~/components/header";
import styles from "~/components/hal9000/hal9000.css";
// import { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import { StudentList } from "~/components/studentList";

export type RootLoaderData = {'students': Awaited<ReturnType<typeof getStudents>>};
export type SerializedStudents = RootLoaderData["students"];

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const students = await getStudents({ userId });

  return json({ students });
};

export default function HallMonitorPage() {
  const { students } = useLoaderData() as RootLoaderData;
  const user = useUser();

  return (
    <div className="flex h-full flex-col">
      <Header username={user.displayName} profileImgUrl={user.profileImgUrl} />
      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-100 pl-10">
          <Link to="">Home</Link>
          <br />
          <Link to="new/edit">+ New Student</Link>
          <hr />
          Students:
          <StudentList students={students} />
        </div>
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
