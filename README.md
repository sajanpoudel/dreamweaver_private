# Dream Weaver

Dream Weaver is a modern web application that helps users capture, analyze, and understand their dreams using AI-powered insights. Built with Next.js, TypeScript, and Prisma, it offers a seamless experience for dream journaling and interpretation.

## Features

- 🌙 Dream Capture: Record your dreams through text input
- 🤖 AI Analysis: Get deep insights into your dreams with OpenAI-powered analysis
- 🔍 Pattern Recognition: Track recurring symbols, themes, and emotions
- 🔐 Secure Authentication: Sign in with email/password or Google
- 📱 Responsive Design: Works seamlessly on desktop and mobile devices

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or later)
- PostgreSQL
- npm or yarn

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dreamweaver.git
   cd dreamweaver
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dreamweaver?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   OPENAI_API_KEY="your-openai-api-key"
   ```

4. Set up the database:
   ```bash
   # Create and push the database schema
   npm run db:push

   # Initialize the database with seed data
   npm run db:init
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dreamweaver/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/             # Static assets
└── scripts/            # Database and utility scripts
```

## Authentication

The application supports two authentication methods:
1. Email/Password
2. Google OAuth

To set up Google authentication:
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google OAuth API
3. Create credentials (OAuth client ID)
4. Add the client ID and secret to your `.env` file

## Database Schema

The application uses PostgreSQL with Prisma as the ORM. The main models are:
- User: User accounts and authentication
- Dream: Dream records with content and metadata
- Symbol: Common dream symbols and their meanings
- Emotion: Emotional aspects of dreams
- Theme: Recurring themes in dreams

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Push to your fork: `git push origin feature/your-feature`
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
