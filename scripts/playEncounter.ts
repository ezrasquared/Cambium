import readline from "readline";

import { generateEncounter } from "../backend/services/specimenEngine";
import { evaluateEncounterGuess } from "../backend/services/guessEngine";

import {
  recordDiscovery,
  getJournalEntry,
  getDiscoveredSpecies
} from "../backend/services/journalEngine";

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({ adapter });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

/*
────────────────────────────────
JOURNAL VIEW
────────────────────────────────
*/

async function showJournal(playerId: number) {

  console.log("\n--- JOURNAL ---\n");

  const discovered = await getDiscoveredSpecies(playerId);

  if (discovered.length === 0) {
    console.log("No species discovered yet.\n");
    return;
  }

  discovered.forEach((s, i) => {
    console.log(`${i + 1}. ${s.commonName} (${s.scientificName})`);
  });
}

async function showJournalEntry(playerId: number) {

  const speciesName = await ask("\nEnter scientific name:\n> ");

  const entry = await getJournalEntry(playerId, speciesName);

  console.log("\n--- JOURNAL ENTRY ---\n");

  console.log(`${entry.commonName} (${entry.species})\n`);

  for (const [trait, value] of Object.entries(entry.traits)) {
    console.log(`${trait}: ${value}`);
  }
}

/*
────────────────────────────────
INTRODUCTION ENCOUNTER
────────────────────────────────
*/

async function playIntroduction(playerId: number, encounter: any) {

  console.log("\n🌿 NEW SPECIES DISCOVERED\n");

  console.log(`${encounter.commonName}`);
  console.log(`${encounter.species}\n`);

  console.log("Key traits:\n");

  for (const [trait, value] of Object.entries(encounter.traits)) {
    console.log(`${trait}: ${value}`);
  }

  await recordDiscovery(playerId, encounter.species);

  console.log("\nSpecies added to your journal.\n");
}

/*
────────────────────────────────
QUIZ ENCOUNTER
────────────────────────────────
*/

async function playQuiz(playerId: number, encounter: any) {

  console.log("\n--- SPECIMEN ENCOUNTER ---\n");

  for (const [trait, value] of Object.entries(encounter.clues)) {
    console.log(`${trait}: ${value}`);
  }

  const discovered = await getDiscoveredSpecies(playerId);

  let guesses: string[] = [];

  while (true) {

    console.log("\nOptions:");

    console.log("1. Make guess");
    console.log("2. View journal");
    console.log("3. Lookup species");
    console.log("4. Submit guesses");
    console.log("5. Quit round");

    const choice = await ask("\nSelect option:\n> ");

    if (choice === "1") {

      console.log("\nAvailable guesses:\n");

      discovered.forEach((s, i) => {
        console.log(`${i + 1}. ${s.commonName} (${s.scientificName})`);
      });

      console.log(`${discovered.length + 1}. Not sure`);

      const index = Number(await ask("\nChoose number:\n> "));

      if (index === discovered.length + 1) {
        console.log("\nYou chose: Not sure\n");
        guesses = [];
        break;
      }

      const selected = discovered[index - 1];

      if (!selected) {
        console.log("Invalid selection.");
        continue;
      }

      guesses.push(selected.scientificName);

      console.log("\nCurrent guesses:");

      guesses.forEach(g => console.log(g));
    }

    if (choice === "2") {
      await showJournal(playerId);
    }

    if (choice === "3") {
      await showJournalEntry(playerId);
    }

    if (choice === "4") {

      const result = evaluateEncounterGuess(
        encounter.species,
        guesses
      );

      console.log("\n--- RESULT ---\n");

      console.log(result.message);

      if (result.correct) {

        await recordDiscovery(playerId, encounter.species);

      }

      console.log("\nCorrect species:");
      console.log(encounter.species);

      return; // exit encounter
    }

    if (choice === "5") {
      console.log("Ending round.");
      return;
    }
  }

  console.log("\nCorrect species:");
  console.log(encounter.species);
}

/*
────────────────────────────────
MAIN ROUND HANDLER
────────────────────────────────
*/

async function playRound(playerId: number) {

  const encounter = await generateEncounter(playerId);

  if (encounter.type === "introduction") {
    await playIntroduction(playerId, encounter);
    return;
  }

  if (encounter.type === "quiz") {
    await playQuiz(playerId, encounter);
  }
}

/*
────────────────────────────────
MAIN GAME LOOP
────────────────────────────────
*/

async function run() {

  console.log("\n🌲 CAMBIUM CLI\n");

  const player = await prisma.player.upsert({
    where: { username: "cli_player" },
    update: {},
    create: { username: "cli_player" }
  });

  while (true) {

    console.log("\nMain Menu\n");

    console.log("1. Start encounter");
    console.log("2. View journal");
    console.log("3. Exit");

    const choice = await ask("\nSelect option:\n> ");

    if (choice === "1") {
      await playRound(player.id);
    }

    if (choice === "2") {
      await showJournal(player.id);
    }

    if (choice === "3") {
      console.log("\nGoodbye!\n");
      rl.close();
      process.exit();
    }
  }
}

run();