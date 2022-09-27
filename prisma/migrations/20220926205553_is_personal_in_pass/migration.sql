-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pass" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" DATETIME,
    "reason" TEXT NOT NULL,
    "isPersonal" BOOLEAN NOT NULL DEFAULT true,
    "studentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Pass_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Pass" ("endAt", "id", "reason", "startAt", "studentId", "userId") SELECT "endAt", "id", "reason", "startAt", "studentId", "userId" FROM "Pass";
DROP TABLE "Pass";
ALTER TABLE "new_Pass" RENAME TO "Pass";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
