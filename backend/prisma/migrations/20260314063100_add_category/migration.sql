-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Species" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scientificName" TEXT NOT NULL,
    "commonName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" INTEGER,
    CONSTRAINT "Species_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Species" ("commonName", "createdAt", "id", "scientificName") SELECT "commonName", "createdAt", "id", "scientificName" FROM "Species";
DROP TABLE "Species";
ALTER TABLE "new_Species" RENAME TO "Species";
CREATE UNIQUE INDEX "Species_scientificName_key" ON "Species"("scientificName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
