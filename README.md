# Network Planner

This repository contains the source code for the Network Planner application, featuring a React frontend, Node.js/Express backend, and React Native mobile app.

## Project Structure

- **root** (`/`): Frontend application (React + Vite)
- **backend** (`/backend`): REST API (Node.js + Express + MongoDB)
- **mobile** (`/mobile`): Mobile application (React Native + Expo)

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker & Docker Compose](https://www.docker.com/) (for running the local database)
- [Git](https://git-scm.com/)

## Getting Started

Follow these steps to set up the development environment.

### 1. Database Setup

Start the local MongoDB instance using Docker. This will spin up a MongoDB container on port `27017`.

```bash
docker-compose up -d
```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `backend` directory with the following content (adjusted for the local Docker setup):
   
   ```env
   PORT=5000
   MONGO_URI=mongodb://admin:password@localhost:27017/network-planner?authSource=admin
   JWT_SECRET=your_development_secret_key
   ```
   
   > **Note:** The `MONGO_URI` matches the credentials defined in `docker-compose.yml`.

4. Start the backend server:
   ```bash
   # Using nodemon for auto-reloading during development
   npx nodemon server.js
   
   # Or using node directly
   node server.js
   ```
   
   The server will start on `http://localhost:5000`.

### 3. Frontend Setup

1. Open a new terminal and navigate to the project root directory:
   ```bash
   # If you are in the backend directory
   cd ..
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### 4. Mobile Setup (Optional)

1. Open a new terminal and navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

   - Press `a` to run on Android Emulator.
   - Press `i` to run on iOS Simulator.
   - Scan the QR code with the Expo Go app on your physical device.

   > **Note:** If testing on a physical device, ensure it's on the same Wi-Fi network as your computer. You may need to update the API base URL in the mobile app to use your computer's local IP address instead of `localhost`.

## Development Notes

- **Backend Port:** 5000
- **Frontend Port:** 5173 (Vite default)
- **Database Port:** 27017

If you encounter issues with API calls from the frontend, ensure the backend is running and reachable at `http://localhost:5000`.
