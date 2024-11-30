# **Multiplayer Game Server**

This repository contains the code for a multiplayer game server built using **Node.js**, **Express**, and **Socket.IO**. The server handles real-time communication between players and can be used as part of a larger game project.

## **Features**

- Real-time multiplayer support using **Socket.IO**.
- Simple HTTP server with **Express**.
- **CORS** support for cross-origin requests.

## **Requirements**

1. **Install Node.js and npm**:
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Choose the "LTS" (Long Term Support) version
   - During installation, ensure "Add to PATH" is checked
   - After installation, restart your computer

2. **Verify Installation**:
   Open a new terminal/command prompt and run:
   ```bash
   node --version
   npm --version
   ```
   Both commands should display version numbers. If you see "command not found" or similar errors, try reinstalling Node.js.

## **Getting Started**

### **1. Clone the Repository**

First, clone the repository to your local machine:

\`\`\`bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
\`\`\`

### **2. Install Dependencies**

Install the required Node.js packages:

\`\`\`bash
npm install express socket.io cors
\`\`\`

This will install the following dependencies:

- **express**: A minimal and flexible Node.js web application framework.
- **socket.io**: A library for real-time, bidirectional communication between web clients and servers.
- **cors**: A middleware to enable Cross-Origin Resource Sharing (CORS).

### **3. Configuration**

By default, the server is configured to run on localhost at port 5000. If you want to make the server accessible on your local network, you can update the server's IP address in the code.

To allow connections from other devices on your network, replace localhost with your local IP address in the server code:

\`\`\`javascript
const server = app.listen(5000, 'your-local-ip-address', () => {
  console.log(\`Server is listening on http://your-local-ip-address:5000\`);
});
\`\`\`

### **4. Running the Server**

To start the server, run the following command:

\`\`\`bash
npm start
\`\`\`

The server will start running on the specified IP address and port. By default, it will listen on http://localhost:5000.

### **5. Accessing the Server**

If you're running the server locally, you can access it via:

- **Local Machine:** http://localhost:5000
- **Other Devices on Local Network:** http://your-local-ip-address:5000

### **6. Troubleshooting**

- **Firewall Issues:** Ensure your firewall allows incoming connections on port 5000 if you're accessing the server from other devices.
- **Port Conflicts:** If port 5000 is already in use, you can change it by modifying the port variable in the server code.

### **7. Additional Setup**

If you're using a frontend that connects to this server (e.g., a React application), make sure to update the Socket.IO connection URL in the frontend code to match the IP address and port of your server.

Example:

\`\`\`javascript
const socket = io("http://your-local-ip-address:5000");
\`\`\`
