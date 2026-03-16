import { useEffect, useState } from "react"

type User = {
  id: number
  username: string
  role: string
}

type TraitValue = {
  id: number
  value: string
}

type Trait = {
  id: number
  displayName: string
  traitValues: TraitValue[]
}

type Image = {
  id: number
  url: string
  photographer?: string
  species: {
    category: {
      id: number
    }
  }
}

type Tag = {
  traitId: number
  traitName: string
  traitValueId: number
  traitValue: string
}

type TaggerProps = {
  user: User
}

function Tagger({ user }: TaggerProps) {

  const [image, setImage] = useState<Image | null>(null)
  const [traits, setTraits] = useState<Trait[]>([])
  const [activeTrait, setActiveTrait] = useState<number | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [sessionCount, setSessionCount] = useState(0)

  /*
  ──────────────────────────────
  LOAD IMAGE + TRAITS
  ──────────────────────────────
  */

  async function loadImage() {

    const res = await fetch(
      `cambium-production-4af3.up.railway.app/tag-image?userId=${user.id}`
    )

    const data = await res.json()

    if (!data) {
      setImage(null)
      return
    }

    setImage(data)

    const traitRes = await fetch(
      `cambium-production-4af3.up.railway.app/traits/${data.species.category.id}`
    )

    const traitData = await traitRes.json()

    setTraits(traitData)
    setTags([])

  }

  /*
  ──────────────────────────────
  TAGGING LOGIC
  ──────────────────────────────
  */

  function toggleTrait(traitId: number) {

    if (activeTrait === traitId) {
      setActiveTrait(null)
    } else {
      setActiveTrait(traitId)
    }

  }

  function deselectTrait(traitId: number) {

    setTags(prev => prev.filter(t => t.traitId !== traitId))

  }

  function selectValue(trait: Trait, value: TraitValue) {

    setTags(prev => {

      const existing = prev.find(t => t.traitId === trait.id)

      if (existing && existing.traitValueId === value.id) {
        return prev.filter(t => t.traitId !== trait.id)
      }

      return [
        ...prev.filter(t => t.traitId !== trait.id),
        {
          traitId: trait.id,
          traitName: trait.displayName,
          traitValueId: value.id,
          traitValue: value.value
        }
      ]

    })

  }

  /*
  ──────────────────────────────
  SUBMIT TAGS
  ──────────────────────────────
  */

  async function submitTags() {

    if (!image) return

    await fetch("cambium-production-4af3.up.railway.app/tag", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        imageId: image.id,
        tags,
        userId: user.id
      })

    })

    setSessionCount(c => c + 1)

    loadImage()

  }

  /*
  ──────────────────────────────
  SKIP IMAGE
  ──────────────────────────────
  */

  async function skipImage() {

    if (!image) return

    await fetch("cambium-production-4af3.up.railway.app/skip-image", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ imageId: image.id })

    })

    loadImage()

  }

  /*
  ──────────────────────────────
  INITIAL LOAD
  ──────────────────────────────
  */

  useEffect(() => {

    async function init() {

      const res = await fetch(
        `cambium-production-4af3.up.railway.app/tag-image?userId=${user.id}`
      )

      const data = await res.json()

      if (!data) {
        setImage(null)
        return
      }

      setImage(data)

      const traitRes = await fetch(
        `cambium-production-4af3.up.railway.app/traits/${data.species.category.id}`
      )

      const traitData = await traitRes.json()

      setTraits(traitData)

    }

    init()

  }, [user.id])

  /*
  ──────────────────────────────
  UI
  ──────────────────────────────
  */

  if (!image) {
    return <div>No images left to tag.</div>
  }

  return (

    <div style={{ display: "flex", padding: 40, gap: 50 }}>

      <div style={{ flex: 1 }}>

        <img
          src={image.url}
          style={{ maxWidth: "100%", borderRadius: 8 }}
        />

        {image.photographer && (

          <div style={{ marginTop: 10, fontSize: 14, opacity: 0.7 }}>
            Photo: {image.photographer}
          </div>

        )}

        <div style={{ marginTop: 20 }}>

          <button onClick={skipImage}>
            Skip Image
          </button>

        </div>

      </div>

      <div style={{ flex: 1 }}>

        <h2>Help Identify Plant Features</h2>

        <p>
          Leave a trait blank if it cannot be seen in the image.
          Choose <b>Unclear</b> if the feature is visible but ambiguous.
        </p>

        <div style={{ marginBottom: 20, fontWeight: 600 }}>
          Images tagged this session: {sessionCount}
        </div>

        {traits.map(trait => (

          <div key={trait.id} style={{ marginBottom: 20 }}>

            <button
              onClick={() => toggleTrait(trait.id)}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                background:
                  tags.some(t => t.traitId === trait.id)
                    ? "#4caf50"
                    : "#f0f0f0",
                color:
                  tags.some(t => t.traitId === trait.id)
                    ? "#fff"
                    : "#000"
              }}
            >
              {trait.displayName}
            </button>

            {activeTrait === trait.id && (

              <div style={{ marginTop: 10 }}>

                {trait.traitValues.map(v => (

                  <button
                    key={v.id}
                    onClick={() => selectValue(trait, v)}
                    style={{
                      marginRight: 8,
                      marginBottom: 6,
                      padding: "4px 8px",
                      borderRadius: 4,
                      background:
                        tags.some(
                          t => t.traitId === trait.id &&
                          t.traitValueId === v.id
                        )
                          ? "#2196f3"
                          : "#e0e0e0",
                      color:
                        tags.some(
                          t => t.traitId === trait.id &&
                          t.traitValueId === v.id
                        )
                          ? "#fff"
                          : "#000"
                    }}
                  >
                    {v.value}
                  </button>

                ))}

                <button
                  onClick={() => deselectTrait(trait.id)}
                  style={{
                    background: "#777",
                    color: "#fff",
                    padding: "4px 8px",
                    borderRadius: 4
                  }}
                >
                  Clear
                </button>

              </div>

            )}

          </div>

        ))}

        <div style={{ marginTop: 30 }}>

          <h3>Selected Tags</h3>

          {tags.length === 0 && <div>No tags selected</div>}

          {tags.map((t, i) => (

            <div key={i}>
              {t.traitName} → {t.traitValue}
            </div>

          ))}

        </div>

        <button
          onClick={submitTags}
          style={{
            marginTop: 20,
            fontSize: 16,
            padding: "8px 14px"
          }}
        >
          Submit Tags
        </button>

      </div>

    </div>

  )

}

export default Tagger