# Web Application

Next.js application with TypeScript and Tailwind CSS.

## Getting Started

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

### Build

Build the application for production:

```bash
npm run build
```

### Start Production Server

Start the production server:

```bash
npm run start
```

### Lint

Run ESLint:

```bash
npm run lint
```

### Type Check

Check TypeScript types:

```bash
npm run check-types
```

## Project Structure

```
apps/web/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles with Tailwind
├── public/           # Static assets
├── tailwind.config.ts # Tailwind configuration
├── postcss.config.js  # PostCSS configuration
└── package.json      # Dependencies and scripts
```

## Tailwind CSS

This project uses Tailwind CSS for styling. You can use Tailwind utility classes directly in your components.

Example:

```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">Hello Tailwind!</div>
```
