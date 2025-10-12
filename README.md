
<img width="1474" height="602" alt="Mocknica Banner" src="https://github.com/user-attachments/assets/6cc307c9-50e3-4500-8e29-b97d87f2cb7e" />

# Mocknica 

An Open-Source Mock API Platform for creating and managing mock APIs

## Why Mocknica?

**Stop waiting for backend APIs.** Mocknica empowers frontend developers and teams to build and test applications without backend dependencies.

### ✨ Key Features

- **✅ Open-Source** - No hidden agendas, fully transparent.
- **🤖 AI-Powered** - Generate mock endpoints with realistic response using LLMs.
- **📝 Schema-Based** - Define reusable data schemas with type-safe fields and auto-generate CRUD endpoints.
- **☁ Self Hosting Freedom** - Deploy anywhere with Docker or host locally - your data, your control.
- **🔐 Production-Ready** - Token authentication, CORS, and response wrappers included.
- **📊 Multiple Projects** - Organize mock APIs by project with isolated endpoints and configurations.
- **🎨 Easy to Use** - Intuitive UI for creating endpoints, schemas, and managing mock data without code. 

### Perfect For

- **Frontend Developers** building UIs before backend APIs are ready
- **Prototyping** new features and validating ideas quickly
- **Demo Applications** with realistic data scenarios
- **QA Teams** testing edge cases with controlled mock data

## 🛠️ Tech Stack
Mocknica is built with modern and reliable technologies:

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Better Auth, Google OAuth
- **AI Integration**: OpenAI, Gemini, Ollama

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (v18 or higher)
- [pnpm](https://pnpm.io) (v10 or higher)
- [Docker](https://docs.docker.com/engine/install/) (v20 or higher)

### Quick Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/eren1106/mocknica.git
   cd mocknica
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Add your database and AI provider credentials:
   ```env
   DATABASE_URL="postgresql://..."
   
   # AI Providers (choose one or more, Gemini is recommended because it offers a free tier)
   OPENAI_API_KEY="sk-..."
   GEMINI_API_KEY="your-gemini-key"
   # For Ollama: just install Ollama locally
   ```

3. **Setup database**
   ```bash
   pnpm docker:db
   pnpm db:sync
   ```

4. **Start developing**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

### Docker Alternative

```bash
pnpm docker:up
pnpm db:sync
```

### Creating Your First Mock API

1. **Sign up** and create a project
2. **Generate a schema** with AI:
   - Describe your data: *"User profile for social media app"*
   - AI creates complete schema with realistic fields
3. **Auto-generate endpoints** from schema
4. **Use your API** immediately:
   ```bash
   curl http://localhost:3000/api/mock/your-project/users
   ```

### 🤖 AI-Powered Development

Mocknica supports multiple AI providers for intelligent schema and response generation:

#### Supported Providers

| Provider | Models | Setup |
|----------|--------|-------|
| **OpenAI** | GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo | Add `OPENAI_API_KEY` to .env |
| **Google Gemini** | Gemini 2.0 Flash, Gemini Pro | Add `GEMINI_API_KEY` to .env |
| **Ollama (Local)** | Llama 3.2, DeepSeek, Mistral | Install Ollama locally |

#### AI Features

- **Smart Schema Generation**: Describe your data in plain English
  ```text
  "E-commerce product with pricing, reviews, and inventory"
  ```
- **Realistic Response Creation**: Generate complex mock responses
- **Domain-Aware**: Context-aware field generation for any industry
- **Multiple Models**: Choose the best AI model for your needs

### 📡 Using Your Mock APIs

Once created, your mock APIs are instantly available via REST endpoints:

```javascript
// Get all items
fetch('http://localhost:3000/api/mock/project-id/users')

// Get single item
fetch('http://localhost:3000/api/mock/project-id/users/123')

// Create new item
fetch('http://localhost:3000/api/mock/project-id/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
})
```

### 🔧 Configuration Options

- **Authentication**: Public or token-protected endpoints
- **CORS**: Configure allowed origins for browser requests
- **Response Wrappers**: Customize response format and structure
- **Data Volume**: Control how many items returned in lists

## 🤝 Contribute

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   pnpm test
   ```
5. **Submit a pull request**

### Reporting Issues

- Use [GitHub Issues](https://github.com/eren1106/mocknica/issues) for bug reports
- Include reproduction steps and environment details
- Check existing issues before creating new ones

---

**Built with ❤️ by developers, for developers.**

Ready to accelerate your frontend development? [Get started now!](https://github.com/eren1106/mocknica)
