# FlashLearn Project Setup Issues

## Current Issues Encountered

1. **Directory Conflict Error**
   - Error: "The directory flashcard contains files that could conflict"
   - Cause: Existing `.git` and `.qodo` directories in the workspace
   - Attempted Solution: Tried to remove directories using `rm -r -Force .git,.qodo`
   - Status: Directory removal command executed but conflicts still persist

2. **PowerShell Console Error**
   - Error: `System.ArgumentOutOfRangeException: The value must be greater than or equal to zero and less than the console's buffer size in that dimension.`
   - Cause: PowerShell console buffer size issue during command execution
   - Impact: Interrupted the Next.js project creation process

## Required Dependencies (To Be Installed)

### Core Framework & UI Library
- Next.js (v15.3.2)
- React (v18.3.1)
- React DOM (v18.3.1)
- TypeScript (v5+)

### UI Components Library (Radix UI)
- @radix-ui/react-accordion (v1.2.3)
- @radix-ui/react-alert-dialog (v1.1.6)
- @radix-ui/react-avatar (v1.1.3)
- @radix-ui/react-checkbox (v1.1.4)
- @radix-ui/react-dialog (v1.1.6)
- @radix-ui/react-dropdown-menu (v2.1.6)
- @radix-ui/react-label (v2.1.2)
- @radix-ui/react-menubar (v1.1.6)
- @radix-ui/react-popover (v1.1.6)
- @radix-ui/react-progress (v1.1.2)
- @radix-ui/react-radio-group (v1.2.3)
- @radix-ui/react-scroll-area (v1.2.3)
- @radix-ui/react-select (v2.1.6)
- @radix-ui/react-separator (v1.1.2)
- @radix-ui/react-slider (v1.2.3)
- @radix-ui/react-slot (v1.1.2)
- @radix-ui/react-switch (v1.1.3)
- @radix-ui/react-tabs (v1.1.3)
- @radix-ui/react-toast (v1.2.6)
- @radix-ui/react-tooltip (v1.1.8)

### Data Management & Form Handling
- @tanstack/react-query (v5.66.0)
- react-hook-form (v7.54.2)
- @hookform/resolvers (v4.1.3)
- zod (v3.24.2)

### Styling & UI Utilities
- tailwindcss (v3.4.1)
- tailwind-merge (v3.0.1)
- tailwindcss-animate (v1.0.7)
- class-variance-authority (v0.7.1)
- clsx (v2.1.1)
- lucide-react (v0.475.0)
- geist (v1.3.0)

### Date Handling
- date-fns (v3.6.0)
- react-day-picker (v8.10.1)

### Charts & Visualization
- recharts (v2.15.1)

### Development Utilities
- dotenv (v16.5.0)
- patch-package (v8.0.0)
- postcss (v8+)

### Dev Dependencies
- @types/node (v20+)
- @types/react (v18+)
- @types/react-dom (v18+)

## Next Steps

1. Resolve directory conflicts by either:
   - Completely cleaning the current directory
   - Creating the project in a new subdirectory

2. Once the base Next.js project is created, install all the required dependencies in the correct order:
   - Core dependencies first
   - UI components
   - Data management tools
   - Styling utilities
   - Development tools

3. Set up the project structure according to Next.js best practices

4. Configure TypeScript, ESLint, and other development tools

## Notes
- The project will use Tailwind CSS for styling
- Component-based architecture will be implemented
- The application will be a flashcard learning system 