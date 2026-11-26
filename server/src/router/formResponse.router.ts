import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as formResponseController from "../controllers/formResponse.controller.js";

const formResponseRouter = Router();

formResponseRouter.use(requireAuth);
formResponseRouter.get("/:id", formResponseController.getFormResponse);
formResponseRouter.delete("/:id", formResponseController.deleteFormResponse);

export default formResponseRouter;