import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

const API_KEY = process.env.OPENAI_API_KEY

app.post('/api/generate-spec', async (req, res) => {
  if (!API_KEY) {
    res.status(500).json({ error: 'OPENAI_API_KEY non configurée côté serveur.' })
    return
  }

  const { messages } = req.body as { messages: unknown[] }
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Paramètre messages manquant.' })
    return
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages,
        temperature: 0.2,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      res.status(response.status).json({ error: data.error?.message ?? 'Erreur OpenAI' })
      return
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
