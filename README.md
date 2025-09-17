# 🚀 HumaGPT - AI-Powered Freelancer Search

A modern **AI-powered freelancer matching platform** built with **Next.js, TypeScript, Tailwind CSS, Supabase, and OpenAI**.  

This application demonstrates **semantic search with pgvector embeddings**, **natural language processing**, and **production-ready architecture** for matching clients with freelancers using advanced search capabilities.

---

![HumaGPT Screenshot](https://github.com/devmarked/humagpt/blob/main/public/images/huma.png)

---
## ✨ Features

### 🔍 AI-Powered Search
- **Semantic Search** – Natural language freelancer search using OpenAI embeddings (text-embedding-3-small)
- **Vector Similarity** – pgvector with cosine similarity for finding the best matches
- **Hybrid Search** – Combines vector embeddings with PostgreSQL full-text search
- **Smart Filtering** – Advanced filters by specialization, experience, rate, location

### 🛠 Technical Excellence
- **Modern Stack** – Next.js 15 App Router, TypeScript, Tailwind CSS
- **Production Database** – Supabase with PostgreSQL 16 + pgvector extension
- **Authentication** – Secure auth flow with Row Level Security (RLS)
- **Server Components** – Optimized with Server Actions and minimal client-side code
- **Type Safety** – End-to-end TypeScript with comprehensive interfaces

### 🎨 User Experience
- **Responsive Design** – Mobile-first layouts with Tailwind CSS
- **Beautiful UI** – shadcn/ui components with smooth animations
- **Real-time Results** – Fast search with optimized database queries
- **Smart Suggestions** – Example queries to help users get started  

---

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI + layout components
│   ├── ui/             # Base UI elements (buttons, inputs, etc.)
│   └── layout/         # Header, sidebar, dashboard shells
├── lib/                # Utilities & config (db, api, helpers)
├── hooks/              # Custom React hooks
├── types/              # Global TS types
└── styles/             # Tailwind and global styles
```

---

## 🧰 Tech Stack

### Core Framework
- **Next.js 15** (App Router) with TypeScript
- **React 19** with Server Components
- **Tailwind CSS** for styling

### Database & Search
- **Supabase** (PostgreSQL 16 + Authentication)
- **pgvector** extension for vector similarity search
- **OpenAI** text-embedding-3-small (1536 dimensions)
- **Full-text search** with PostgreSQL tsvector

### UI & UX
- **shadcn/ui** components with Radix UI primitives
- **Lucide React** icons
- **Framer Motion** animations
- **Responsive design** (mobile-first)

### Architecture
- **Server Actions** for data mutations
- **Row Level Security** (RLS) for data protection
- **TypeScript** end-to-end type safety
- **Production-ready** defaults and security  

---

## 📜 Scripts

- `npm run dev` – Start development server
- `npm run build` – Production build  
- `npm run start` – Start production server  
- `npm run lint` – Lint code  
- `npm run type-check` – TypeScript type checks
- `node scripts/generate-sample-embeddings.js` – Test embedding generation

---

## 🔍 Key Features Showcase

### Natural Language Search
```
"React developer with TypeScript experience"
"UI/UX designer for mobile app"  
"Python developer for machine learning project"
"Full-stack developer with Node.js skills"
```

### Advanced Filtering
- **Specializations**: 20+ categories from web dev to blockchain
- **Experience Levels**: Entry, Intermediate, Expert
- **Hourly Rates**: Flexible min/max rate filtering
- **Location**: Support for remote and location-based search

### AI-Powered Matching
- **Semantic Understanding**: Finds relevant freelancers even with different terminology
- **Similarity Scoring**: Shows match confidence percentages
- **Hybrid Results**: Combines vector similarity with traditional text search
- **Fast Performance**: Optimized with HNSW indexing for sub-second results

---

## 📄 License

This project is licensed under the **MIT License**.  
