import { Link, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
interface HeaderProps {
  students: {
    id: string;
    firstName: string;
    lastName: string;
    period: string;
  }[];
  studentSearch: string;
}
export const StudentList: React.FC<HeaderProps> = ({
  students,
  studentSearch,
}) => {
  const { studentId } = useParams();

  const [filteredStudents, setFilteredStudents] = useState(students);
  useEffect(() => {
    setFilteredStudents(
      students.filter((student) =>
        student.firstName.toLowerCase().startsWith(studentSearch.toLowerCase())
      )
    );
  }, [students, studentSearch]);

  return (
    <ol className="mr-10">
      {filteredStudents.map((student) => (
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
      {studentSearch ? (
        <Link to={`new/edit?firstname=${studentSearch}`}>
          Create New "{studentSearch}"
        </Link>
      ) : null}
    </ol>
  );
};
