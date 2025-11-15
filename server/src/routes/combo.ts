import { Router } from "express";
import { ComboController } from "../controllers/ComboController";

const router = Router();
const controller = new ComboController();

router.get("/", controller.getAll.bind(controller));
router.get("/active", controller.getActiveCombos.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.remove.bind(controller));

export default router;

