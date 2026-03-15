import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({ adapter });

async function run() {

  const player = await prisma.player.findUnique({
    where: { username: "web_player" }
  });

  if (!player) {
    console.log("web_player not found.");
    return;
  }

  /*
  Delete journal discoveries
  */

  await prisma.journalProgress.deleteMany({
    where: {
      playerId: player.id
    }
  });

  /*
  Reset encounter counter
  */

  await prisma.player.update({
    where: { id: player.id },
    data: {
      encounterCount: 0
    }
  });

  console.log("web_player progression reset.");

}

run()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });