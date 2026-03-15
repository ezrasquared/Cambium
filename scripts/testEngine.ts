import {
  getSpeciesTraits,
  compareSpecies,
  filterSpecies,
  evaluateGuess
} from "../backend/services/identificationEngine";

async function runTests() {

  console.log("\n--- SPECIES TRAITS ---\n");

  const jackPine = await getSpeciesTraits("Pinus banksiana");

  console.log(jackPine);


  console.log("\n--- SPECIES COMPARISON ---\n");

  const comparison = await compareSpecies(
    "Pinus banksiana",
    "Pinus resinosa"
  );

  console.log(comparison);


  console.log("\n--- FILTER SPECIES ---\n");

  const filtered = await filterSpecies({
    needle_count: "2"
  });

  console.log(filtered);


  console.log("\n--- GUESS EVALUATION ---\n");

  const result = evaluateGuess(
    "Pinus banksiana",
    ["Pinus resinosa", "Pinus banksiana"]
  );

  console.log(result);

}

runTests(); 