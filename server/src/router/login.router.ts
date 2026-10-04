import express from "express";
import { login } from "../controllers/account.controller.js";
const loginRouter = express.Router();

loginRouter.post("/", login);

export default loginRouter;
