# StrideSync

StrideSync is a fullstack fitness tracking web application built with Vue 3, TypeScript, Pinia, Vue Router, Bulma, Node.js, Express, JWT authentication, and Supabase.

The project started as a frontend-only exercise app and was converted into a fullstack app with server-side code, database storage, authentication, authorization, and centralized client-server communication.

## Features

- Login system with JWT authentication
- Admin and user roles
- Password hashing before storing credentials
- Dashboard showing activity statistics
- Add, edit, and delete activities
- Exercise type dropdown loaded from the database
- Friends management with add/remove friend functionality
- Friends feed showing activities from added friends
- Admin page to add, edit, and delete users
- Supabase PostgreSQL database integration
- Seed script for demo users, exercise types, activities, and friendships
- Centralized frontend API service for fetch requests, JWT headers, and error handling
- Responsive UI using Bulma

## Technologies Used

- Vue 3
- TypeScript
- Pinia
- Vue Router
- Bulma
- CSS
- Vite
- Node.js
- Express
- Supabase
- PostgreSQL
- JWT
- bcryptjs

## Folder Structure

```text
stride-sync/
  src/                    client/frontend Vue application
    assets/
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