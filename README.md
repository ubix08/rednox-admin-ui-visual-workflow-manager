# Rednox Admin UI

[cloudflarebutton]

A production-ready full-stack admin dashboard template built with React, TypeScript, Tailwind CSS, Shadcn UI, and Cloudflare Workers. Features a modern UI with dark mode, sidebar navigation, API backend with Hono, and seamless deployment to Cloudflare.

## 🚀 Features

- **Modern React App**: Vite-powered frontend with React 18, React Router, TanStack Query, and Zustand for state management.
- **Beautiful UI**: Shadcn UI components, Tailwind CSS with custom design system, dark/light theme toggle, animations, and responsive design.
- **Full-Stack Backend**: Hono routing in Cloudflare Workers with CORS, logging, error handling, and hot-reloadable user routes.
- **Developer Experience**: TypeScript, ESLint, hot module replacement, error boundaries, and client error reporting.
- **Performance Optimized**: Tree-shaking, code-splitting, and Cloudflare Assets for static hosting.
- **Sidebar Layout**: Collapsible sidebar with search, navigation, and badges (customizable).
- **Cloud-Native**: Deploy to Cloudflare Workers/Pages in one command.

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Lucide Icons, Framer Motion, Sonner (Toasts), React Router |
| **State & Data** | TanStack Query, Zustand, Immer, React Hook Form, Zod |
| **Backend** | Hono, Cloudflare Workers, KV/Durable Objects ready |
| **UI Components** | Radix UI primitives, Headless UI, Class Variance Authority |
| **Utilities** | clsx, tailwind-merge, date-fns, UUID |
| **Dev Tools** | Bun, ESLint, TypeScript 5, Wrangler |

## ⚡ Quick Start

1. **Clone and Install**:
   ```bash
   git clone <your-repo-url>
   cd rednox-admin-ui-w4a48uvh4zipxv8mzxoyg
   bun install
   ```

2. **Development**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (or `$PORT`).

3. **Build and Preview**:
   ```bash
   bun build
   bun preview
   ```

## 🧑‍💻 Development

### Project Structure
```
├── src/              # React frontend
│   ├── components/   # UI components & layouts
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities & error reporting
│   ├── pages/        # Route pages (edit HomePage.tsx)
│   └── main.tsx      # Entry point
├── worker/           # Cloudflare Worker backend
│   ├── index.ts      # Core (do not edit)
│   └── userRoutes.ts # Add your API routes here
└── ...               # Configs (tsconfig, tailwind, etc.)
```

### Frontend Development
- Edit `src/pages/HomePage.tsx` for your homepage.
- Use `AppLayout` from `src/components/layout/AppLayout.tsx` for sidebar.
- Components available in `@/components/ui/*` (Shadcn).
- Theme toggle and mobile hooks ready.
- Error reporting auto-sends to `/api/client-errors`.

### Backend Development
- Add routes in `worker/userRoutes.ts` (e.g., `app.get('/api/test', ...)`).
- Access `env.ASSETS` for frontend assets.
- All `/api/*` routes get CORS automatically.

### Scripts
| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server (frontend + hot-reload backend) |
| `bun build` | Build for production |
| `bun lint` | Run ESLint |
| `bun cf-typegen` | Generate Worker types |
| `bun deploy` | Build + deploy to Cloudflare |

## ☁️ Deployment

Deploy to Cloudflare Workers & Pages in seconds:

1. **Install Wrangler** (if needed): `bunx wrangler@latest login`
2. **Configure**: Edit `wrangler.jsonc` (name, secrets).
3. **Deploy**:
   ```bash
   bun run deploy
   ```
   Deploys Worker backend + static assets.

[cloudflarebutton]

Your app will be live at `https://your-project.your-subdomain.workers.dev`.

### Custom Domain
```bash
bunx wrangler deploy --var CUSTOM_DOMAIN:yourdomain.com
```

### Environment Variables
Add secrets via Wrangler dashboard or CLI:
```bash
bunx wrangler secret put YOUR_SECRET
```

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch (`bun dev`).
3. Commit changes (`bun lint`).
4. Open a PR.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙌 Support

Built with ❤️ for Cloudflare Workers. Questions? [Cloudflare Discord](https://discord.gg/cloudflaredev).