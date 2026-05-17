<<<<<<< HEAD
# 🤖 Knowledge Base Chatbot — RAG-Powered AI Assistant

> **RAG (Retrieval-Augmented Generation)** technology se powered ek intelligent chatbot jo company ke internal documents, FAQs aur manuals se answers deta hai.

---

## 📁 Project Structure

```
knowledge-base-chatbot/
├── backend/                    # Node.js + Express API Server
│   ├── models/
│   │   ├── User.js             # User schema (auth)
│   │   ├── Document.js         # Document + embeddings schema
│   │   └── Query.js            # Chat history + feedback
│   ├── routes/
│   │   ├── auth.js             # Login/Register APIs
│   │   ├── documents.js        # Upload/Delete documents
│   │   ├── chat.js             # RAG chat pipeline
│   │   └── admin.js            # Analytics & admin APIs
│   ├── middleware/
│   │   └── auth.js             # JWT authentication
│   ├── utils/
│   │   ├── rag.js              # Embeddings + semantic search + GPT
│   │   └── parser.js           # PDF/DOCX/TXT parser
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Main Express server
│
└── frontend/                   # React Chat UI
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout.js       # Sidebar + navigation
    │   ├── hooks/
    │   │   └── useAuth.js      # Auth context + JWT management
    │   ├── pages/
    │   │   ├── LoginPage.js    # Login + Register UI
    │   │   ├── RegisterPage.js
    │   │   ├── ChatPage.js     # Main chat interface
    │   │   ├── DocumentsPage.js# Document upload & management
    │   │   └── AdminDashboard.js # Analytics with charts
    │   ├── styles/
    │   │   └── index.css       # Full dark theme UI
    │   ├── App.js              # Router + route protection
    │   └── index.js
    └── package.json
```

---

## ⚙️ Setup Instructions (Hindi + English)

### Step 1: Prerequisites (पहले यह install करें)

```bash
# Node.js v18+ download करें: https://nodejs.org
node --version   # v18+ होना चाहिए
npm --version

# MongoDB install करें: https://www.mongodb.com/try/download/community
# या MongoDB Atlas (cloud) use करें
```

### Step 2: Backend Setup

```bash
# Backend folder में जाएं
cd knowledge-base-chatbot/backend

# Dependencies install करें
npm install

# Environment file बनाएं
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux

# .env file में यह values set करें:
# MONGODB_URI = आपका MongoDB connection string
# OPENAI_API_KEY = आपकी OpenAI API key (https://platform.openai.com)
# JWT_SECRET = कोई भी random secret string

# Server start करें
npm run dev    # Development mode (nodemon)
# npm start   # Production mode

# ✅ Server http://localhost:5000 पर चलेगा
```

### Step 3: Frontend Setup

```bash
# नई terminal खोलें और frontend folder में जाएं
cd knowledge-base-chatbot/frontend

# Dependencies install करें
npm install

# Environment file बनाएं
copy .env.example .env.local    # Windows
# cp .env.example .env.local    # Mac/Linux

# React app start करें
npm start

# ✅ App http://localhost:3000 पर खुलेगा
```

---

## 🔑 API Keys Setup (जरूरी!)

### OpenAI API Key:
1. https://platform.openai.com/api-keys पर जाएं
2. "Create new secret key" click करें
3. Key को copy करें
4. `backend/.env` में paste करें: `OPENAI_API_KEY=sk-...`

### MongoDB:
**Option A - Local:**
```
MONGODB_URI=mongodb://localhost:27017/knowledge-base-chatbot
```
**Option B - MongoDB Atlas (Free Cloud):**
1. https://cloud.mongodb.com पर account बनाएं
2. Free cluster create करें
3. Connection string copy करें

---

## 👤 First Admin User Create करना

```bash
# Backend server चालू रखें, फिर API call करें:
# PowerShell में:
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"name":"Admin User","email":"admin@demo.com","password":"admin123","role":"admin"}'
```

या browser में http://localhost:3000/register पर जाकर register करें।

---

## 🚀 RAG Pipeline कैसे काम करता है?

```
1. Admin uploads PDF/DOCX/TXT document
       ↓
2. Document को text में convert किया जाता है
       ↓
3. Text को chunks (500 words) में split किया जाता है
       ↓
4. हर chunk का OpenAI embedding generate होता है
       ↓
5. Embeddings MongoDB में save होते हैं
       ↓
6. User question पूछता है
       ↓
7. Question का embedding generate होता है
       ↓
8. Cosine similarity से relevant chunks find होते हैं
       ↓
9. Top 5 chunks GPT-3.5 को context में दिए जाते हैं
       ↓
10. GPT natural language में answer generate करता है
       ↓
11. Answer + sources user को दिखाए जाते हैं
```

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🔐 JWT Auth | Secure login/register |
| 📄 Multi-format Upload | PDF, DOCX, TXT, MD |
| 🧠 Semantic Search | Vector embeddings-based retrieval |
| 🤖 GPT Answers | Context-aware AI responses |
| 🌐 Multi-language | English + Hindi support |
| 📊 Admin Dashboard | Charts, analytics, query history |
| 👍 Feedback System | Rate chatbot responses |
| 🔒 Role-based Access | Admin vs User permissions |

---

## 🛠️ VS Code में Terminal Commands (Windows 11)

```powershell
# Terminal 1 - Backend
cd C:\path\to\knowledge-base-chatbot\backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd C:\path\to\knowledge-base-chatbot\frontend
npm install
npm start
```

---

## 📦 ZIP बनाने के लिए (Windows 11)

```powershell
# PowerShell में चलाएं:
Compress-Archive -Path "knowledge-base-chatbot" -DestinationPath "knowledge-base-chatbot.zip"
```

---

## 🔧 Troubleshooting

**MongoDB connection error?**
→ MongoDB service start करें: `net start MongoDB`

**OpenAI API error?**
→ API key check करें और billing setup करें

**Port already in use?**
→ `set PORT=5001` करके backend restart करें

**CORS error?**
→ backend `.env` में `FRONTEND_URL=http://localhost:3000` set करें
=======
# knowledge-base-chatbot
A chatbot that answers user queries by pulling information from a company’s internal documents, FAQs, or product manuals using RAG (Retrieval-Augmented Generation).
>>>>>>> 826a32389f023a88f4c921038f03a98dba80b147

## 🎨 Project UI/UX Output

### Chat Interface
![KnowledgeBot Chat UI](images/ui-output%20(2).png)

### Login Interface
![KnowledgeBot Login UI](images/ui-output%20(3).png)
