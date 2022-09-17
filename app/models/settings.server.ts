import { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getSettings(userId: User["id"] | undefined) {
  return prisma.setting.findMany({
    where: { userId },
  });
}
