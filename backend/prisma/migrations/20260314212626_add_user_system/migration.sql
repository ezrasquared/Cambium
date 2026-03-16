/*
  Warnings:

  - You are about to drop the column `voter` on the `ImageTraitVote` table. All the data in the column will be lost.
  - Added the required column `userId` to the `ImageTraitVote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'tagger',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ImageTraitVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imageId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    "traitValueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImageTraitVote_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ImageTraitVote_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ImageTraitVote_traitValueId_fkey" FOREIGN KEY ("traitValueId") REFERENCES "TraitValue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ImageTraitVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ImageTraitVote" ("createdAt", "id", "imageId", "traitId", "traitValueId") SELECT "createdAt", "id", "imageId", "traitId", "traitValueId" FROM "ImageTraitVote";
DROP TABLE "ImageTraitVote";
ALTER TABLE "new_ImageTraitVote" RENAME TO "ImageTraitVote";
CREATE UNIQUE INDEX "ImageTraitVote_imageId_traitId_userId_key" ON "ImageTraitVote"("imageId", "traitId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
