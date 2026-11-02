# test-repo

A minimal CRUD API for todos, built with [Hono](https://hono.dev) and TypeScript.
Node 24+ runs the `.ts` file directly, so there is no build step. Data is kept in
memory and resets on restart.

## Run

```sh
npm install
npm start        # http://localhost:3000 (override with PORT=4000 npm start)
npm run dev      # restarts on file changes
```

## API

A todo looks like `{ "id": "<uuid>", "title": "buy milk", "done": false }`.

| Method   | Path         | Body                                | Success                         | Errors     |
| -------- | ------------ | ----------------------------------- | ------------------------------- | ---------- |
| `GET`    | `/todos`     |                                     | `200` array of todos            |            |
| `POST`   | `/todos`     | `{ "title": string, "done"?: bool }` | `201` todo, `Location` header  | `400`      |
| `GET`    | `/todos/:id` |                                     | `200` todo                      | `404`      |
| `PATCH`  | `/todos/:id` | `{ "title"?: string, "done"?: bool }` | `200` updated todo            | `400` `404` |
| `DELETE` | `/todos/:id` |                                     | `204` no body                   | `404`      |

`title` must be a non-empty string (surrounding whitespace is trimmed), and `done`
must be a boolean. Errors are returned as `{ "error": "<message>" }`.

## Try it

```sh
curl -X POST localhost:3000/todos -H 'content-type: application/json' -d '{"title":"buy milk"}'
curl localhost:3000/todos
curl -X PATCH localhost:3000/todos/<id> -H 'content-type: application/json' -d '{"done":true}'
curl -X DELETE localhost:3000/todos/<id>
```
