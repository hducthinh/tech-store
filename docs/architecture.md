# Software Architecture

This document describes the high-level architecture of the Tech Store system.

## 1. System Overview
The Tech Store is an e-commerce platform specializing in computer hardware, featuring an integrated PC Builder, order management, and administrative dashboard. It follows a client-server architectural model using the MERN stack.

## 2. Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT (JSON Web Tokens).

## 3. High-Level Architecture
The system consists of three main tiers:
1. **Presentation Layer (Client)**: A Single Page Application (SPA) built with React that communicates with the backend via REST APIs.
2. **Application Layer (Server)**: An Express server handling business logic, authentication, input validation, and API routing.
3. **Data Access Layer (Database)**: MongoDB for persistent data storage.

## 4. Design Patterns
- **Hybrid Feature Structure**: The frontend uses a Hybrid Feature Structure. Core infrastructural elements (`hooks`, `services`, `components/common`) reside in the root directory, while specific domain logic is isolated within `src/features/` (e.g., `admin`, `auth`, `products`, `builder`, `profile`).
- **Composition over Inheritance**: React components utilize hooks for logic reuse (`useFetchData`, `useAsync`, etc.) rather than deep nesting or inheritance.
- **Centralized Error Handling**: The backend utilizes a global error handling middleware and standard `ApiError` utility classes for predictable API responses.
