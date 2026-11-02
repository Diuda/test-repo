import { serve } from '@hono/node-server'
import { Hono } from 'hono'

type Todo = { id: string; title: string; done: boolean }

// In-memory store: data resets on every restart.
const todos = new Map<string, Todo>()

// Returns an error message, or null when the body is valid.
// `partial` allows title to be omitted (PATCH).
function validate(body: any, partial: boolean): string | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return 'body must be a JSON object'
  if ((!partial || 'title' in body) && (typeof body.title !== 'string' || !body.title.trim())) {
    return 'title must be a non-empty string'
  }
  if ('done' in body && typeof body.done !== 'boolean') return 'done must be a boolean'
  return null
}

const app = new Hono()

app.get('/todos', (c) => c.json([...todos.values()]))

app.post('/todos', async (c) => {
  const body = await c.req.json().catch(() => null)
  const error = validate(body, false)
  if (error) return c.json({ error }, 400)

  const todo: Todo = { id: crypto.randomUUID(), title: body.title.trim(), done: body.done ?? false }
  todos.set(todo.id, todo)
  c.header('Location', `/todos/${todo.id}`)
  return c.json(todo, 201)
})

app.get('/todos/:id', (c) => {
  const todo = todos.get(c.req.param('id'))
  return todo ? c.json(todo) : c.json({ error: 'todo not found' }, 404)
})

app.patch('/todos/:id', async (c) => {
  const todo = todos.get(c.req.param('id'))
  if (!todo) return c.json({ error: 'todo not found' }, 404)

  const body = await c.req.json().catch(() => null)
  const error = validate(body, true)
  if (error) return c.json({ error }, 400)

  if ('title' in body) todo.title = body.title.trim()
  if ('done' in body) todo.done = body.done
  return c.json(todo)
})

app.delete('/todos/:id', (c) => {
  if (!todos.delete(c.req.param('id'))) return c.json({ error: 'todo not found' }, 404)
  return c.body(null, 204)
})

app.notFound((c) => c.json({ error: 'route not found' }, 404))

const port = Number(process.env.PORT) || 3000
serve({ fetch: app.fetch, port }, (info) => console.log(`Listening on http://localhost:${info.port}`))
