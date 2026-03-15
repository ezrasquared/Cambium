import { useState } from "react"
import Tagger from "./Tagger"
import Login from "./Login"

type User = {
  id: number
  username: string
  role: string
}

type Encounter = {
  type: string
  species: string
  commonName: string
  traits: Record<string, string>
}

function App() {

  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("cambium_user") || "null")
  )

  const [encounter, setEncounter] = useState<Encounter | null>(null)

  if (!user) {
    return <Login setUser={setUser} />
  }

  async function enterCambium() {

    const res = await fetch(
      `http://localhost:4000/encounter?userId=${user.id}`
    )

    const data = await res.json()

    if (data.error) {
      alert(data.error)
      return
    }

    setEncounter(data)

  }

  function logout() {

    localStorage.removeItem("cambium_user")
    setUser(null)

  }

  return (

    <div style={{ padding: 40 }}>

      <div style={{ marginBottom: 20 }}>

        Logged in as <b>{user.username}</b> ({user.role})

        <button
          onClick={logout}
          style={{ marginLeft: 10 }}
        >
          Logout
        </button>

      </div>

      {/* Tagging */}

      <Tagger user={user} />

      {/* Game access */}

      {user.role === "admin" && (

        <div style={{ marginTop: 40 }}>

          <button
            onClick={enterCambium}
            style={{ fontSize: 18 }}
          >
            Enter Cambium
          </button>

        </div>

      )}

      {encounter && (

        <div style={{ marginTop: 30 }}>

          <h2>{encounter.commonName}</h2>
          <p><i>{encounter.species}</i></p>

          <ul>

            {Object.entries(encounter.traits).map(([t, v]) => (

              <li key={t}>
                {t}: {v}
              </li>

            ))}

          </ul>

        </div>

      )}

    </div>

  )

}

export default App