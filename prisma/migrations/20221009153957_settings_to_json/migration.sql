/*
  I decided to just drop the Settings table since nobody is really using it anyway.
*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
DROP TABLE "Setting";
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Setting_userId_key" ON "Setting"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
