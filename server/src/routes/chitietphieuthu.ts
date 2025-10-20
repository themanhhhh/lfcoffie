import { Router } from "express";
import { ChiTietPhieuThuController } from "../controllers/ChiTietPhieuThuController";

const router = Router();
const controller = new ChiTietPhieuThuController();

router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.remove.bind(controller));

export default router;
