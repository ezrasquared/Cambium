/*
  Warnings:

  - You are about to drop the column `description` on the `Trait` table. All the data in the column will be lost.
  - Made the column `categoryId` on table `Species` required. This step will fail if there are existing NULL values in that column.
  - Made the column `commonName` on table `Species` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "speciesId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "license" TEXT,
    "photographer" TEXT,
    "traitSetVersion" TEXT NOT NULL,
    "informative" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Image_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImageTraitVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    "traitValueId" INTEGER NOT NULL,
    "voter" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImageTraitVote_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ImageTraitVote_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ImageTraitVote_traitValueId_fkey" FOREIGN KEY ("traitValueId") REFERENCES "TraitValue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TraitSetVersion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JournalProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "speciesId" INTEGER NOT NULL,
    "discovered" BOOLEAN NOT NULL DEFAULT true,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "correctIds" INTEGER NOT NULL DEFAULT 0,
    "incorrectIds" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "JournalProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JournalProgress_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_JournalProgress" ("correctIds", "discovered", "id", "incorrectIds", "masteryLevel", "playerId", "speciesId") SELECT "correctIds", "discovered", "id", "incorrectIds", "masteryLevel", "playerId", "speciesId" FROM "JournalProgress";
DROP TABLE "JournalProgress";
ALTER TABLE "new_JournalProgress" RENAME TO "JournalProgress";
CREATE UNIQUE INDEX "JournalProgress_playerId_speciesId_key" ON "JournalProgress"("playerId", "speciesId");
CREATE TABLE "new_Species" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scientificName" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "Species_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Species" ("categoryId", "commonName", "id", "scientificName") SELECT "categoryId", "commonName", "id", "scientificName" FROM "Species";
DROP TABLE "Species";
ALTER TABLE "new_Species" RENAME TO "Species";
CREATE UNIQUE INDEX "Species_scientificName_key" ON "Species"("scientificName");
CREATE TABLE "new_Trait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Trait" ("id", "name") SELECT "id", "name" FROM "Trait";
DROP TABLE "Trait";
ALTER TABLE "new_Trait" RENAME TO "Trait";
CREATE UNIQUE INDEX "Trait_name_key" ON "Trait"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TraitSetVersion_name_key" ON "TraitSetVersion"("name");
