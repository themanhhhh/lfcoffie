import { Router } from "express";
import { GiamHoaDonController } from "../controllers/GiamHoaDonController";

const router = Router();
const controller = new GiamHoaDonController();

router.get("/", controller.getAll.bind(controller));
router.get("/active", controller.getActiveRules.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.remove.bind(controller));

export default router;

