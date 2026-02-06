# VisionHub

A modern, AI-powered calendar and event management application built with React and TypeScript. VisionHub helps you organize your schedule with intelligent features and a beautiful glass-morphism UI.

## Features

- **Multiple Views** - Switch between Month, Week, and Day views for flexible scheduling
- **AI-Powered Suggestions** - Integrated with Google Gemini for smart event recommendations
- **Event Management** - Create, edit, and delete events with rich details
- **Event Filtering** - Filter events by category, date range, and more
- **Import/Export** - Easily backup and restore your calendar data
- **Keyboard Shortcuts** - Navigate quickly with keyboard shortcuts
- **Undo/Redo** - Never lose your changes with full undo/redo support
- **Notifications** - Get reminders for upcoming events
- **Admin Panel** - Manage settings and configurations
- **Dark/Light Themes** - Beautiful glass-morphism design with theme support

## Tech Stack

- **React** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Google Gemini** - AI integration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/samarthrao34/VisionHub.git
   cd VisionHub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts |
| `N` | Create new event |
| `T` | Go to today |
| `←` / `→` | Navigate dates |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

## License

MIT License - feel free to use this project for personal or commercial purposes.
