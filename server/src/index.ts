import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "./middleware/middleware.js";
import loginRouter from "./router/login.router.js";
import passwordRouter from "./router/password.router.js";
import profileRouter from "./router/profile.router.js";
import formTemplateRouter from "./router/formTemplate.router.js"
import formResponseRouter from "./router/formResponse.router.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: true, // Accept all origins
    credentials: true, // allow the session cookie
  }),
);

app.use(express.json());
app.use(cookieParser());

// Matches the /api/* rewrite in vercel.json.
const api = express.Router();
api.use("/login", loginRouter);
api.use("/password", passwordRouter);
api.use("/profiles", profileRouter);
api.use("/formTemplates", formTemplateRouter);
api.use("/formResponse", formResponseRouter);
app.use("/api", api);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
