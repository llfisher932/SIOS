import express from "express";
import { forgotPassword, resetPassword } from "../controllers/password.controller.js";
const passwordRouter = express.Router();

passwordRouter.post("/forgot", forgotPassword);
passwordRouter.post("/reset", resetPassword);

export default passwordRouter;
