import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "./middleware/middleware.js";
import loginRouter from "./router/login.router.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: true, // Accept all origins
    credentials: true, // Lets the browser store the session cookie from cross-origin requests
  }),
);

app.use(express.json());
app.use(cookieParser());

// Everything lives under /api: on Vercel, the /api/* rewrite forwards the full path unchanged.
const api = express.Router();
api.use("/login", loginRouter);
app.use("/api", api);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
