import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import * as studentController from "../controllers/student.controller.js";

// On hold until the client confirms they want students created in SIOS.
// Flip to true here and in client/src/api/api.ts to turn it back on.
const STUDENT_CREATION_ENABLED = false;

const router = Router();

router.use(requireAuth);
router.get("/", studentController.searchStudents);
router.get("/:id", studentController.getStudent);
if (STUDENT_CREATION_ENABLED) router.post("/", studentController.createStudent);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);

export default router;
