import { User, Setting } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getSettings(userId: User["id"] | undefined) {
  return prisma.setting.findMany({
    where: { userId },
  });
}

export function upsertSetting({
  userId,
  name,
  value,
}: Pick<Setting, "name" | "value"> & { userId: User["id"] }) {
  return prisma.setting.upsert({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
    update: { value },
    create: {
      name,
      value,
      userId,
    },
  });
}
