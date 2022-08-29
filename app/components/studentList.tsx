import { Link, useParams } from "@remix-run/react";
import type { getStudents } from "~/models/hall-pass.server";
interface HeaderProps {
  students: Awaited<ReturnType<typeof getStudents>>;
}
export const StudentList: React.FC<HeaderProps> = ({ students }) => {
  const { studentId } = useParams();

  return (
    <ol className="mr-10">
      {students.map((student) => (
        <li
          key={student.id}
          className={studentId === student.id ? "bg-amber-200" : undefined}
        >
          <Link to={`${student.id}`} className="flex">
            <div className="flex-1">{`${student.firstName} ${student.lastName}`}</div>
            <div>{student.period}</div>
          </Link>
        </li>
      ))}
    </ol>
  );
};
