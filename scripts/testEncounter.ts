import { generateEncounter } from "../backend/services/specimenEngine";

async function run() {

  const encounter = await generateEncounter();

  console.log("\n--- SPECIMEN ENCOUNTER ---\n");

  console.log(encounter);

}

run();