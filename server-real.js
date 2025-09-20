const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
const envResult = dotenv.config();
if (envResult.error) {
  console.error("❌ Error loading .env file:", envResult.error);
} else {
  console.log("✅ .env file loaded successfully");
}

// Debug environment variables
console.log("🔍 Environment Debug:");
console.log("   GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : "MISSING");
console.log("   GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? `${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...` : "MISSING");
console.log("   JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");

const app = express();
const port = process.env.PORT || 5001;

// In-memory storage (will replace with MongoDB later)
let users = [];
let tasks = [];

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
    secret: process.env.SESSION_SECRET || "your_secret_key",
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
app.use(passport.initialize());
app.use(passport.session());

console.log("✅ Real TDL Application Starting...");
console.log("🔐 Google OAuth Enabled");
console.log("💾 Using in-memory storage (will add MongoDB later)");

// Authentication middleware
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Role-based access control
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
                <a href="/" class="bg-blue-500 hover:opacity-80 text-white py-2 px-4 rounded">Return Home</a>
            </div>
        </body>
        </html>
      `);
    }
    return res.status(403).json({ message: "Forbidden: You do not have permission" });
  }
  next();
};

// Passport Google OAuth configuration
console.log("🔧 Configuring Google OAuth Strategy...");
console.log("   Client ID:", process.env.GOOGLE_CLIENT_ID ? "Present" : "MISSING");
console.log("   Client Secret:", process.env.GOOGLE_CLIENT_SECRET ? "Present" : "MISSING");

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ CRITICAL: Google OAuth credentials are missing!");
  console.error("   Make sure .env file contains GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google OAuth Success!");
        console.log("   Profile ID:", profile.id);
        console.log("   Display Name:", profile.displayName);
        console.log("   Email:", profile.emails[0].value);
        console.log("   Access Token:", accessToken ? "Received" : "Missing");
        
        let user = users.find(u => u.googleId === profile.id);

        if (!user) {
          // Create new user
          user = {
            id: Date.now().toString(),
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            role: profile.emails[0].value === "admin@example.com" ? "admin" : "user"
          };
          users.push(user);
          console.log("✅ New user created:", user.displayName, `(${user.role})`);
        } else {
          console.log("✅ Existing user logged in:", user.displayName, `(${user.role})`);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Google OAuth Strategy Error:", error);
        console.error("   Error details:", error.message);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = users.find(u => u.id === id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/admin", authenticateJWT, checkRole("admin"), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
});

// Google OAuth Routes
app.get(
  "/auth/google",
  (req, res, next) => {
    console.log("🔗 Initiating Google OAuth...");
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("📥 Google callback received");
    console.log("Query params:", req.query);
    next();
  },
  passport.authenticate("google", { 
    failureRedirect: "/login",
    failureMessage: true 
  }),
  (req, res) => {
    try {
      console.log("✅ Authentication successful for:", req.user.displayName);
      
      const token = jwt.sign(
        { id: req.user.id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
      });

      console.log("🎉 User authenticated:", req.user.displayName);
      res.redirect("/");
    } catch (error) {
      console.error("❌ Error in callback:", error);
      res.redirect("/login?error=auth_failed");
    }
  }
);

// API Routes

// Get current user info
app.get("/api/current_user", authenticateJWT, (req, res) => {
  res.json({
    _id: req.user.id,
    id: req.user.id,
    displayName: req.user.displayName,
    email: req.user.email,
    role: req.user.role,
  });
});

// Alternative endpoint for user info
app.get("/api/user", authenticateJWT, (req, res) => {
  res.json({
    _id: req.user.id,
    id: req.user.id,
    displayName: req.user.displayName,
    email: req.user.email,
    role: req.user.role,
  });
});

// Get tasks for current user
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
    _id: Date.now().toString(),
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    lastUpdated: new Date(),
    userId: req.user.id,
  };

  tasks.push(newTask);
  console.log("📝 Task added:", newTask.text, "by", req.user.displayName);
  res.status(201).json(newTask);
});

// Update a task
app.put("/api/tasks/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;

  const taskIndex = tasks.findIndex(task => (task.id === id || task._id === id) && task.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Update task properties
  if (text !== undefined) tasks[taskIndex].text = text;
  if (completed !== undefined) tasks[taskIndex].completed = completed;
  tasks[taskIndex].lastUpdated = new Date();

  console.log("📝 Task updated:", tasks[taskIndex].text, "by", req.user.displayName);
  res.json(tasks[taskIndex]);
});

// Delete a task
app.delete("/api/tasks/:id", authenticateJWT, (req, res) => {
  const { id } = req.params;
  
  const taskIndex = tasks.findIndex(task => (task.id === id || task._id === id) && task.userId === req.user.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  console.log("🗑️ Task deleted:", deletedTask.text, "by", req.user.displayName);
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
  
  const taskIndex = tasks.findIndex(task => task.id === id || task._id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  console.log("🗑️ Admin deleted task:", deletedTask.text);
  res.json({ message: "Task deleted successfully" });
});

// Logout routes
app.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });
  req.logout((err) => {
    if (err) console.error("Logout error:", err);
  });
  res.json({ message: "Logged out successfully" });
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });
  req.logout((err) => {
    if (err) console.error("Logout error:", err);
  });
  res.json({ message: "Logged out successfully" });
});

// Test endpoint to verify OAuth config
app.get("/test-oauth", (req, res) => {
  res.json({
    message: "OAuth Test Endpoint",
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID ? "Configured" : "Missing",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Configured" : "Missing",
      callbackURL: "/auth/google/callback",
      fullCallbackURL: `http://localhost:${port}/auth/google/callback`
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 TDL Real Application running on port ${port}`);
  console.log(`🌐 Open your browser to: http://localhost:${port}`);
  console.log(`🔑 Login page: http://localhost:${port}/login`);
  console.log(`👑 Admin dashboard: http://localhost:${port}/admin`);
  console.log(`🧪 Test OAuth: http://localhost:${port}/test-oauth`);
  console.log("");
  console.log("📋 Configuration:");
  console.log(`   Google Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`   JWT Secret: ${process.env.JWT_SECRET ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`   Callback URL: http://localhost:${port}/auth/google/callback`);
  console.log("");
});
