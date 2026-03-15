/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Species` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[traitId,value]` on the table `TraitValue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "JournalProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "discovered" BOOLEAN NOT NULL DEFAULT false,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "correctIds" INTEGER NOT NULL DEFAULT 0,
    "incorrectIds" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "JournalProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JournalProgress_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Species" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scientificName" TEXT NOT NULL,
    "commonName" TEXT,
    "categoryId" INTEGER,
    CONSTRAINT "Species_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Species" ("categoryId", "commonName", "id", "scientificName") SELECT "categoryId", "commonName", "id", "scientificName" FROM "Species";
DROP TABLE "Species";
ALTER TABLE "new_Species" RENAME TO "Species";
CREATE UNIQUE INDEX "Species_scientificName_key" ON "Species"("scientificName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");

-- CreateIndex
CREATE UNIQUE INDEX "JournalProgress_playerId_speciesId_key" ON "JournalProgress"("playerId", "speciesId");

-- CreateIndex
CREATE UNIQUE INDEX "TraitValue_traitId_value_key" ON "TraitValue"("traitId", "value");
