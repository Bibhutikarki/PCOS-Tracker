# PCOS Women Health Tracker - Frontend

A comprehensive web-based frontend for tracking PCOS-related health metrics, including menstrual cycle, symptoms, nutrition, and workouts. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **User Dashboard**: Overview of key health metrics.
- **Menstrual Cycle Tracker**: Calendar view and history log.
- **Symptom Tracker**: Log daily symptoms with severity sliders.
- **Nutrition Planner**: Plan meals and view PCOS-friendly suggestions.
- **Workout Planner**: Select routines based on condition/energy levels.
- **AI Insights**: Simulated personalized health insights.
- **Analytics**: Visual charts for cycle and symptom trends.
- **Authentication**: Simulated Login/Register flow (Frontend only).

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **React Router DOM** (Routing)
- **React Hook Form** + **Zod** (Form Validation)
- **Recharts** (Data Visualization)
- **Lucide React** (Icons)
- **Date-fns** (Date manipulation)

## Prerequisites

- Node.js (v16 or higher recommended)
- npm

## Setup & Run

1.  **Install Dependencies**
    ```bash
    cd Frontend
    npm install
    ```

2.  **Start Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

3.  **Build for Production**
    ```bash
    npm run build
    ```
    The output will be in the `dist` folder.

## Project Structure

- `src/components`: Reusable UI components (Button, Card, Input, etc.)
- `src/layout`: Global layout components (AppLayout, Sidebar).
- `src/pages`: Feature pages (Dashboard, Cycle, Symptoms, etc.).
- `src/lib`: Utilities (Auth, Types, Mock Data helpers).
- `src/routes`: Routing configuration (in App.tsx).

## Mock Authentication

- Use any email/password to "Login".
- Data is persisted in `localStorage` to simulate a real session.
- Click "Logout" in the sidebar to clear the session.
