import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { getSpeciesTraits } from "./identificationEngine";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({ adapter });

/*
────────────────────────────────
PROGRESSION SCHEDULE
1 = INTRODUCE NEW SPECIES
2 = QUIZ
────────────────────────────────
*/

const PROGRESSION_SEQUENCE = [
  1,1,
  2,2,2,
  1,
  2,2,2,
  1,
  2,2,2,
  1,
  2,2,2,2,2,
  1,
  2,2,2,2,2,
  1,
  2,2,2,2,2,2,2
];

/*
────────────────────────────────
UTILITIES
────────────────────────────────
*/

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/*
────────────────────────────────
PLAYER KNOWLEDGE
────────────────────────────────
*/

async function getPlayerKnowledge(playerId: number) {

  const discovered = await prisma.journalProgress.findMany({
    where: {
      playerId,
      discovered: true
    },
    include: {
      species: true
    }
  });

  const knownSpecies = discovered.map(d => d.species);

  const allSpecies = await prisma.species.findMany();

  const knownIds = new Set(knownSpecies.map(s => s.id));

  const unknownSpecies = allSpecies.filter(s => !knownIds.has(s.id));

  return {
    knownSpecies,
    unknownSpecies
  };
}

/*
────────────────────────────────
DISTINGUISHING TRAITS
────────────────────────────────
*/

async function findDistinguishingTraits(targetSpecies: any, knownSpecies: any[]) {

  const targetTraits = await prisma.speciesTrait.findMany({
    where: {
      speciesId: targetSpecies.id
    },
    include: {
      trait: true,
      traitValue: true
    }
  });

  const distinguishing: [string, string][] = [];

  for (const traitRow of targetTraits) {

    const traitName = traitRow.trait.name;
    const value = traitRow.traitValue.value;

    let differs = false;

    for (const other of knownSpecies) {

      if (other.id === targetSpecies.id) continue;

      const otherTrait = await prisma.speciesTrait.findFirst({
        where: {
          speciesId: other.id,
          traitId: traitRow.traitId
        },
        include: {
          traitValue: true
        }
      });

      if (!otherTrait || otherTrait.traitValue.value !== value) {
        differs = true;
      }
    }

    if (differs) {
      distinguishing.push([traitName, value]);
    }

  }

  return distinguishing;
}

/*
────────────────────────────────
INTRODUCTION ENCOUNTER
────────────────────────────────
*/

async function generateIntroduction(species: any) {

  const data = await getSpeciesTraits(species.scientificName);

  console.log("Encounter Type: INTRODUCTION");

  return {
    type: "introduction",
    species: data.species,
    commonName: data.commonName,
    traits: data.traits
  };
}

/*
────────────────────────────────
QUIZ ENCOUNTER
────────────────────────────────
*/

async function generateQuiz(species: any, knownSpecies: any[]) {

  const traits = await findDistinguishingTraits(species, knownSpecies);

  const shuffled = shuffle(traits);

  const clues = shuffled.slice(0, 2);

  const clueObject: Record<string, string> = {};

  for (const [trait, value] of clues) {
    clueObject[trait] = value;
  }

  console.log("Encounter Type: QUIZ");

  return {
    type: "quiz",
    species: species.scientificName,
    commonName: species.commonName,
    clues: clueObject
  };
}

/*
────────────────────────────────
MAIN ENCOUNTER GENERATOR
────────────────────────────────
*/

export async function generateEncounter(playerId: number) {

  const player = await prisma.player.findUnique({
    where: { id: playerId }
  });

  if (!player) throw new Error("Player not found");

  const encounterIndex = player.encounterCount;

  const scheduleValue =
    encounterIndex < PROGRESSION_SEQUENCE.length
      ? PROGRESSION_SEQUENCE[encounterIndex]
      : 2;

  const knowledge = await getPlayerKnowledge(playerId);

  console.log("---- ENCOUNTER DEBUG ----");
  console.log("Encounter Index:", encounterIndex);
  console.log("Schedule Value:", scheduleValue);
  console.log("Known Species:", knowledge.knownSpecies.length);
  console.log("Unknown Species:", knowledge.unknownSpecies.length);
  console.log("-------------------------");

  await prisma.player.update({
    where: { id: playerId },
    data: { encounterCount: { increment: 1 } }
  });

  if (scheduleValue === 1) {

    if (knowledge.unknownSpecies.length === 0) {

      const fallback = pickRandom(knowledge.knownSpecies);

      return generateQuiz(fallback, knowledge.knownSpecies);
    }

    const species = pickRandom(knowledge.unknownSpecies);

    return generateIntroduction(species);
  }

  if (knowledge.knownSpecies.length === 0) {

    const species = pickRandom(knowledge.unknownSpecies);

    return generateIntroduction(species);
  }

  const species = pickRandom(knowledge.knownSpecies);

  return generateQuiz(species, knowledge.knownSpecies);
}