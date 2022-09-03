import { Link, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { EyeSlashIcon } from "@heroicons/react/20/solid";
import { getPassStatus } from "~/utils/utils";
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

const statusColors = {
  good: "text-black",
  warning: "text-orange-600 animate-pulse",
  error: "text-red-600 animate-pulse",
};

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
        const status = student.passes.length
          ? getPassStatus(student.passes[0])
          : "good";

        return (
          <li
            key={student.id}
            className={`px-10 ${isSelected ? "bg-amber-200" : undefined}`}
            title={isOutside ? `${student.firstName} is out there...` : ""}
          >
            <Link to={`${student.id}`} className="flex">
              <div className="flex-1">{`${student.firstName} ${student.lastName}`}</div>
              {isOutside ? (
                <EyeSlashIcon className={`h-6 w-6 ${statusColors[status]}`} />
              ) : (
                <div>{student.period}</div>
              )}
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
