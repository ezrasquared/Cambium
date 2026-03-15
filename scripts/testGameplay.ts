import { generateEncounter } from "../backend/services/specimenEngine";
import { evaluateEncounterGuess } from "../backend/services/guessEngine";

async function run() {

  console.log("\n--- GENERATING ENCOUNTER ---\n");

  const encounter = await generateEncounter();

  console.log("Clues:");
  console.log(encounter.clues);

  console.log("\nPossible species (debug):");
  console.log(encounter.possibleSpecies);

  console.log("\nActual species (debug):");
  console.log(encounter.species);

  console.log("\n--- PLAYER GUESS ---\n");

  // simulate a player guess
  const guesses = [encounter.possibleSpecies[0].scientificName];

  console.log("Player guessed:");
  console.log(guesses);

  const result = evaluateEncounterGuess(
    encounter.species,
    guesses
  );

  console.log("\n--- RESULT ---\n");

  console.log(result);

}

run();