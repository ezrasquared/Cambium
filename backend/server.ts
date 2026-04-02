import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import dotenv from "dotenv"; 
dotenv.config();

import { PrismaClient } from "@prisma/client"
// 1. Change the import to the correct Adapter class
import { PrismaBetterSqlite3} from "@prisma/adapter-better-sqlite3"
// 2. Import the actual SQLite driver
import Database from "better-sqlite3" 

const dbUrl = process.env.DATABASE_URL?.replace(/^file:/, "") || "../database/cambium.db";

// 2. Pass an object with the 'url' property to the adapter
const adapter = new PrismaBetterSqlite3({
  url: dbUrl
});

// 3. Initialize Prisma
const prisma = new PrismaClient({ adapter });

const app = express()
// ... the rest of your code stays exactly the same

app.use(cors())
app.use(express.json())

/*
──────────────────────────────
REGISTER
──────────────────────────────
*/

app.post("/register", async (req, res) => {

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: "missing fields" })
  }

  const existing = await prisma.user.findUnique({
    where: { username }
  })

  if (existing) {
    return res.status(400).json({ error: "username exists" })
  }

  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      passwordHash: hash
    }
  })

  res.json({
    id: user.id,
    username: user.username,
    role: user.role
  })

})

/*
──────────────────────────────
LOGIN
──────────────────────────────
*/

app.post("/login", async (req, res) => {

  const { username, password } = req.body

  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user) {
    return res.status(401).json({ error: "invalid login" })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)

  if (!valid) {
    return res.status(401).json({ error: "invalid login" })
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role
  })

})

/*
──────────────────────────────
TAG IMAGE QUEUE
──────────────────────────────
*/

app.get("/tag-image", async (req, res) => {

  const userId = Number(req.query.userId)

  if (!userId) {
    return res.status(400).json({ error: "missing userId" })
  }

  const image = await prisma.image.findFirst({

    where: {
      votes: {
        none: {
          userId: userId
        }
      }
    },

    include: {
      species: {
        include: {
          category: true
        }
      }
    }

  })

  res.json(image)

})

/*
──────────────────────────────
GET TRAITS
──────────────────────────────
*/

app.get("/traits/:categoryId", async (req, res) => {

  const categoryId = Number(req.params.categoryId)

  const traits = await prisma.categoryTrait.findMany({

    where: { categoryId },

    include: {
      trait: {
        include: {
          traitValues: true
        }
      }
    }

  })

  res.json(traits.map(t => t.trait))

})

/*
──────────────────────────────
SUBMIT TAGS
──────────────────────────────
*/

app.post("/tag", async (req, res) => {

  const { imageId, tags, userId } = req.body

  for (const tag of tags) {

    await prisma.imageTraitVote.upsert({

      where: {
        imageId_traitId_userId: {
          imageId,
          traitId: tag.traitId,
          userId
        }
      },

      update: {
        traitValueId: tag.traitValueId
      },

      create: {
        imageId,
        traitId: tag.traitId,
        traitValueId: tag.traitValueId,
        userId
      }

    })

  }

  res.json({ success: true })

})

/*
──────────────────────────────
ADMIN-ONLY GAMEPLAY
──────────────────────────────
*/

app.get("/encounter", async (req, res) => {

  const userId = Number(req.query.userId)

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "admin only" })
  }

  res.json({
    type: "introduction",
    species: "Pinus banksiana",
    commonName: "Jack Pine",
    traits: {
      needle_count: "2",
      needle_length: "short"
    }
  })

})

/*
──────────────────────────────
SERVER START
──────────────────────────────
*/

const PORT = Number(process.env.PORT) || 4000

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cambium server running on port ${PORT}`)
})