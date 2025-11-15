import { Router } from "express";
import { GiamMonController } from "../controllers/GiamMonController";

const router = Router();
const controller = new GiamMonController();

router.get("/", controller.getAll.bind(controller));
router.get("/mon/:maMon/active", controller.getActiveRulesForMon.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.remove.bind(controller));

export default router;

