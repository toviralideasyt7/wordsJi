# WordSolverX Svelte

This is the SvelteKit-based version of **WordSolverX**, a comprehensive suite of solvers and daily answer guides for popular word puzzle games.

## 🚀 Features

-   **High-Performance Solvers**: WASM-powered and logic-based solvers for complex games.
-   **Daily Answers**: Automatically updated answer pages for today's and yesterday's puzzles.
-   **Fast & Responsive**: Built with SvelteKit and Tailwind CSS for optimal speed and SEO.
-   **Edge-Ready**: Designed to run on Cloudflare Pages/Workers.

## 📂 Site Structure & Pages

### 🧩 Specialized Solvers
Tools to help you solve specific game puzzles interactively.

| Solver Page | Description | Key Features |
| :--- | :--- | :--- |
| **[5-Letter Wordle Solver](/5-letter-wordle-solver)** | Standard Wordle solver | Dedicated 5-letter clue filtering and ranked guesses |
| **[Colordle Solver](/colordle-solver)** | Color code guessing | Hex/RGB conversion & distance logic |
| **[Quordle Solver](/quordle-solver)** | 4-board simultaneous | WASM-powered multi-board logic |
| **[Waffle Solver](/waffle-solver)** | Grid-based word swap | Rust/WASM engine, 5x5 grid support |
| **[Weaver Solver](/weaver-solver)** | Word ladder connector | Graph BFS shortest path finder |

### 📅 Answer Pages (Today & Yesterday)
Static pages providing the solutions for daily puzzles.

-   **Wordle**: `/wordle-answer-today`, `/wordle-answer-yesterday`, `/wordle-answer-archive`
-   **Quordle**: `/quordle-answer-today`, `/quordle-archive`
-   **Phoodle**: `/phoodle-answer-today`, `/phoodle-answer-yesterday`, `/phoodle-archive`
-   **Waffle**: `/waffle-answer-today`
-   **Semantle**: `/semantle-answer-today`, `/semantle-answer-yesterday`, `/semantle-archive`
-   **Globle**: `/globle-answer-today`, `/globle-archive`
-   **Colordle**: `/colordle-answer-today`, `/colordle-answer-yesterday`, `/colordle-archive`
-   **Other Games**:
    -   `/loldle-answer-today-updated` (League of Legends)
    -   `/dotadle-answer-today-updated` (Dota 2)
    -   `/pokedle-answer-today-updated` (Pokemon)
    -   `/smashdle-answer-today-updated` (Smash Bros)
    -   `/narutodle-answer-today-updated` (Naruto)
    -   `/onepiecedle-answer-today-updated` (One Piece)
    -   `/binance-wotd-solver` (Binance Word of the Day)

### ℹ️ Info & Utility
-   `/about`: About the project
-   `/contact`: Contact form
-   `/guides`: Game guides and tips
-   `/privacy-policy`: Privacy Policy
-   `/terms-of-service`: Terms of Service
-   `/archive`: General daily puzzle archive
-   `/solver`: General solver hub

## 🛠️ Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## ☁️ Deployment to Cloudflare

This project uses `@sveltejs/adapter-cloudflare` and is optimized for **Cloudflare Pages**.

### GitHub-Only Folders (Not Deployed)
- You can commit helper folders (for example: `wordle-answers-worker/`, `waffle-worker/`, `phoodle-worker/`, `naruto-worker/`, `semantle/`, `Waffle-Solver/`, `Spotleleddlesolver/`) to GitHub.
- Cloudflare deploy does not publish those folders directly.
- Deploy artifacts are restricted to `.svelte-kit/cloudflare` by `wrangler.jsonc`, and `npm run deploy` now always builds before deploy.

### **Option 1: Deploy with Wrangler (Terminal)**
This is the most direct method to deploy from your CLI.

1.  **Login to Cloudflare** (if not already logged in):
    ```bash
    npx wrangler login
    ```
    *This will open a browser window to authorize your account.*

2.  **Build the Project**:
    ```bash
    npm run build
    ```
    *This compiles the app into the `.svelte-kit/cloudflare` directory.*

3.  **Deploy to Cloudflare Pages**:
    ```bash
    npx wrangler pages deploy .svelte-kit/cloudflare --project-name wordsolverx-svelte
    ```
    *Replace `wordsolverx-svelte` with your preferred project name if different.*

### **Option 2: Connect GitHub to Cloudflare Pages (Automatic)**
1.  Push your code to a GitHub repository.
2.  Go to the Cloudflare Dashboard > **Workers & Pages**.
3.  Click **Create Application** > **Pages** > **Connect to Git**.
4.  Select your repository and branch.
5.  **Build Settings**:
    -   **Framework Preset**: `SvelteKit`
    -   **Build Command**: `npm run build`
    -   **build output directory**: `.svelte-kit/cloudflare`
6.  Click **Save and Deploy**.

---
*Built by Antigravity*
