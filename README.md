# Chess Analysis App

A full-stack chess analysis web application that analyzes players' Chess.com games and provides personalized insights.

## Features

- **Authentication**: User registration and login with NextAuth.js
- **Chess.com Integration**: Fetch and store your last 100 games
- **Game Analysis**: Stockfish WASM engine analysis with move quality classification
- **Player Personas**: AI-driven insights into your playing style
- **Interactive Board**: Replay games with move-by-move analysis
- **Dark Theme**: Modern chess-inspired UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: SQLite with Prisma migrations
- **Authentication**: NextAuth.js with credentials provider
- **Chess Engine**: Stockfish.js (WASM)
- **State Management**: Zustand, React Query

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Set up database:**
   ```bash
   npx prisma migrate dev
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Usage

1. **Register/Login** at `/register` or `/login`
2. **Fetch Games** at `/games` - enter your Chess.com username
3. **Analyze Games** at `/analysis` - run Stockfish analysis on your games
4. **View Insights** - explore move quality, personas, and statistics

## Project Structure

```
app/
├── (auth)/          # Authentication pages
├── (dashboard)/     # Protected dashboard routes
├── api/             # API endpoints
└── globals.css      # Global styles

components/
├── ui/              # Reusable UI components
├── chess/           # Chess-specific components
└── charts/          # Data visualization

lib/
├── auth/            # Authentication configuration
├── chess-analysis/  # Stockfish integration
├── chess-com-api/   # Chess.com API client
└── database/        # Prisma client

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## Environment Variables

```env
DATABASE_URL="file:./chess-analysis.db"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
CHESS_COM_API_BASE="https://api.chess.com/pub"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
