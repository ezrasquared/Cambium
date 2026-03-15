-- CreateTable
CREATE TABLE "Trait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "TraitValue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "traitId" INTEGER NOT NULL,
    CONSTRAINT "TraitValue_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CategoryTrait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    CONSTRAINT "CategoryTrait_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CategoryTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SpeciesTrait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "speciesId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    "traitValueId" INTEGER NOT NULL,
    CONSTRAINT "SpeciesTrait_speciesId_fkey" FOREIGN KEY ("speciesId") REFERENCES "Species" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpeciesTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SpeciesTrait_traitValueId_fkey" FOREIGN KEY ("traitValueId") REFERENCES "TraitValue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Trait_name_key" ON "Trait"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTrait_categoryId_traitId_key" ON "CategoryTrait"("categoryId", "traitId");

-- CreateIndex
CREATE UNIQUE INDEX "SpeciesTrait_speciesId_traitId_key" ON "SpeciesTrait"("speciesId", "traitId");
