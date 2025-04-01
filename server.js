const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const helmet = require("helmet"); // Import helmet

// newly added for s3 storage
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5001;

// Use helmet middleware for security
//app.use(helmet()); //* some features of the website are not working if used

app.use(
  helmet({
    contentSecurityPolicy: false, //! Disable Content-Security-Policy (main culprit)
    //frameguard: false, // Disable X-Frame-Options
    //xssFilter: false, // Disable X-XSS-Protection
  })
);

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    // Redirect to login if the client expects HTML
    if (req.accepts("html")) {
      return res.redirect("/login");
    }
    // Otherwise, return a structured JSON error response
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Unauthorized. Please log in.",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (req.accepts("html")) {
        return res.redirect("/login");
      }
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Forbidden. Invalid or expired token.",
      });
    }
    req.user = user;
    next();
  });
};

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL || true // Allow all origins in production or specific client URL
        : ["http://localhost:3000", "http://localhost:5001"],
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
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// MongoDB Atlas connection
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://lrrecristobal:lQDnKOvj8nurk0PI@todocluster.inpor.mongodb.net/?retryWrites=true&w=majority&appName=todoCluster";
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User schema and model
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

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

// Task schema and model
const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? `${process.env.BASE_URL}/auth/google/callback`
          : "http://localhost:5001/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile Email:", profile.emails[0].value); // Debugging
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            role:
              profile.emails[0].value === "lr.jesperas@mmdc.mcl.edu.ph"
                ? "admin"
                : "user",
          }).save();
        } else if (
          profile.emails[0].value === "lr.jesperas@mmdc.mcl.edu.ph" &&
          user.role !== "admin"
        ) {
          user.role = "admin"; // Update role if it should be admin
          await user.save();
        }

        console.log("User Role After Login:", user.role); // Debugging
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (user) {
      done(null, { id: user._id, role: user.role });
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/"); // Always redirect to the to-do list first
  }
);

app.get("/protected-route", authenticateJWT, (req, res) => {
  res.json({ message: "Access granted!" });
});

app.get("/", (req, res) => {
  if (!req.user) {
    return res.redirect("/login"); // Redirect to login if not authenticated
  }
  res.sendFile(path.join(__dirname, "public", "index.html")); // Serve index.html
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/auth/logout", authenticateJWT, (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout error" });

    req.session.destroy(() => {
      res.clearCookie("token");
      res.json({ message: "Logged out successfully" });
    });
  });
});

app.get("/api/current_user", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "displayName email role"
    );
    res.json(user);
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/admin/dashboard", authenticateJWT, checkRole("admin"), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin-dashboard.html")); // Serve the admin dashboard
});

// Get all users (admin only)
app.get("/users", authenticateJWT, checkRole("admin"), async (req, res) => {
  try {
    const users = await User.find({}, "displayName email role");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
});

// Change user role (admin only)
app.patch(
  "/users/:id/role",
  authenticateJWT,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: `User role updated to ${role}`, updatedUser });
    } catch (err) {
      console.error("Error updating user role:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete user (admin only)
app.delete(
  "/users/:id",
  authenticateJWT,
  checkRole("admin"),
  async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// Routes
app.get("/tasks", authenticateJWT, async (req, res) => {
  try {
    // Regular users only see their own tasks
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/tasks/:id", authenticateJWT, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Allow only the task owner OR an admin to view it
    if (req.user.role !== "admin" && task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have access to this task" });
    }

    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/tasks", authenticateJWT, async (req, res) => {
  console.log("User in /tasks:", req.user); // Debugging

  try {
    const task = new Task({
      text: req.body.text,
      completed: req.body.completed || false,
      userId: req.user.id,
      lastUpdated: new Date(),
    });
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(400).json({ message: err.message });
  }
});
app.delete("/tasks/:id", authenticateJWT, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Forbidden: Not allowed to delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: err.message });
  }
});

app.patch("/tasks/:id", authenticateJWT, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        text: req.body.text,
        completed: req.body.completed,
        lastUpdated: new Date(), // Update the last updated timestamp
      },
      { new: true } // Return the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask); // Send back the updated task
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).json({ message: err.message });
  }
});

// In server.js - replace your current /images endpoint with this
app.get("/images", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // Option 1: Define a set of predefined images
    // This avoids S3 listing operations completely
    const predefinedImages = [
      `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/bg1.png`,
      `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/bg2.png`,
      `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/bg3.png`,
      `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/bg4.png`,
      `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/bg5.png`,
      // Add more images as needed
    ];

    res.status(200).json(predefinedImages);

    // Option 2 (alternative): If you store image references in your database
    // const user = await User.findById(userId);
    // const imageUrls = user.backgroundImages || [];
    // res.status(200).json(imageUrls);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Error fetching images" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
