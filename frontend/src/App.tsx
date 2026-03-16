import { useState } from "react"
import Tagger from "./Tagger"
import Login from "./Login"
const API = import.meta.env.VITE_API_URL


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

  // After the guard above, user cannot be null
  const currentUser = user

  async function enterCambium() {

    const res = await fetch(
      `${API}/encounter?userId=${currentUser.id}`
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

        Logged in as <b>{currentUser.username}</b> ({currentUser.role})

        <button
          onClick={logout}
          style={{ marginLeft: 10 }}
        >
          Logout
        </button>

      </div>

      {/* Tagging */}

      <Tagger user={currentUser} />

      {/* Game access */}

      {currentUser.role === "admin" && (

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