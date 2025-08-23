# MockA 🚀

A powerful mock API platform that helps developers create, manage, and serve realistic mock APIs for development and testing purposes. Built with Next.js, TypeScript, and modern web technologies.

<!-- ![MockA Demo](https://via.placeholder.com/800x400?text=MockA+Demo) -->

## ✨ Features

- **🎯 Dynamic Mock APIs** - Create RESTful mock endpoints with customizable responses
- **📋 Schema-Based Generation** - Define data schemas and auto-generate CRUD endpoints
- **🤖 AI-Powered Assistance** - Use Google Gemini AI to generate schemas and responses
- **🔐 Token Authentication** - Secure your mock APIs with token-based authentication
- **🌐 CORS Configuration** - Flexible CORS settings for cross-origin requests
- **📦 Response Wrappers** - Customize response formats and structures
- **🎨 Rich Data Generation** - Generate realistic fake data using Faker.js
- **👤 User Management** - Multi-user support with project isolation
- **📊 Project Organization** - Organize endpoints into projects for better management
- **🔄 Real-time Updates** - Live preview of mock responses

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Shadcn UI, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Better Auth
- **State Management**: Zustand, TanStack Query
- **Forms**: React Hook Form, Zod validation
- **AI Integration**: Google Gemini API
- **Development**: Docker, ESLint, pnpm

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Docker (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/eren1106/MockA.git
   cd MockA
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Configure your environment variables in the .env file

4. **Database Setup**

   ```bash
   pnpm db-sync
   ```

5. **Start Development Server**

   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Using Docker

```bash
# Build and start the application
docker-compose up --build

# Start in detached mode
docker-compose up -d
```

## 📖 Usage

### Creating Your First Mock API

1. **Sign up** and create an account
2. **Create a Project** - Organize your mock APIs
3. **Define Schemas** - Create data structures for your endpoints
4. **Generate Endpoints** - Auto-create CRUD endpoints from schemas
5. **Test Your API** - Use the generated endpoints in your applications

### Using the Mock API Server

MockA provides a RESTful mock API server that serves realistic data based on your defined schemas. Here's how to use it:

#### Base URL Structure

```
http://localhost:3000/api/mock/{projectId}/{endpoint-path}
```

#### Standard REST Endpoints

MockA automatically generates standard CRUD endpoints when you create endpoints from schemas:

```
GET    /api/mock/{projectId}/{endpoint}       # Get list of items
GET    /api/mock/{projectId}/{endpoint}/:id   # Get single item by ID
POST   /api/mock/{projectId}/{endpoint}       # Create new item (returns created item)
PUT    /api/mock/{projectId}/{endpoint}/:id   # Update item by ID
DELETE /api/mock/{projectId}/{endpoint}/:id   # Delete item by ID
```

#### Example Scenarios

**1. E-commerce API Example**

If you create a "products" schema with fields like name, price, description, MockA will serve:

```bash
# Get all products (returns array)
GET /api/mock/proj_123/products

# Get single product by ID
GET /api/mock/proj_123/products/1

# Create new product
POST /api/mock/proj_123/products
Content-Type: application/json
{
  "name": "New Product",
  "price": 29.99
}

# Update product
PUT /api/mock/proj_123/products/1
Content-Type: application/json
{
  "name": "Updated Product",
  "price": 39.99
}

# Delete product
DELETE /api/mock/proj_123/products/1
```

**2. User Management API**

```bash
# Get all users
GET /api/mock/proj_123/users

# Get user profile
GET /api/mock/proj_123/users/user123

# Create new user
POST /api/mock/proj_123/users
```

#### JavaScript/TypeScript Usage

```javascript
const BASE_URL = "http://localhost:3000/api/mock/your-project-id";

// GET request - Fetch all items
async function fetchProducts() {
  const response = await fetch(`${BASE_URL}/products`);
  const products = await response.json();
  return products;
}

// GET request - Fetch single item
async function fetchProduct(id) {
  const response = await fetch(`${BASE_URL}/products/${id}`);
  const product = await response.json();
  return product;
}

// POST request - Create new item
async function createProduct(productData) {
  const response = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  const newProduct = await response.json();
  return newProduct;
}

// PUT request - Update item
async function updateProduct(id, productData) {
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  const updatedProduct = await response.json();
  return updatedProduct;
}

// DELETE request
async function deleteProduct(id) {
  await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
  });
}
```

#### React/Vue.js Integration

```javascript
// React with fetch
useEffect(() => {
  fetch("http://localhost:3000/api/mock/proj_123/users")
    .then((res) => res.json())
    .then((users) => setUsers(users));
}, []);

// With axios
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/mock/proj_123",
});

// Get data
const users = await api.get("/users");

// Post data
const newUser = await api.post("/users", {
  name: "John Doe",
  email: "john@example.com",
});
```

#### Authentication

For private projects, include the Bearer token:

```javascript
const response = await fetch(`${BASE_URL}/products`, {
  headers: {
    Authorization: "Bearer your-project-token",
    "Content-Type": "application/json",
  },
});
```

#### CORS Configuration

If you're calling the API from a browser application on a different domain, make sure to configure CORS origins in your project settings:

1. Go to your project settings
2. Add your frontend domain to "CORS Origins"
3. Example: `http://localhost:3001`, `https://myapp.vercel.app`

#### Response Formats

**Default Response (Schema-based)**

```json
{
  "id": 1,
  "name": "Sample Product",
  "price": 29.99,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**With Response Wrapper**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sample Product",
    "price": 29.99
  },
  "message": "Request successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**List Response (GET /endpoint)**

```json
[
  {
    "id": 1,
    "name": "Product 1",
    "price": 29.99
  },
  {
    "id": 2,
    "name": "Product 2",
    "price": 39.99
  },
  {
    "id": 3,
    "name": "Product 3",
    "price": 49.99
  }
]
```

#### Static vs Dynamic Responses

- **Schema-based**: MockA generates realistic fake data based on your schema definition
- **Static Response**: You can override with custom JSON for specific responses
- **Data Lists**: Configure how many items to return in list endpoints (default: 3)

#### Testing Your API

You can test your mock APIs using:

1. **Browser**: Navigate directly to GET endpoints
2. **Postman**: Import endpoints and test all HTTP methods
3. **curl**: Command line testing
4. **Your Application**: Integrate directly into your frontend/mobile app

```bash
# Test with curl
curl -X GET "http://localhost:3000/api/mock/proj_123/products"
curl -X POST "http://localhost:3000/api/mock/proj_123/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":19.99}'
```

## 🤖 AI-Powered Features

MockA integrates Google Gemini AI to help you rapidly create schemas and generate realistic mock responses, making API development faster and more intelligent.

### AI Schema Generation

Instead of manually defining data structures, let AI create them for you based on natural language descriptions.

#### How to Use AI Schema Generation

1. **Navigate to Schema Creation** in your project
2. **Click "Generate with AI"** button
3. **Describe your data structure** in plain English
4. **Review and customize** the generated schema
5. **Save and use** for endpoint generation

#### Example AI Prompts

```text
"Create a user schema with name, email, age, profile picture, and address"

"Generate a product schema for an e-commerce store with pricing, categories, and inventory"

"Make a blog post schema with title, content, author, tags, and publishing details"

"Create a task management schema with priority, due dates, and assignees"
```

#### What AI Generates

The AI creates complete schema definitions with:

- **Field Names**: Semantically correct property names
- **Data Types**: Appropriate types (string, number, boolean, etc.)
- **Relationships**: Object nesting and array structures
- **Realistic Examples**: Sample values for testing

#### Generated Schema Example

**Your Prompt**: *"Create a user profile schema for a social media app"*

**AI Generated Schema**:
```json
{
  "name": "UserProfile",
  "fields": [
    {
      "name": "id",
      "type": "string",
      "description": "Unique user identifier"
    },
    {
      "name": "username",
      "type": "string",
      "description": "User's display name"
    },
    {
      "name": "email",
      "type": "string",
      "description": "User's email address"
    },
    {
      "name": "bio",
      "type": "string",
      "description": "User's biography"
    },
    {
      "name": "followers_count",
      "type": "number",
      "description": "Number of followers"
    },
    {
      "name": "verified",
      "type": "boolean",
      "description": "Account verification status"
    },
    {
      "name": "profile_picture",
      "type": "string",
      "description": "Profile image URL"
    },
    {
      "name": "created_at",
      "type": "string",
      "description": "Account creation date"
    }
  ]
}
```

### AI Response Generation

Generate custom endpoint responses using AI for specific use cases or complex data structures.

#### How to Use AI Response Generation

1. **Go to Endpoint Management**
2. **Create or edit an endpoint**
3. **Click "Generate Response with AI"**
4. **Describe the response you need**
5. **Customize the generated JSON**

#### Example Response Generation

**Your Prompt**: *"Generate a detailed product listing response for a smartphone with specifications"*

**AI Generated Response**:
```json
{
  "id": "iphone-15-pro",
  "name": "iPhone 15 Pro",
  "brand": "Apple",
  "price": 999.99,
  "currency": "USD",
  "specifications": {
    "display": {
      "size": "6.1 inches",
      "type": "OLED",
      "resolution": "2556x1179"
    },
    "processor": "A17 Pro chip",
    "storage": ["128GB", "256GB", "512GB", "1TB"],
    "camera": {
      "main": "48MP",
      "ultra_wide": "12MP",
      "telephoto": "12MP"
    },
    "battery": "Up to 23 hours video playback",
    "colors": ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]
  },
  "availability": {
    "in_stock": true,
    "shipping": "2-3 business days"
  },
  "rating": {
    "average": 4.6,
    "total_reviews": 1247
  }
}
```

### AI Integration Benefits

#### 🚀 **Speed & Efficiency**
- Create complex schemas in seconds
- Generate realistic data structures instantly
- Reduce manual schema definition time by 80%

#### 🎯 **Accuracy & Relevance**
- Context-aware field generation
- Industry-standard naming conventions
- Appropriate data types and structures

#### 💡 **Creative Solutions**
- Discover new data structure possibilities
- Generate edge cases and comprehensive examples
- Create domain-specific schemas with expertise

#### 🔄 **Iterative Improvement**
- Refine schemas with follow-up prompts
- Modify generated structures easily
- Learn from AI suggestions for better data modeling

### AI Best Practices

#### Effective Prompting Tips

1. **Be Specific**: Include domain context and use case
   ```text
   ❌ "Create a user schema"
   ✅ "Create a user schema for a fitness tracking app with workout history"
   ```

2. **Mention Relationships**: Describe data connections
   ```text
   ✅ "Create an order schema that references products and customers"
   ```

3. **Include Constraints**: Specify validation rules
   ```text
   ✅ "Create a product schema with price validation and required fields"
   ```

4. **Request Examples**: Ask for sample data
   ```text
   ✅ "Generate a blog post schema with realistic example content"
   ```

#### Common Use Cases

- **Rapid Prototyping**: Quickly create API structures for new projects
- **Data Modeling**: Explore different approaches to data organization
- **Testing Scenarios**: Generate comprehensive test data structures
- **Documentation**: Create example responses for API documentation
- **Learning**: Understand best practices in API design

### AI Configuration

To enable AI features, configure your Google Gemini API key:

```env
GOOGLE_GEMINI_API_KEY="your-gemini-api-key-here"
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## 🔧 Configuration

### Authentication

- **Public Projects**: No authentication required
- **Private Projects**: Require token authentication
- **User Isolation**: Each user manages their own projects

### CORS Configuration

Configure allowed origins for cross-origin requests in your project settings.

### Response Wrappers

Customize response formats:

```json
{
  "success": true,
  "data": {...},
  "message": "Request successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 📚 API Documentation

### Project Management

- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Schema Management

- `GET /api/schema` - List project schemas
- `POST /api/schema` - Create schema
- `PUT /api/schema/:id` - Update schema
- `DELETE /api/schema/:id` - Delete schema

### Endpoint Management

- `GET /api/endpoints` - List project endpoints
- `POST /api/endpoints` - Create endpoint
- `PUT /api/endpoints/:id` - Update endpoint
- `DELETE /api/endpoints/:id` - Delete endpoint

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework used
- [Prisma](https://prisma.io) - Database ORM
- [Shadcn UI](https://ui.shadcn.com) - UI components
- [Google Gemini](https://ai.google.dev) - AI Model

## 📞 Support

- 📧 Email: [erenkuek1106@gmail.com]
- 🐛 Issues: [GitHub Issues](https://github.com/eren1106/MockA/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/eren1106/MockA/discussions)

---

Made with ❤️ by [Eren1106](https://github.com/eren1106)
