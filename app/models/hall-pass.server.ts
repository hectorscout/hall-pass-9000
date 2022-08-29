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

export function getStudents({ userId }: { userId: User["id"] }) {
  return prisma.student.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      period: true,
      createdAt: true,
    },
    where: { userId },
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

export function createHallPass({
  studentId,
  userId,
  reason,
}: Pick<Pass, "studentId" | "reason"> & { userId: User["id"] }) {
  return prisma.pass.create({
    data: {
      reason,
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
    },
    where: { studentId },
  });
}

export function getOpenHallPasses(userId: User["id"]) {
  return prisma.pass.findMany({
    where: { userId, endAt: null },
    include: {
      student: {
        select: { firstName: true },
      },
    },
  });
}
