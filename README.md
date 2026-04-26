# Web Server Programming — Final Project

This repository contains my coursework and final project for the Web Server Programming course.

## Folder Structure

- `no-framework/` — assignments completed before starting Node.js
  - `assignment-1/` — AI-generated 5-file website
  - `assignment-2.1/` — 5-file fitness website
  - `assignment-2.2-menu-cloning/` — menu cloning assignment based on the reference website
  - `assignment-3-bulma/` — Bulma-based recreation of the reference Todo website

- `stride-sync/` — final fullstack project
  - `src/` — client/frontend code built with Vue, TypeScript, Pinia, Vue Router, Bulma, and Vite
  - `server/` — backend/server-side code built with Node.js, Express, JWT authentication, and Supabase

## Final Project: StrideSync

**StrideSync** is a fullstack fitness tracking web application. The project started as a frontend-only Vue application and was converted into a fullstack application with a Node/Express backend and Supabase database.

Users can log in, manage their own activities, view dashboard statistics, add/remove friends, and view activity updates from friends. Admin users can also manage users and exercise types.

## Main Features

- User login with JWT authentication
- Password hashing before storing user credentials
- Role-based authorization for admin-only pages
- Activity CRUD for logged-in users
- Exercise type management
- Dashboard summary with total activities, duration, calories, and most frequent activity
- Friends feed showing activities from added friends
- Admin user management
- Supabase PostgreSQL database integration
- Seed script for starter demo data
- Centralized frontend API service for server communication
- Environment variable support for local and hosted deployment

## Technologies Used

- HTML
- CSS
- JavaScript
- TypeScript
- Vue 3
- Pinia
- Vue Router
- Bulma
- Vite
- Node.js
- Express
- Supabase
- PostgreSQL
- JWT
- bcryptjs

## Project Structure

Inside `stride-sync/`:

```text
stride-sync/
  src/                    client/frontend Vue application
    components/
    router/
    services/
    stores/
    types/
    views/
    App.vue
    main.ts

  server/                 backend Express/Supabase application
    controllers/
    db/
    models/
    tools/
    types/
    index.ts