import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Task = {
  id: number
  title: string
  description: string | null
  completed: boolean
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const loadTasks = async () => {
    const response = await fetch('/api/v1/tasks')
    if (!response.ok) {
      throw new Error('Impossible de charger les tâches')
    }
    return response.json() as Promise<Task[]>
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const data = await loadTasks()
        setTasks(data)
        if (data.length === 0) {
          await createTask({
            title: 'Première tâche',
            description: 'Créée depuis l’API',
            completed: false,
          })
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Erreur inconnue')
      }
    }

    void bootstrap()
  }, [])

  const createTask = async (payload: { title: string; description: string; completed: boolean }) => {
    const response = await fetch('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error('Impossible de créer la tâche')
    }

    const createdTask = (await response.json()) as Task
    setTasks((current) => [createdTask, ...current])
    return createdTask
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) {
      setMessage('Le titre est obligatoire')
      return
    }

    setLoading(true)
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        completed: false,
      })
      setTitle('')
      setDescription('')
      setMessage('Tâche créée avec succès')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="panel">
        <h1>Gestion des tâches</h1>
        <p>App de gestion des tâches integrer avec jenkins </p>

        <form onSubmit={handleSubmit} className="task-form">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Titre de la tâche"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer une tâche'}
          </button>
        </form>

        {message ? <p className="message">{message}</p> : null}

        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong>
              <span>{task.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
