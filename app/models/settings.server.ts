import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getSettings(userId: User["id"] | undefined) {
  return prisma.setting.findFirst({
    where: { userId },
  });
}

export function upsertSetting({
  userId,
  value,
}: {
  userId: User["id"];
  value: { critical: number; warning: number; expandPassLog: boolean };
}) {
  const json = JSON.stringify(value);
  return prisma.setting.upsert({
    where: {
      userId,
    },
    update: { json },
    create: {
      json,
      userId,
    },
  });
}
