import { Link, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { EyeSlashIcon } from "@heroicons/react/20/solid";
import { getPassStatus } from "~/utils/utils";
import { Button } from "~/components/common/button";
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  period: string;
  passes: any[];
}
interface StudentListProps {
  studentsAndOpenPasses: Student[];
  studentSearch: string;
  periodFilter: string;
}

const statusColors = {
  good: "text-black",
  warning: "text-orange-600 animate-pulse",
  critical: "text-red-600 animate-pulse",
};

export const StudentList = ({
  studentsAndOpenPasses,
  studentSearch,
  periodFilter,
}: StudentListProps) => {
  const { studentId } = useParams();

  const [filteredStudents, setFilteredStudents] = useState(
    studentsAndOpenPasses
  );
  useEffect(() => {
    setFilteredStudents(
      studentsAndOpenPasses.reduce((filtered, student) => {
        if (
          (!periodFilter || student.period === periodFilter) &&
          student.firstName
            .toLowerCase()
            .startsWith(studentSearch.toLowerCase())
        ) {
          filtered.push(student);
        }
        return filtered;
      }, [] as Student[])
    );
  }, [studentsAndOpenPasses, studentSearch, periodFilter]);

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
            className={`px-10 hover:bg-gray-300 ${
              isSelected ? "bg-gray-300" : undefined
            }`}
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
        <li className="mt-5 px-10">
          <Link
            to={`new/edit?firstname=${studentSearch}&period=${periodFilter}`}
          >
            <Button>New Cadet "{studentSearch}"</Button>
          </Link>
        </li>
      ) : null}
    </ol>
  );
};
