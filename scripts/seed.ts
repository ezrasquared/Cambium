import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function ensureTraitValues() {

  const traitValues: Record<string, string[]> = {

    needle_count: ["1","2","3","5","many"],

    needle_length: ["short","medium","long"],

    needle_arrangement: ["single","bundle","scale"],

    cone_shape: ["oval","cylindrical","rounded","curved"],

    bark_texture: ["smooth","scaly","plated","fibrous"],

    tree_shape: ["conical","narrow","rounded","irregular"],

    habitat: ["upland","lowland","bog","wetland","mixed"],

    leaf_shape: ["oval","round","heart","lobed","triangular"],

    leaf_margin: ["smooth","serrated","toothed"],

    leaf_arrangement: ["alternate","opposite"],

    leaf_lobes: ["none","shallow","deep"],

    leaf_teeth: ["none","fine","coarse"]

  };

  for (const [traitName, values] of Object.entries(traitValues)) {

    const trait = await prisma.trait.findUnique({
      where: { name: traitName }
    });

    if (!trait) continue;

    for (const value of values) {

      const existing = await prisma.traitValue.findFirst({
        where: {
          traitId: trait.id,
          value: value
        }
      });

      if (!existing) {

        await prisma.traitValue.create({
          data: {
            traitId: trait.id,
            value: value
          }
        });

      }

    }

  }

}

async function getTraitValue(traitName: string, value: string) {

  const trait = await prisma.trait.findUnique({
    where: { name: traitName }
  });

  const traitValue = await prisma.traitValue.findFirst({
    where: {
      traitId: trait!.id,
      value: value
    }
  });

  return { trait, traitValue };

}

async function assignTrait(speciesName: string, traitName: string, value: string) {

  const species = await prisma.species.findUnique({
    where: { scientificName: speciesName }
  });

  const { trait, traitValue } = await getTraitValue(traitName, value);

  await prisma.speciesTrait.upsert({
    where: {
      speciesId_traitId: {
        speciesId: species!.id,
        traitId: trait!.id
      }
    },
    update: {
      traitValueId: traitValue!.id
    },
    create: {
      speciesId: species!.id,
      traitId: trait!.id,
      traitValueId: traitValue!.id
    }
  });

}

async function main() {

  await ensureTraitValues();

  /*
  CONIFERS
  */

  await assignTrait("Pinus banksiana","needle_count","2");
  await assignTrait("Pinus banksiana","needle_length","short");
  await assignTrait("Pinus banksiana","cone_shape","curved");

  await assignTrait("Pinus resinosa","needle_count","2");
  await assignTrait("Pinus resinosa","needle_length","long");

  await assignTrait("Pinus strobus","needle_count","5");
  await assignTrait("Pinus strobus","needle_length","long");

  await assignTrait("Picea mariana","needle_count","1");
  await assignTrait("Picea mariana","needle_arrangement","single");

  await assignTrait("Picea glauca","needle_count","1");
  await assignTrait("Picea glauca","needle_arrangement","single");

  await assignTrait("Abies balsamea","needle_count","1");
  await assignTrait("Abies balsamea","needle_arrangement","single");

  await assignTrait("Thuja occidentalis","needle_arrangement","scale");

  /*
  BROADLEAF
  */

  await assignTrait("Betula papyrifera","leaf_shape","oval");
  await assignTrait("Betula papyrifera","leaf_margin","serrated");

  await assignTrait("Populus tremuloides","leaf_shape","round");
  await assignTrait("Populus tremuloides","leaf_margin","serrated");

  await assignTrait("Populus grandidentata","leaf_shape","round");
  await assignTrait("Populus grandidentata","leaf_margin","toothed");

  await assignTrait("Acer rubrum","leaf_lobes","shallow");

  await assignTrait("Acer saccharum","leaf_lobes","deep");

  await assignTrait("Tilia americana","leaf_shape","heart");

  await assignTrait("Fraxinus nigra","leaf_arrangement","opposite");

  await assignTrait("Fraxinus pennsylvanica","leaf_arrangement","opposite");

  console.log("Seed complete.");

}

main()
.then(async () => {
  await prisma.$disconnect();
})
.catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
}); 