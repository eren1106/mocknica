# Mocknica 🚀

Create powerful mock APIs in seconds with AI assistance. Perfect for frontend development, API testing, and rapid prototyping.

## Why Mocknica?

**Stop waiting for backend APIs.** Mocknica empowers frontend developers and teams to build and test applications without backend dependencies.

### ✨ Key Features

- **🤖 AI-Powered Generation** - Generate realistic schemas and responses using OpenAI, Gemini, or local Ollama models
- **⚡ Instant CRUD APIs** - Auto-generate RESTful endpoints from your data schemas
- **🎯 Zero Configuration** - Start mocking APIs in under 2 minutes
- **🔐 Production-Ready** - Token authentication, CORS, and response wrappers included
- **🎨 Realistic Data** - Powered by Faker.js for authentic mock data
- **📊 Project Management** - Organize endpoints by projects with team collaboration

### Perfect For

- **Frontend Developers** building UIs before backend APIs are ready
- **QA Teams** testing edge cases with controlled mock data
- **Prototyping** new features and validating ideas quickly
- **API Documentation** with interactive examples
- **Demo Applications** with realistic data scenarios

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Shadcn UI + Tailwind CSS
- **Authentication**: Better Auth
- **AI Integration**: OpenAI, Google Gemini, Ollama (local)
- **Data Generation**: Faker.js
- **Development**: Docker, ESLint, pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- AI API key (OpenAI, Gemini) or Ollama locally (optional)

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
   
   # AI Providers (choose one or more)
   OPENAI_API_KEY="sk-..."
   GEMINI_API_KEY="your-gemini-key"
   # For Ollama: just install Ollama locally
   ```

3. **Setup database**
   ```bash
   pnpm db-sync
   ```

4. **Start developing**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

### Docker Alternative

```bash
docker-compose up --build
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

### Contributing Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and descriptive

### Project Structure

```
├── app/                 # Next.js app router
├── components/          # Reusable UI components
├── lib/                 # Utilities and configurations
│   └── ai/             # AI provider implementations
├── services/           # Business logic
├── models/             # Data models
└── prisma/             # Database schema
```

### Reporting Issues

- Use [GitHub Issues](https://github.com/eren1106/mocknica/issues) for bug reports
- Include reproduction steps and environment details
- Check existing issues before creating new ones

---

**Built with ❤️ by developers, for developers.**

Ready to accelerate your frontend development? [Get started now!](https://github.com/eren1106/mocknica)