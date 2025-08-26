# 🚀 Real-Time Chat Support System

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</p>

This is a full-stack, real-time chat support application built with a Node.js backend and a React frontend. It allows users to connect with support agents for live assistance, and it includes a full admin dashboard for managing users and agents.

---

## ✨ Key Features

### Admin Panel
* **Full User Management:** View all users (admins, agents, and users) in the system.
* **Agent Creation:** Admins can create new agent accounts directly from the dashboard.
* **Secure Access:** The dashboard is protected and only accessible to users with an 'admin' role.

### Agent Portal
* **Conversation Dashboard:** View a real-time list of all assigned conversations.
* **Live Chat Interface:** Engage in real-time messaging with users.
* **Conversation Management:** Agents can formally "Resolve" a conversation, which closes the ticket and frees them up for new users.

### User Portal
* **Secure Registration/Login:** Users can create an account and log in securely.
* **Persistent Chat History:** All conversations are saved to a MongoDB database, so a user's chat history is available when they log back in.
* **Asynchronous Messaging:** Users can send messages at any time. If an agent is unavailable, the session is queued for the next available agent.

---

## 🛠️ Tech Stack & Architecture

* **Backend:** Node.js, Express.js, Socket.io, MongoDB (with Mongoose), Winston (for logging), JWT (for authentication).
* **Frontend:** React.js, Axios.

### Folder Structure


/chat-support-system/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Handles business logic for routes
│   │   ├── middleware/    # Auth, logging, and error handling
│   │   ├── models/        # Mongoose schemas for the database
│   │   ├── routes/        # API endpoint definitions
│   │   └── utils/         # Logger and socket handler
│   ├── logs/              # Contains app.log file
│   ├── .env.example       # Template for environment variables
│   └── server.js          # Main server entry point
│
└── frontend/
├── src/
│   ├── components/    # Reusable React components
│   ├── pages/         # Page components (Login, AgentChat, etc.)
│   ├── services/      # API and socket connection logic
│   └── styles.css     # Global styles
└── .env.example       # Template for frontend environment variables


---

## 💾 Database Schema Overview

The application uses MongoDB with Mongoose to structure the data.

* **User**
    * `name`: String
    * `email`: String (unique)
    * `password`: String (hashed)
    * `role`: String (enum: 'user', 'agent', 'admin')

* **Session**
    * `userId`: ObjectId (references User)
    * `agentId`: ObjectId (references User, can be null)
    * `status`: String (enum: 'active', 'ended')

* **Message**
    * `sessionId`: ObjectId (references Session)
    * `senderId`: ObjectId (references User)
    * `senderType`: String (enum: 'user', 'agent')
    * `text`: String

---

## ⚙️ Setup & Installation

To run this project locally, please follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shaili2005-code/chat-support-system.git](https://github.com/shaili2005-code/chat-support-system.git)
    cd chat-support-system
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    ```
    * Create a `.env` file in the `/backend` directory.
    * Copy the contents of `.env.example` into your new `.env` file.
    * Fill in your own `MONGO_URI`, `JWT_SECRET`, and other variables.
    * Start the backend server:
    ```bash
    npm start
    ```

3.  **Frontend Setup:**
    ```bash
    cd ../frontend
    npm install
    ```
    * Create a `.env` file in the `/frontend` directory.
    * Add your backend API URL, for example: `VITE_API_BASE=http://localhost:5050`
    * Start the frontend development server:
    ```bash
    npm run dev
    ```

## 🚀 Usage

* **Admin:** Log in with your admin credentials to access the `/admin` dashboard. From here, you can view all users and create new agent accounts.
* **Agent:** Log in with agent credentials to access the `/agent` dashboard. You will see a list of assigned conversations and can chat with users in real-time.
* **User:** Register a new account or log in from the main page to start a conversation from the `/user` page.

---

## 👨‍💻 Author

* **Shaili Nishad**
* **GitHub:** `[@shaili2005-code](https://github.com/shaili2005-code)`