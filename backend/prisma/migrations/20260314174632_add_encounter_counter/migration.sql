-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encounterCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Player" ("createdAt", "email", "id", "passwordHash", "username") SELECT "createdAt", "email", "id", "passwordHash", "username" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_username_key" ON "Player"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
