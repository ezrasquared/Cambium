import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

/*
────────────────────────────────
GET ALL TRAITS FOR A SPECIES
────────────────────────────────
*/

export async function getSpeciesTraits(scientificName: string) {

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

  if (!species) throw new Error("Species not found");

  const result: Record<string,string> = {};

  for (const row of species.traits) {
    result[row.trait.name] = row.traitValue.value;
  }

  return {
    species: species.scientificName,
    commonName: species.commonName,
    traits: result
  };
}

/*
────────────────────────────────
COMPARE TWO SPECIES
────────────────────────────────
*/

export async function compareSpecies(
  speciesA: string,
  speciesB: string
) {

  const a = await getSpeciesTraits(speciesA);
  const b = await getSpeciesTraits(speciesB);

  const traits = new Set([
    ...Object.keys(a.traits),
    ...Object.keys(b.traits)
  ]);

  const comparison: any[] = [];

  for (const trait of traits) {

    comparison.push({
      trait,
      speciesA: a.traits[trait] ?? null,
      speciesB: b.traits[trait] ?? null
    });

  }

  return {
    speciesA: a.species,
    speciesB: b.species,
    comparison
  };
}

/*
────────────────────────────────
FILTER SPECIES BY TRAITS
────────────────────────────────
*/

export async function filterSpecies(filters: Record<string,string>) {

  const traitEntries = Object.entries(filters);

  if (traitEntries.length === 0) {
    return [];
  }

  const matchingSpecies = await prisma.species.findMany({
    include: {
      traits: {
        include: {
          trait: true,
          traitValue: true
        }
      }
    }
  });

  const results = matchingSpecies.filter(species => {

    const speciesTraits: Record<string,string> = {};

    for (const row of species.traits) {
      speciesTraits[row.trait.name] = row.traitValue.value;
    }

    for (const [trait,value] of traitEntries) {

      if (speciesTraits[trait] !== value) {
        return false;
      }

    }

    return true;

  });

  return results.map(s => ({
    scientificName: s.scientificName,
    commonName: s.commonName
  }));
}

/*
────────────────────────────────
EVALUATE PLAYER GUESS
────────────────────────────────
*/

export function evaluateGuess(
  actualSpecies: string,
  guesses: string[]
) {

  const correct = guesses.includes(actualSpecies);

  if (!correct) {
    return {
      correct: false,
      xp: 0
    };
  }

  if (guesses.length === 1) {
    return {
      correct: true,
      xp: 100
    };
  }

  return {
    correct: true,
    xp: 50
  };
}