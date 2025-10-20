import { Router } from "express";
import { TheBanController } from "../controllers/TheBanController";

const router = Router();
const controller = new TheBanController();

router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.remove.bind(controller));

export default router;
