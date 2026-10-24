import express from "express";
import { login, logout, session } from "../controllers/account.controller.js";
const loginRouter = express.Router();

loginRouter.post("/", login);
loginRouter.get("/session", session);
loginRouter.post("/logout", logout);

export default loginRouter;
