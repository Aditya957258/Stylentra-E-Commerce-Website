// ======================================================
// FILE: config/mongodb.js
// STYLENTRA MONGODB CONFIGURATION
// ======================================================

import mongoose from "mongoose";

// ======================================================
// MONGODB CONNECTION
// ======================================================

const connectDB = async () => {
    try {
        // =====================================
        // MONGOOSE SETTINGS
        // =====================================

        mongoose.set("strictQuery", true);

        // =====================================
        // REGISTER EVENTS (ONLY ONCE)
        // =====================================

        if (mongoose.connection.listeners("connected").length === 0) {

            mongoose.connection.on("connected", () => {
                console.log(`
==================================================
✅ MongoDB Connected Successfully
==================================================
Database : ${mongoose.connection.name}
Host     : ${mongoose.connection.host}
==================================================
`);
            });

            mongoose.connection.on("error", (error) => {
                console.error(`
==================================================
❌ MongoDB Connection Error
==================================================
${error.message}
==================================================
`);
            });

            mongoose.connection.on("disconnected", () => {
                console.log(`
==================================================
⚠️ MongoDB Disconnected
==================================================
`);
            });
        }

        // =====================================
        // CONNECT TO DATABASE
        // =====================================

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "stylentra", // Remove this if your Atlas URI already contains /stylentra
            autoIndex: process.env.NODE_ENV !== "production",
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        return mongoose.connection;

    } catch (error) {

        console.error(`
==================================================
❌ DATABASE CONNECTION FAILED
==================================================
${error.message}
==================================================
`);

        process.exit(1);
    }
};

export default connectDB;