# 🤖 Multi-Bot Voice Chat Platform

A comprehensive AI-powered voice chat platform that enables users to interact with multiple customizable chatbots through both text and voice interfaces. Built with React Native/Expo on the frontend and Node.js/Express on the backend, featuring RAG (Retrieval-Augmented Generation) capabilities powered by Google Gemini AI.

## ✨ Features

- **Multi-Bot Support**: Create and manage multiple AI chatbots with different personalities
- **Voice Interaction**: Real-time speech-to-text and text-to-speech capabilities
- **RAG Integration**: Leverage Retrieval-Augmented Generation for intelligent responses using Qdrant vector database
- **Authentication**: Secure JWT-based authentication with role-based access control (Admin/User)
- **Admin Dashboard**: Create and configure bots with custom personalities and avatar colors
- **Chat History**: Persistent message storage with full chat history retrieval
- **Cross-Platform**: Works on iOS, Android, and Web
- **Security**: Rate limiting, input validation, helmet security headers, and encrypted password storage

## 🔧 Tech Stack

### Frontend (React Native)

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Native Stack)
- **HTTP Client**: Axios
- **Audio**: Expo-Audio, Expo-Speech
- **Security**: Expo-Secure-Store, JWT-Decode
- **UI**: React Native components with custom styling

### Backend (Node.js)

- **Server**: Express.js
- **Database**: PostgreSQL
- **Vector DB**: Qdrant (for embeddings and RAG)
- **AI Model**: Google Gemini API
- **Security**: Helmet, CORS, Rate Limiting, BCryptjs
- **Authentication**: JWT (jsonwebtoken)
- **File Handling**: Multer
- **Validation**: express-validator

## 📁 Project Structure

```
Multi-Bot-Voice-Chat-Platform/
├── aiBot/                          # React Native Frontend
│   ├── assets/                     # App icons, splash screens
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js   # HTTP client configuration
│   │   ├── components/            # Reusable UI components
│   │   │   ├── BotAvatar.js
│   │   │   ├── ColorPicker.js
│   │   │   ├── InputField.js
│   │   │   ├── ListeningAnimation.js
│   │   │   ├── MessageBubble.js
│   │   │   ├── SpeakingAnimation.js
│   │   │   ├── ThinkingAnimation.js
│   │   │   └── TypingIndicator.js
│   │   ├── constants/
│   │   │   └── theme.js           # App theme and styling constants
│   │   ├── context/
│   │   │   └── AuthContext.js     # Authentication context
│   │   ├── hooks/
│   │   │   └── useApi.js          # Custom API hook
│   │   ├── navigation/            # Navigation stacks
│   │   │   ├── AdminStack.js
│   │   │   ├── AuthStack.js
│   │   │   ├── RootNavigator.js
│   │   │   └── UserStack.js
│   │   └── screens/               # Feature screens
│   │       ├── admin/
│   │       │   ├── AdminDashboardScreen.js
│   │       │   └── CreateBotScreen.js
│   │       ├── auth/
│   │       │   ├── LoginScreen.js
│   │       │   └── SignupScreen.js
│   │       └── user/
│   │           ├── BotListScreen.js
│   │           └── ChatScreen.js
│   ├── App.js
│   ├── app.json
│   ├── index.js
│   └── package.json
│
└── aiBot-Backend/                  # Node.js Backend
    ├── server/
    │   ├── config/
    │   │   ├── db.js              # Database connection
    │   │   └── env.js             # Environment variables
    │   ├── controllers/           # Business logic
    │   │   ├── auth.controller.js
    │   │   ├── bot.controller.js
    │   │   ├── chat.controller.js
    │   │   └── voice.controller.js
    │   ├── middleware/
    │   │   ├── auth.middleware.js # JWT verification
    │   │   ├── error.middleware.js
    │   │   └── role.middleware.js # Role-based access control
    │   ├── routes/                # API endpoints
    │   │   ├── auth.routes.js
    │   │   ├── bot.routes.js
    │   │   ├── chat.routes.js
    │   │   └── voice.routes.js
    │   ├── services/              # Core business services
    │   │   ├── chunking.service.js   # Text chunking for RAG
    │   │   ├── embedding.service.js  # Vector embeddings
    │   │   ├── gemini.service.js     # Google Gemini API integration
    │   │   ├── rag.service.js        # RAG pipeline
    │   │   └── vector.service.js     # Qdrant vector DB operations
    │   ├── utils/
    │   │   └── AppError.js        # Custom error class
    │   ├── index.js               # Server entry point
    │   ├── init-db.js             # Database initialization
    │   └── schema.sql             # Database schema
    ├── package.json
    └── test_new_sdk.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Google Gemini API key
- Qdrant instance (cloud or self-hosted)

### Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd aiBot-Backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables** - Create a `.env` file in `aiBot-Backend/server/`:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aibot_db
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d

   # Google Gemini
   GEMINI_API_KEY=your_gemini_api_key

   # Qdrant Vector DB
   QDRANT_URL=http://localhost:6333
   QDRANT_API_KEY=your_qdrant_key (if applicable)

   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Initialize the database:**

   ```bash
   npm run db:init
   ```

5. **Start the backend server:**

   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd aiBot
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure API endpoint** - Update `src/api/axiosInstance.js` with your backend URL:

   ```javascript
   const API_BASE_URL = "http://your-backend-url:3000/api";
   ```

4. **Start the development server:**

   ```bash
   # Start Expo development server
   npm start

   # For specific platforms
   npm run android    # Android emulator
   npm run ios        # iOS simulator
   npm run web        # Web browser
   ```

## 📡 API Endpoints

### Authentication (`/api/auth`)

- `POST /signup` - Register a new user
- `POST /login` - Login and get JWT token
- `POST /logout` - Logout (invalidate token)

### Bots (`/api/bots`)

- `GET /` - List all available bots
- `POST /` - Create a new bot (Admin only)
- `GET /:id` - Get specific bot details
- `PUT /:id` - Update bot configuration (Admin only)
- `DELETE /:id` - Delete a bot (Admin only)

### Chat (`/api/chat`)

- `POST /:botId/message` - Send message to bot
- `GET /:botId/history` - Retrieve chat history
- `DELETE /:botId/history` - Clear chat history

### Voice (`/api/voice`)

- `POST /transcribe` - Convert speech to text
- `POST /synthesize` - Convert text to speech
- `POST /:botId/voice-chat` - Send voice message to bot

## 🗄️ Database Schema

### Users Table

- Stores user accounts with email, encrypted password, and role (admin/user)

### Bots Table

- Contains bot configurations including name, personality prompt, vector namespace, and avatar color

### Chat Messages Table

- Logs all user-bot conversations with timestamps
- Supports filtering and history retrieval

## 🧠 RAG Pipeline

The platform implements a sophisticated RAG (Retrieval-Augmented Generation) system:

1. **Chunking** - Documents/knowledge base split into manageable chunks
2. **Embedding** - Chunks converted to vector embeddings via Google Gemini
3. **Storage** - Vectors stored in Qdrant for efficient similarity search
4. **Retrieval** - User queries find relevant documents using vector similarity
5. **Generation** - Relevant documents combined with query for Gemini to generate contextual responses

## 🔒 Security Features

- **Helmet.js** - HTTP header security
- **CORS** - Cross-origin request protection
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Input Validation** - All inputs validated with express-validator
- **Password Hashing** - BCryptjs for secure password storage
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin-only operations protected

## 📱 Mobile App Features

### User Flows

- **Authentication** - Login/signup with secure token storage
- **Bot Discovery** - Browse and select available bots
- **Chat Interface** - Text and voice messaging with real-time UI feedback
- **Animations** - Thinking, typing, listening, and speaking animations

### Admin Features

- **Dashboard** - Manage all bots and users
- **Bot Creation** - Create new bots with custom personalities
- **Configuration** - Set avatar colors and personality prompts

## 🛠️ Development Scripts

### Backend

```bash
npm start      # Start production server
npm run dev    # Start with live reload
npm run db:init # Initialize database
```

### Frontend

```bash
npm start      # Start Expo CLI
npm run ios    # Run on iOS simulator
npm run android # Run on Android emulator
npm run web    # Run in web browser
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Qdrant for vector database solution
- Expo for React Native tooling
- Express.js community for backend framework

## 📧 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Built with ❤️ for intelligent multi-bot conversations**
