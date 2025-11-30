<img width="1474" height="602" alt="Mocknica Banner" src="https://github.com/user-attachments/assets/42f3f9fa-4986-47bd-9f4c-63f7c1586058" />

# Mocknica

An AI-Powered Open-Source Mock API Server for creating and managing mock APIs

## Demo

https://github.com/user-attachments/assets/cd6d967b-e5c6-4355-a039-2e5f7052dfce

## Why Mocknica?

**Stop waiting for backend APIs.** Mocknica empowers frontend developers and teams to build and test applications without backend dependencies.

## ✨ Key Features

- **🤖 AI-Powered Generation** - Generate schemas and endpoints using natural language with OpenAI, Gemini, or local Ollama models
- **📝 Schema-Based Design** - Define reusable data schemas with type-safe fields and auto-generate complete CRUD endpoints
- **📊 Multi-Project Support** - Organize mock APIs by project with isolated endpoints and configurations
- **🔐 Token Authentication** - Secure your mock APIs with Bearer token authentication per project
- **🌐 CORS Configuration** - Configure allowed origins for browser requests on a per-project basis
- **📦 Response Wrappers** - Customize response format and structure with reusable wrapper templates
- **⚡ Rate Limiting** - Built-in rate limiting support with Redis/Upstash integration

## 🎯 Perfect For

| Use Case                 | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| **Frontend Development** | Build UIs before backend APIs are ready                   |
| **Rapid Prototyping**    | Validate ideas quickly with realistic data                |
| **Demo Applications**    | Create compelling demos with realistic scenarios          |
| **QA Testing**           | Test edge cases with controlled mock data                 |
| **API Design**           | Design and iterate on API contracts before implementation |

## 🛠️ Tech Stack

Mocknica is built with modern and reliable technologies:

| Category           | Technologies                  |
| ------------------ | ----------------------------- |
| **Framework**      | Next.js, React, TypeScript    |
| **Styling**        | Tailwind CSS, Shadcn          |
| **Database**       | PostgreSQL, Prisma ORM        |
| **Authentication** | Better Auth, Google OAuth     |
| **AI Providers**   | OpenAI, Google Gemini, Ollama |
| **Rate Limiting**  | Redis, Upstash                |
| **Monorepo**       | Turborepo, pnpm Workspaces    |
| **Testing**        | Vitest                        |
| **Deployment**     | Docker, Vercel                |

## 📁 Monorepo Structure

Mocknica uses a **Turborepo-powered monorepo** architecture for better code organization, shared configurations, and efficient builds with caching.

```
mocknica/
├── apps/
│   ├── dashboard/          # Main Next.js application
│   │   ├── app/            # App router pages & API routes
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities, services, repositories, auth
│   │   └── prisma/         # Database schema & migrations
│   └── www/                # Landing page / Marketing website
├── packages/
│   ├── ui/                 # Shared UI component library
│   ├── eslint-config/      # Shared ESLint configurations
│   └── tsconfig/           # Shared TypeScript configurations
├── docker-compose.yml      # Docker orchestration
├── turbo.json              # Turborepo configuration
└── pnpm-workspace.yaml     # pnpm workspace config
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [pnpm](https://pnpm.io) v10+
- [Docker](https://docs.docker.com/get-docker/) (for database & Redis)

### Quick Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/eren1106/mocknica.git
   cd mocknica
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp apps/dashboard/.env.example apps/dashboard/.env
   ```

   Add your database, AI provider, and Redis credentials:

   ```env
    # Database (required)
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mocknica"

    # AI Providers (at least one recommended)
    GEMINI_API_KEY="your-gemini-key"          # Free tier available
    OPENAI_API_KEY="sk-..."                   # Optional
    OLLAMA_BASE_URL="http://localhost:11434"  # Optional

    # Optional: Rate Limiting (recommended for production)
    REDIS_URL="http://localhost:8079"         # Local via proxy, or Upstash URL
    REDIS_TOKEN="example_token"
   ```

3. **Better Auth Setup**

   Generate a secure secret for authentication:

   ```bash
   openssl rand -hex 32
   ```

   Add the generated secret to your `.env` file:

   ```env
   BETTER_AUTH_SECRET=your_generated_secret_here
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Google OAuth Setup** (Optional - for Google sign-in)

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (or select an existing one)
   - Navigate to **APIs & Services** > **OAuth consent screen**
     - Configure the consent screen (External or Internal based on your needs)
     - Add your email as a test user during development
   - Navigate to **APIs & Services** > **Credentials**
     - Click **Create Credentials** > **OAuth client ID**
     - Select **Web application** as the application type
     - Add authorized redirect URIs:
       - Development: `http://localhost:3000/api/auth/callback/google`
       - Production: `https://your-domain.com/api/auth/callback/google`
   - Add the credentials to your `.env` file:

     ```env
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     ```

   > **Note:** During development, add yourself as a test user in the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) under **Test users**.

5. **Setup database**

   ```bash
   pnpm docker:db
   pnpm db:sync
   ```

   For rate limiting, also start Redis and proxy:

   ```bash
   docker-compose up redis serverless-redis-http -d
   ```

6. **Start developing**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to get started.

### Docker Alternative

Deploy the complete stack with a single command:

```bash
# Start all services (app, database, Redis)
pnpm docker:up

# Sync database
pnpm db:sync
```

#### Docker Services

| Service                 | Description              | Port |
| ----------------------- | ------------------------ | ---- |
| `app`                   | Mocknica application     | 3000 |
| `db`                    | PostgreSQL database      | 5432 |
| `redis`                 | Redis for rate limiting  | 6379 |
| `serverless-redis-http` | Upstash-compatible proxy | 8079 |

## 📡 Using Your Mock APIs

Once created, your mock APIs are instantly available:

```bash
# Get all items
curl http://localhost:3000/api/mock/{project-id}/users

# Get single item
curl http://localhost:3000/api/mock/{project-id}/users/123

# Create item
curl -X POST http://localhost:3000/api/mock/{project-id}/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# With authentication
curl http://localhost:3000/api/mock/{project-id}/users \
  -H "Authorization: Bearer your-project-token"
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `pnpm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Reporting Issues

- Use [GitHub Issues](https://github.com/eren1106/mocknica/issues) for bug reports
- Include reproduction steps and environment details
- Check existing issues before creating new ones
