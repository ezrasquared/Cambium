/*
  Warnings:

  - Made the column `displayName` on table `Trait` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL
);
INSERT INTO "new_Trait" ("displayName", "id", "name") SELECT "displayName", "id", "name" FROM "Trait";
DROP TABLE "Trait";
ALTER TABLE "new_Trait" RENAME TO "Trait";
CREATE UNIQUE INDEX "Trait_name_key" ON "Trait"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
