// ======================================================
// FILE: server.js
// STYLENTRA E-COMMERCE BACKEND SERVER
// ======================================================

import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// ======================================================
// IMPORT DATABASE & SERVICES
// ======================================================

import connectDB from "./config/mongodb.js";
import { connectCloudinary } from "./config/cloudinary.js";

// ======================================================
// IMPORT ROUTES
// ======================================================

import userRoute from "./routes/userRoute.js";

// ======================================================
// APP INITIALIZATION
// ======================================================

const app = express();

// ======================================================
// REQUIRED ENVIRONMENT VARIABLES
// ======================================================

const requiredEnvVars = [
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_SECRET_KEY",
];

const missingEnvVars = requiredEnvVars.filter(
  (env) => !process.env[env]
);

if (missingEnvVars.length > 0) {
  console.error(`
==================================================
❌ Missing Environment Variables

${missingEnvVars.join("\n")}

==================================================
`);

  process.exit(1);
}

// ======================================================
// INITIALIZE DATABASE & CLOUDINARY
// ======================================================

const initializeServices = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    console.log(`
==================================================
✅ All Services Initialized Successfully
==================================================
`);
  } catch (error) {
    console.error(`
==================================================
❌ Service Initialization Failed

${error.message}

==================================================
`);

    process.exit(1);
  }
};

// ======================================================
// SECURITY MIDDLEWARE
// ======================================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS Not Allowed"));
    },
    credentials: true,
  })
);

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ======================================================
// ROOT ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    project: "Stylentra Backend",
    status: "Running 🚀",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date(),
  });
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "Healthy ✅",
    uptime: process.uptime(),
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
    timestamp: new Date(),
  });
});

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/user", userRoute);

// ======================================================
// DEMO PRODUCTS ROUTE
// (Replace with Product Route Later)
// ======================================================

app.get("/api/products", (req, res) => {
  const products = [
    {
      id: 1,
      name: "Premium Hoodie",
      category: "Men",
      price: 1999,
      stock: 15,
      rating: 4.8,
    },
    {
      id: 2,
      name: "Stylish Jacket",
      category: "Winter",
      price: 2999,
      stock: 10,
      rating: 4.7,
    },
  ];

  res.status(200).json({
    success: true,
    totalProducts: products.length,
    products,
  });
});

// ======================================================
// 404 ROUTE
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await initializeServices();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`
==================================================
🚀 STYLENTRA BACKEND STARTED

🌐 Port        : ${PORT}
🛠 Environment : ${process.env.NODE_ENV || "development"}
🔗 Local URL   : http://localhost:${PORT}

==================================================
`);
    });

    // Graceful Shutdown
    const shutdown = async () => {
      console.log("\n🛑 Shutting down server...");

      server.close(async () => {
        try {
          await mongoose.connection.close();

          console.log("✅ MongoDB Connection Closed");
          console.log("✅ Server Shutdown Completed");

          process.exit(0);
        } catch (error) {
          console.error(error.message);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error(`
==================================================
❌ Server Startup Failed

${error.message}

==================================================
`);

    process.exit(1);
  }
};

startServer();