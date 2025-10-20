import { Router } from "express";
import { ChiTietPhieuNhapController } from "../controllers/ChiTietPhieuNhapController";

const router = Router();
const controller = new ChiTietPhieuNhapController();

router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.remove.bind(controller));

export default router;
