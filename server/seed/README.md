# Seed 24 published blogs

Posts are Editor.js documents that match `POST /blog/create-blog`.

## Required publish fields (from `blogController.createBlog`)

| Field     | Rule |
|-----------|------|
| `title`   | required (drafts too) |
| `des`     | required to publish, max 200 chars |
| `banner`  | public image URL, required to publish |
| `content` | `{ time, blocks[], version }` with at least one block |
| `tags`    | 1–10 strings, stored lowercase |
| `draft`   | `false` |
| `author`  | set from the logged-in user / seed script, not the JSON |

Homepage chips that need matching tags: `programming`, `sports`, `finance`, `socials`, `agriculture`, `films`, `from`, `football`.

## Run

1. Register at least one user in the app.
2. From `server/`:

```bash
# optional: pin the author
# SEED_AUTHOR_USERNAME=yourname

pnpm seed:blogs
```

Idempotent: reruns skip titles this author already has.
