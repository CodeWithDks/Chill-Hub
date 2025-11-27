# Chill Hub

Chill Hub is a social web application designed for real-time private chat and synchronized video watching with voice chat. It allows users to connect with friends, chat in real-time, and watch videos together in sync.

## Features

- **Authentication**: Secure Signup and Login using JWT.
- **Friend System**: Send, accept, and reject friend requests. View online friends.
- **Real-Time Chat**: Private messaging with history, powered by Socket.IO.
- **Watch Together**: Create or join watch rooms to watch videos (YouTube, MP4, etc.) in sync with friends.
- **Voice Chat**: Real-time voice communication in watch rooms using WebRTC.
- **Responsive Design**: Built with Next.js, Tailwind CSS, and Shadcn/UI for a modern, responsive interface.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **State Management**: Zustand
- **Real-Time**: Socket.IO Client
- **Video Player**: ReactPlayer
- **Voice**: WebRTC (Simple Peer / Native)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Real-Time**: Socket.IO Server
- **Authentication**: JWT, Bcrypt
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd chill-hub
    ```

2.  **Setup Backend**
    ```bash
    cd server
    npm install
    cp .env.example .env
    # Update .env with your MongoDB URI and other secrets
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ../client
    npm install
    cp .env.example .env.local
    # Update .env.local with your backend URL (default: http://localhost:5000)
    npm run dev
    ```

4.  **Access the App**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

- **Frontend**: Vercel (recommended)
- **Backend**: Railway, Render, or Heroku

## License

MIT
