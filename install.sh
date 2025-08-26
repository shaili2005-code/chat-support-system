#!/bin/zsh

# Create root project folder
mkdir -p chat-support-frontend
cd chat-support-frontend || exit

# Root files
touch .env package.json vite.config.js index.html

# src folder + subfolders
mkdir -p src/{services,pages,components}

# Core src files
touch src/{main.jsx,App.jsx,routes.jsx,styles.css}

# services files
touch src/services/{api.js,socket.js}

# pages files
touch src/pages/{Landing.jsx,UserChat.jsx,AgentChat.jsx}

# components files
touch src/components/{ChatHeader.jsx,MessageList.jsx,MessageInput.jsx,TypingIndicator.jsx}

echo "✅ chat-support-frontend folder structure created successfully!"

