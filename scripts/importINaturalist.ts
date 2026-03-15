import "dotenv/config";

import fetch from "node-fetch";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!
});

const prisma = new PrismaClient({ adapter });

/*
--------------------------------
CONFIG
--------------------------------
*/

const IMAGES_PER_SPECIES = 25;

const TRAIT_SET_VERSION = "conifer_v1";

/*
--------------------------------
FETCH IMAGES FROM INATURALIST
--------------------------------
*/

async function fetchImages(scientificName: string) {

  const url =
    `https://api.inaturalist.org/v1/observations` +
    `?taxon_name=${encodeURIComponent(scientificName)}` +
    `&quality_grade=research` +
    `&photos=true` +
    `&per_page=50`;

  const res = await fetch(url);

  const data: any = await res.json();

  const images: {
    url: string;
    license?: string;
    photographer?: string;
  }[] = [];

  for (const obs of data.results) {

    for (const photo of obs.photos) {

      images.push({
        url: photo.url.replace("square", "large"),
        license: photo.license_code || null,
        photographer: photo.attribution || null
      });

      if (images.length >= IMAGES_PER_SPECIES) break;

    }

    if (images.length >= IMAGES_PER_SPECIES) break;

  }

  return images;

}

/*
--------------------------------
IMPORT IMAGES
--------------------------------
*/

async function importSpeciesImages() {

  const speciesList = await prisma.species.findMany();

  for (const species of speciesList) {

    console.log(`\nImporting images for ${species.scientificName}`);

    const images = await fetchImages(species.scientificName);

    console.log(`Found ${images.length} images`);

    for (const img of images) {

      await prisma.image.create({
        data: {
          speciesId: species.id,
          url: img.url,
          license: img.license,
          photographer: img.photographer,
          traitSetVersion: TRAIT_SET_VERSION
        }
      });

    }

  }

}

/*
--------------------------------
RUN SCRIPT
--------------------------------
*/

async function main() {

  console.log("\nStarting iNaturalist image import...\n");

  await importSpeciesImages();

  console.log("\nImport complete.\n");

}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });