# Building a small app with various frameworks

My current approach of building apps is based on fastapi + jinja/html + css + some js.
- Pros: Reliable stack that I'm familiar with
- Cons: Outdated?

Recently, I've been thinking about building apps in js (next.js?) and trying fastHTML, and ran a poll [here](https://x.com/eugeneyan/status/1828447283811402006). This is an extension of the poll, where I'll build the same app thrice using all three approaches, to get a sense of what suits me best.

The app will enable users to:
- `upload` a csv file to initialize a sqlite table
- `update` a row of the sqlite database
- `delete` a row of the sqlite database
- `download` the table of the sqlite table

To keep things simple for this comparison, we'll:
- Have a single table for the data
- Not have features for table deletes or overwrites once the single table has been initialized

## Setup
```
# Python
# Install uv: https://docs.astral.sh/uv/getting-started/installation/
uv init  # Create a new python project
uv sync  # Install dependencies

# Next.js
npm install -g pnpm
cd nextjs
pnpm install  # Install dependencies

# Svelte
cd svelte
pnpm install
```

