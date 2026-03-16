/*
  Warnings:

  - A unique constraint covering the columns `[imageId,traitId,voter]` on the table `ImageTraitVote` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "speciesId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "license" TEXT,
    "photographer" TEXT,
    "traitSetVersion" TEXT NOT NULL,
    "informative" BOOLEAN NOT NULL DEFAULT true,
    "tagComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Image_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("createdAt", "id", "informative", "license", "photographer", "speciesId", "traitSetVersion", "url") SELECT "createdAt", "id", "informative", "license", "photographer", "speciesId", "traitSetVersion", "url" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ImageTraitVote_imageId_traitId_voter_key" ON "ImageTraitVote"("imageId", "traitId", "voter");
