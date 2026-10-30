import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as profileController from "../controllers/profile.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/me", profileController.getOwnProfile);
router.get("/", profileController.searchProfiles);
router.get("/:id", profileController.getProfile);
router.post("/:id/deactivate", profileController.deactivateProfile);

export default router;
