# FlashLearn

A modern flashcard application built with Next.js to help students learn and memorize information effectively.

## Features

- Interactive flashcards
- Learning mode
- Dark/Light mode support
- Responsive design

## Technologies Used

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Query

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Arnold-Dsouza/flashcard-viewer.git
   cd flashlearn
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Project Structure

```
src/
  ├── ai/ - AI service integration
  ├── app/ - Next.js app router pages
  ├── components/ - React components
  │    └── ui/ - UI components
  ├── hooks/ - Custom React hooks
  ├── lib/ - Utility functions
  └── types/ - TypeScript type definitions
```

## License

[MIT](LICENSE)