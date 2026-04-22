import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./utils/db.js";
import redis from "./utils/redis.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import savedJobRoute from "./routes/savedJob.route.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

const toOrigin = (value) => {
    if (!value) return "";
    const trimmed = String(value).trim();
    if (!trimmed) return "";
    try {
        return new URL(trimmed).origin;
    } catch {
        return trimmed.replace(/\/+$/, "");
    }
};

const rawAllowedOriginValues = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_PREVIEW_URL,
]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim())
    .filter(Boolean);

const exactAllowedOrigins = new Set(
    rawAllowedOriginValues
        .filter((value) => !value.includes("*"))
        .map((value) => toOrigin(value))
        .filter(Boolean)
);

const wildcardAllowedOriginRegex = rawAllowedOriginValues
    .filter((value) => value.includes("*"))
    .map((value) => {
        const normalized = toOrigin(value);
        const escaped = normalized.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
        return new RegExp(`^${escaped}$`, "i");
    });

// Allow frontend from configured origins and localhost during development.
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // allow curl/postman or same-origin

        try {
            const normalizedOrigin = toOrigin(origin);
            const url = new URL(normalizedOrigin);

            if (url.hostname === 'localhost') return callback(null, true);
            if (exactAllowedOrigins.has(normalizedOrigin)) return callback(null, true);
            if (wildcardAllowedOriginRegex.some((regex) => regex.test(normalizedOrigin))) return callback(null, true);
        } catch (e) {}

        console.log("CORS BLOCKED ORIGIN:", origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

app.use(cors(corsOptions));

const PORT = Number(process.env.PORT) || 3000;


// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/user", savedJobRoute);



if (globalThis.__server) {
    try { globalThis.__server.close(); } catch (e) {}
}

const startServer = () => {
    const server = app.listen(PORT, () => {
        connectDB();
        redis.init().catch((error) => {
            console.error("Redis init failed:", error?.message || error);
        });
        console.log(`Server running at port ${PORT}`);
    });

    server.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} in use. Attempting ${PORT + 1}`);
            const alt = PORT + 1;
            try { server.close(); } catch (e) {}
            app.listen(alt, () => {
                connectDB();
                console.log(`Server running at port ${alt}`);
            });
        } else {
            console.error('Server error:', err);
        }
    });

    globalThis.__server = server;
};

startServer();