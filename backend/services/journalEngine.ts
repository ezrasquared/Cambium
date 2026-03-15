import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

/*
────────────────────────────────
RECORD SPECIES DISCOVERY
────────────────────────────────
*/

export async function recordDiscovery(
  playerId: number,
  scientificName: string
) {

  const species = await prisma.species.findUnique({
    where: { scientificName }
  });

  if (!species) {
    throw new Error("Species not found");
  }

  const entry = await prisma.journalProgress.upsert({
    where: {
      playerId_speciesId: {
        playerId: playerId,
        speciesId: species.id
      }
    },
    update: {
      discovered: true,
      correctIds: { increment: 1 }
    },
    create: {
      playerId: playerId,
      speciesId: species.id,
      discovered: true,
      correctIds: 1,
      incorrectIds: 0,
      masteryLevel: 1
    }
  });

  return entry;

}

/*
────────────────────────────────
GET A JOURNAL ENTRY
────────────────────────────────
*/

export async function getJournalEntry(
  playerId: number,
  scientificName: string
) {

  const species = await prisma.species.findUnique({
    where: { scientificName },
    include: {
      traits: {
        include: {
          trait: true,
          traitValue: true
        }
      }
    }
  });

  if (!species) {
    throw new Error("Species not found");
  }

  const progress = await prisma.journalProgress.findUnique({
    where: {
      playerId_speciesId: {
        playerId,
        speciesId: species.id
      }
    }
  });

  const traits: Record<string,string> = {};

  for (const row of species.traits) {
    traits[row.trait.name] = row.traitValue.value;
  }

  return {
    species: species.scientificName,
    commonName: species.commonName,
    discovered: progress?.discovered ?? false,
    masteryLevel: progress?.masteryLevel ?? 0,
    traits
  };

}

/*
────────────────────────────────
LIST DISCOVERED SPECIES
────────────────────────────────
*/

export async function getDiscoveredSpecies(
  playerId: number
) {

  const progress = await prisma.journalProgress.findMany({
    where: {
      playerId,
      discovered: true
    },
    include: {
      species: true
    }
  });

  return progress.map(p => ({
    scientificName: p.species.scientificName,
    commonName: p.species.commonName,
    masteryLevel: p.masteryLevel
  }));

}

/*
────────────────────────────────
LIST UNDISCOVERED SPECIES
────────────────────────────────
*/

export async function getUndiscoveredSpecies(
  playerId: number
) {

  const discovered = await prisma.journalProgress.findMany({
    where: {
      playerId
    }
  });

  const discoveredIds = new Set(
    discovered.map(d => d.speciesId)
  );

  const species = await prisma.species.findMany();

  return species
    .filter(s => !discoveredIds.has(s.id))
    .map(s => ({
      scientificName: "?????",
      commonName: "Unknown species"
    }));

}