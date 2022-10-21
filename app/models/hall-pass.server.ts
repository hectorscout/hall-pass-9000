import type { Student, User, Pass } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getStudent({
  id,
  userId,
}: Pick<Student, "id"> & { userId: User["id"] }) {
  return prisma.student.findFirst({
    where: { id, userId },
  });
}

export function getStudentsAndOpenPasses({ userId }: { userId: User["id"] }) {
  return prisma.student.findMany({
    where: { userId },
    include: {
      passes: {
        where: {
          endAt: null,
        },
      },
    },
    orderBy: { firstName: "asc" },
  });
}

export function createStudent({
  firstName,
  lastName,
  period,
  notes,
  userId,
}: Pick<Student, "firstName" | "lastName" | "period" | "notes"> & {
  userId: User["id"];
}) {
  return prisma.student.create({
    data: {
      firstName,
      lastName,
      period,
      notes,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateStudent({
  id,
  firstName,
  lastName,
  period,
  notes,
  userId,
}: Pick<Student, "id" | "firstName" | "lastName" | "period" | "notes"> & {
  userId: User["id"];
}) {
  return prisma.student.update({
    where: { id },
    data: {
      firstName,
      lastName,
      period,
      notes,
    },
  });
}

export function deleteStudent({
  id,
  userId,
}: Pick<Student, "id"> & { userId: User["id"] }) {
  return prisma.student.deleteMany({
    where: { id, userId },
  });
}

export function deleteAllStudents({ userId }: { userId: User["id"] }) {
  return prisma.student.deleteMany({
    where: { userId },
  });
}

export function getHallPass({
  id,
  userId,
}: Pick<Pass, "id"> & { userId: User["id"] }) {
  return prisma.pass.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export function createHallPass({
  studentId,
  userId,
  reason,
  isPersonal,
}: Pick<Pass, "studentId" | "reason" | "isPersonal"> & { userId: User["id"] }) {
  return prisma.pass.create({
    data: {
      reason,
      isPersonal,
      student: {
        connect: { id: studentId },
      },
      user: {
        connect: { id: userId },
      },
    },
  });
}

export function endHallPass({
  id,
  endAt,
}: Pick<Pass, "id"> & { endAt?: Date }) {
  return prisma.pass.update({
    where: { id },
    data: {
      endAt: endAt ?? new Date(),
    },
  });
}

export function getHallPassesForStudent(studentId: Student["id"]) {
  return prisma.pass.findMany({
    select: {
      id: true,
      startAt: true,
      endAt: true,
      reason: true,
      isPersonal: true,
    },
    where: { studentId },
    orderBy: { startAt: "desc" },
  });
}

export function getOpenHallPasses(userId: User["id"]) {
  return prisma.pass.findMany({
    where: { userId, endAt: null },
    include: {
      student: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export function updateHallPass({
  id,
  endAt,
  reason,
  isPersonal,
}: Partial<Pass> & Pick<Pass, "id" | "reason" | "isPersonal">) {
  return prisma.pass.update({
    where: { id },
    data: {
      endAt,
      reason,
      isPersonal,
    },
  });
}

export function deleteHallPass({
  id,
  userId,
}: Pick<Pass, "id"> & { userId: User["id"] }) {
  return prisma.pass.deleteMany({
    where: { id, userId },
  });
}
