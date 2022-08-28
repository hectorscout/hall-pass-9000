import { Link } from "@remix-run/react";
// import { SerializedStudents } from "~/routes/__index";
import type { getStudents } from "~/models/hall-pass.server";
interface HeaderProps {
  students: Awaited<ReturnType<typeof getStudents>>;
}
export const StudentList: React.FC<HeaderProps> = ({ students }) => {
  return (
    <ol>
      {students.map((student) => (
        <li key={student.id}>
          <Link to={`${student.id}`}>
            {`${student.firstName} ${student.lastName} ${student.period}`}
          </Link>
        </li>
      ))}
    </ol>
  );
};
