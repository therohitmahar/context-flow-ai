# Context Flow AI 🧠✨

**Context Flow AI** is a visual prompt engineering platform that allows you to build complex AI workflows using a node-based interface. Instead of writing long, monolithic prompts, you can stack "Context Blocks" (Personas, Guidelines, Data) and connect them to a "Composer" to generate highly precise AI outputs.

![Landing Page Preview](https://stack-context.vercel.app/og-image.png)

## 🚀 Features

- **Visual Node Editor**: Connect multiple context blocks to a single AI composer using React Flow.
- **Context Blocks**: Modular pieces of information (Text, URLs, Files) that can be reused across different "Flows".
- **Dynamic Mentions**: Use `@node-name` in your composer to reference specific context nodes directly in your prompt.
- **Project Management**: Save and organize your workflows into different projects.
- **Smart Templates**: Pull from a library of expert-crafted context blocks like "Expert Developer" or "JSON Formatter".
- **Real-time AI**: Powered by Gemini 2.5 Flash for lightning-fast, high-context generation.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Flow Engine**: @xyflow/react (React Flow)
- **Backend/Auth**: Supabase
- **AI**: Google Gemini Pro (via Vercel Serverless Functions)
- **Deployment**: Vercel

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/therohitmahar/context-flow-ai.git
cd context-flow-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase and Gemini credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key (for local testing via proxy)
```

### 4. Run locally
```bash
npm run dev
```

## 🌐 Deployment

This project is optimized for deployment on **Vercel**. 

1. Push your code to GitHub.
2. Link your repository to a new Vercel project.
3. Add the environment variables in the Vercel Dashboard.
4. **Important**: Ensure your Supabase Auth "Site URL" matches your Vercel deployment URL.

---

Built with ❤️ by [therohitmahar](https://github.com/therohitmahar)
