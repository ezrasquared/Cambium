import { useState } from "react"
const API = import.meta.env.VITE_API_URL

type User = {
  id: number
  username: string
  role: string
}

type Props = {
  setUser: (u: User) => void
}

function Login({ setUser }: Props) {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)

  async function submit() {

    setLoading(true)

    try {

      const endpoint =
        mode === "login"
          ? `${API}/login`
          : `${API}/register`

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      console.log("SERVER RESPONSE:", data)

      if (data.error) {
        alert(data.error)
        setLoading(false)
        return
      }

      localStorage.setItem("cambium_user", JSON.stringify(data))

      setUser(data)

    } catch (err) {

      console.error(err)
      alert("Cannot connect to server")

    }

    setLoading(false)

  }

  return (

    <div style={{ padding: 40, maxWidth: 400, margin: "auto" }}>

      <h2>
        {mode === "login" ? "Login" : "Create Account"}
      </h2>

      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 20 }}
      />

      <button
        onClick={submit}
        disabled={loading}
        style={{ width: "100%", marginBottom: 10 }}
      >
        {loading
          ? "Please wait..."
          : mode === "login"
          ? "Login"
          : "Create Account"}
      </button>

      <button
        onClick={() =>
          setMode(mode === "login" ? "register" : "login")
        }
        style={{ width: "100%" }}
      >
        {mode === "login"
          ? "Create Account"
          : "Back to Login"}
      </button>

    </div>

  )

}

export default Login