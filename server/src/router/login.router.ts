import express from "express";
import { login, session } from "../controllers/account.controller.js";
const loginRouter = express.Router();

loginRouter.post("/", login);
loginRouter.get("/session", session);

export default loginRouter;
