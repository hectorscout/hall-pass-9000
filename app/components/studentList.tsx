import { Link, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
interface HeaderProps {
  studentsAndOpenPasses: {
    id: string;
    firstName: string;
    lastName: string;
    period: string;
    passes: any[];
  }[];
  studentSearch: string;
}
export const StudentList: React.FC<HeaderProps> = ({
  studentsAndOpenPasses,
  studentSearch,
}) => {
  const { studentId } = useParams();

  const [filteredStudents, setFilteredStudents] = useState(
    studentsAndOpenPasses
  );
  useEffect(() => {
    setFilteredStudents(
      studentsAndOpenPasses.filter((student) =>
        student.firstName.toLowerCase().startsWith(studentSearch.toLowerCase())
      )
    );
  }, [studentsAndOpenPasses, studentSearch]);

  return (
    <ol>
      {filteredStudents.map((student) => {
        const isSelected = studentId === student.id;
        const isOutside = !!student.passes.length;

        return (
          <li
            key={student.id}
            className={`px-10 ${isSelected ? "bg-amber-200" : undefined}`}
          >
            <Link to={`${student.id}`} className="flex">
              <div className="flex-1">{`${student.firstName} ${student.lastName}`}</div>
              {isOutside ? "*" : <div>{student.period}</div>}
            </Link>
          </li>
        );
      })}
      {studentSearch ? (
        <Link to={`new/edit?firstname=${studentSearch}`}>
          Create New "{studentSearch}"
        </Link>
      ) : null}
    </ol>
  );
};
