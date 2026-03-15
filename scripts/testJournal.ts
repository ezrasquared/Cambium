import {
  recordDiscovery,
  getJournalEntry,
  getDiscoveredSpecies,
  getUndiscoveredSpecies
} from "../backend/services/journalEngine";

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function run() {

  console.log("\n--- CREATE TEST PLAYER ---\n");

  const player = await prisma.player.upsert({
    where: { username: "test_player" },
    update: {},
    create: {
      username: "test_player"
    }
  });

  console.log(player);

  console.log("\n--- RECORD DISCOVERY ---\n");

  await recordDiscovery(
    player.id,
    "Pinus banksiana"
  );

  console.log("Discovery recorded.");

  console.log("\n--- JOURNAL ENTRY ---\n");

  const entry = await getJournalEntry(
    player.id,
    "Pinus banksiana"
  );

  console.log(entry);

  console.log("\n--- DISCOVERED SPECIES ---\n");

  const discovered = await getDiscoveredSpecies(player.id);

  console.log(discovered);

  console.log("\n--- UNDISCOVERED SPECIES ---\n");

  const undiscovered = await getUndiscoveredSpecies(player.id);

  console.log(undiscovered);

}

run();