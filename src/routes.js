import { randomUUID } from 'node:crypto'
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js'
import { parseCSV } from './utils/read-csv.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const query = {
        title: search,
        description: search,
      }

      const users = database.select('tasks', search ? query : null)

      return res.end(JSON.stringify(users))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title) return res.writeHead(400).end('Title is required')
      if (!description) return res.writeHead(400).end('Description is required')

      const now = new Date()

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }

      database.insert('tasks', task)

      return res.writeHead(201).end(JSON.stringify(task))
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      const task = database.select('tasks', { id })[0]

      if (!task) return res.writeHead(404).end('Task not found')

      database.update('tasks', id, {
        id: task.id,
        title,
        description,
        completed_at: task.completed_at,
        created_at: task.created_at,
        updated_at: new Date().toISOString(),
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', { id })[0]

      if (!task) return res.writeHead(404).end('Task not found')

      const date = new Date()

      database.update('tasks', id, {
        id: task.id,
        title: task.title,
        description: task.description,
        completed_at: task.completed_at ? null : date.toISOString(),
        created_at: task.created_at,
        updated_at: date.toISOString()
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const task = database.select('tasks', { id })[0]

      if (!task) return res.writeHead(404).end('Task not found')

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks/upload-csv'),
    handler: async (req, res) => {
      try {
        await parseCSV()
      } catch {
        return res.writeHead(400).end('Something went wrong')
      }

      return res.writeHead(204).end()
    }
  },
]