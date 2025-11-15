import { Router } from "express";
import { PhienLamViecController } from "../controllers/PhienLamViecController";

const router = Router();
const controller = new PhienLamViecController();

router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.post("/", controller.create.bind(controller));
router.post("/open-shift", controller.openShift.bind(controller));
router.post("/close-shift", controller.closeShift.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.remove.bind(controller));

export default router;

