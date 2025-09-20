const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

// In-memory storage (replaces MongoDB)
let users = [
  {
    id: '1',
    _id: '1', // Add MongoDB-style _id for compatibility
    googleId: 'demo-user',
    displayName: 'Demo User',
    email: 'demo@example.com',
    role: 'user'
  },
  {
    id: '2',
    _id: '2', // Add MongoDB-style _id for compatibility
    googleId: 'demo-admin',
    displayName: 'Demo Admin',
    email: 'admin@example.com',
    role: 'admin'
  }
];

let tasks = [
  {
    id: '1',
    text: 'Welcome to your Todo List!',
    completed: false,
    lastUpdated: new Date(),
    userId: '1'
  },
  {
    id: '2',
    text: 'Add your first task',
    completed: false,
    lastUpdated: new Date(),
    userId: '1'
  },
  {
    id: '3',
    text: 'Mark tasks as complete',
    completed: true,
    lastUpdated: new Date(),
    userId: '1'
  }
];

let currentUser = users[0]; // Default logged-in user for demo

// Use helmet middleware for security
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5001"],
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "demo_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "Lax",
    },
  })
);
app.use(cookieParser());

console.log("✅ In-memory database initialized successfully!");
console.log("📝 Demo data loaded:");
console.log(`   - ${users.length} demo users`);
console.log(`   - ${tasks.length} demo tasks`);

// Simple authentication middleware (checks for valid token)
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "demo_jwt_secret");
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid token. User not found." });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// Middleware to auto-login demo user for main routes
const autoLoginDemo = (req, res, next) => {
  // Set a demo token cookie if none exists
  if (!req.cookies.token) {
    const token = jwt.sign(
      { 
        id: currentUser.id, 
        email: currentUser.email, 
        role: currentUser.role 
      },
      process.env.JWT_SECRET || "demo_jwt_secret",
      { expiresIn: "24h" }
    );
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "Lax",
    });
  }
  next();
};

const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    if (req.accepts("html")) {
      return res.status(403).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Access Denied</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-900 text-white flex justify-center items-center min-h-screen">
                <div class="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg text-center">
                    <h1 class="text-3xl font-bold mb-4">Access Denied</h1>
                    <p class="mb-6">You do not have permission to view this page.</p>
                    <p class="mb-4 text-sm text-gray-400">Demo Mode: Switch to admin user to access admin features</p>
                    <a href="/" class="bg-blue-500 hover:opacity-80 text-white py-2 px-4 rounded">Return</a>
                </div>
            </body>
            </html>
        `);
    }
    return res
      .status(403)
      .json({ message: "Forbidden: You do not have permission" });
  }
  next();
};

// Demo authentication routes
app.post("/demo-login", (req, res) => {
  const { userType } = req.body;
  
  if (userType === 'admin') {
    currentUser = users[1]; // Demo admin
  } else {
    currentUser = users[0]; // Demo user
  }
  
  const token = jwt.sign(
    { 
      id: currentUser.id, 
      email: currentUser.email, 
      role: currentUser.role 
    },
    process.env.JWT_SECRET || "demo_jwt_secret",
    { expiresIn: "24h" }
  );
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "Lax",
  });
  
  res.json({ 
    success: true, 
    user: {
      displayName: currentUser.displayName,
      email: currentUser.email,
      role: currentUser.role
    }
  });
});

// Routes
app.get("/", autoLoginDemo, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/admin", authenticateJWT, checkRole("admin"), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
});

// API Routes

// Get user info
app.get("/api/user", authenticateJWT, (req, res) => {
  res.json({
    _id: req.user._id,
    id: req.user.id,
    displayName: req.user.displayName,
    email: req.user.email,
    role: req.user.role,
  });
});

// Alternative endpoint for current user (used by frontend)
app.get("/api/current_user", authenticateJWT, (req, res) => {
  res.json({
    _id: req.user._id,
    id: req.user.id,
    displayName: req.user.displayName,
    email: req.user.email,
    role: req.user.role,
  });
});

// Get tasks for the current user
app.get("/api/tasks", authenticateJWT, (req, res) => {
  const userTasks = tasks.filter(task => task.userId === req.user.id);
  res.json(userTasks);
});

// Add a new task
app.post("/api/tasks", authenticateJWT, (req, res) => {
  const { text } = req.body;
  
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Task text is required" });
  }

  const newTask = {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    lastUpdated: new Date(),
    userId: req.user.id,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update a task
app.put("/api/tasks/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  const taskIndex = tasks.findIndex(task => task.id === id && task.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Update task properties
  if (text !== undefined) tasks[taskIndex].text = text;
  if (completed !== undefined) tasks[taskIndex].completed = completed;
  tasks[taskIndex].lastUpdated = new Date();

  res.json(tasks[taskIndex]);
});

// Delete a task
app.delete("/api/tasks/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;
  
  const taskIndex = tasks.findIndex(task => task.id === id && task.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(taskIndex, 1);
  res.json({ message: "Task deleted successfully" });
});

// Admin routes

// Get all users (admin only)
app.get("/api/admin/users", authenticateJWT, checkRole("admin"), (req, res) => {
  res.json(users);
});

// Get all tasks (admin only)
app.get("/api/admin/tasks", authenticateJWT, checkRole("admin"), (req, res) => {
  const tasksWithUsers = tasks.map(task => {
    const user = users.find(u => u.id === task.userId);
    return {
      ...task,
      userName: user ? user.displayName : 'Unknown User'
    };
  });
  res.json(tasksWithUsers);
});

// Delete any task (admin only)
app.delete("/api/admin/tasks/:id", authenticateJWT, checkRole("admin"), (req, res) => {
  const { id } = req.params;
  
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(taskIndex, 1);
  res.json({ message: "Task deleted successfully" });
});

// Logout routes (multiple endpoints for compatibility)
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });
  res.json({ message: "Logged out successfully" });
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });
  res.json({ message: "Logged out successfully" });
});

// Demo info endpoint
app.get("/api/demo-info", (req, res) => {
  res.json({
    message: "🎯 Demo Mode Active",
    features: [
      "✅ View and manage todo tasks",
      "✅ Mark tasks as complete/incomplete", 
      "✅ Add and delete tasks",
      "✅ Admin dashboard (switch to admin user)",
      "✅ User role management",
      "✅ Responsive design"
    ],
    users: [
      { type: "user", name: "Demo User", email: "demo@example.com" },
      { type: "admin", name: "Demo Admin", email: "admin@example.com" }
    ],
    note: "All data is stored in memory and will reset when server restarts"
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🌐 Open your browser to: http://localhost:${port}`);
  console.log(`🎮 Demo Mode: No database required!`);
  console.log(`👤 Current user: ${currentUser.displayName} (${currentUser.role})`);
});
