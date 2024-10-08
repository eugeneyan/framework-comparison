# Building a small app with various frameworks

My current approach of building apps is based on fastapi + jinja/html + css + some js.
- Pros: Reliable stack that I'm familiar with
- Cons: Outdated?

Recently, I've been thinking about building apps in typescript/fastHTML and ran a poll [here](https://x.com/eugeneyan/status/1828447283811402006). This is an extension of the poll, where I'll build the same app five times using  FastAPI + HTML, FastHTML, Next.js, and Svelte. The intent was to understand which suited me best, both in terms of ease of development, learning, and fun.

The app will enable users to:
- `upload` a csv file to initialize a sqlite table
- `view` the table via the browser
- `update` a row of the sqlite database
- `delete` a row of the sqlite database
- `download` the table of the sqlite table

To keep things simple for this comparison, we'll:
- Have a single table for the data
- Not have features for table deletes or overwrites once the single table has been initialized

> Also see the detailed writeup and some thoughts [here](https://eugeneyan.com/writing/web-frameworks/).

## Setup
```
# Install Python + FastAPI + FastHTML
# Install uv: https://docs.astral.sh/uv/getting-started/installation/
uv init  # Create a new python project
uv sync  # Install dependencies

# Install Next.js + Svelte
npm install -g pnpm  # Install pnpm: https://pnpm.io 

# Next.js
cd nextjs
pnpm install  # Install dependencies

# Svelte
cd svelte
pnpm install  # Install dependencies
```

## Running the apps

### FastAPI + Jinja + CSS + JS
```
cd fastapi
uv run uvicorn main:app --reload
# Go to http://localhost:8000/
```

### FastHTML
```
cd fasthtml
uv run python main.py
# Go to http://localhost:5001
```

### Next.js
```
cd nextjs
pnpm run dev
# Go to http://localhost:3000/
```

### Svelte
```
cd svelte
pnpm run dev
# Go to http://localhost:5173/
```

### FastAPI + Svelte
```
cd fastapi+svelte
uv run uvicorn main:app --reload

# Open another terminal
cd svelte-app
pnpm run dev

# Go to http://localhost:5173/
```