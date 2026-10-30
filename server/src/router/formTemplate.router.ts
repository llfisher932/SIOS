import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as formTemplateController from "../controllers/formTemplate.controller.js";

const formTemplateRouter = Router();

formTemplateRouter.use(requireAuth);
formTemplateRouter.get("/", formTemplateController.getAllFormTemplates);
formTemplateRouter.get("/manager/:id", formTemplateController.getFormTemplateData);
formTemplateRouter.post("/", formTemplateController.createFormTemplate);
formTemplateRouter.put("/manager/:id", formTemplateController.setFormTemplateData);
formTemplateRouter.delete("/:id", formTemplateController.deleteFormTemplate);

export default formTemplateRouter;