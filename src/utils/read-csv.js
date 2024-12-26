import fs from 'node:fs'
import { parse } from 'csv-parse'

export async function parseCSV() {
  const path = new URL('./fake-data.csv', import.meta.url)
  const fileStream = fs.createReadStream(path)

  const parser = fileStream.pipe(parse({ columns: false }))

  let index = 0

  try {
    for await (const row of parser) {
      if (index > 0) {
        console.log(`Reading row ${index}`)

        const [title, description] = row

        console.log(row)

        await fetch('http://localhost:3333/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description,
          }),
          duplex: 'half'
        })
      }

      index++
    }
  } catch (error) {
    throw error
  }
}