import { Router } from "express";
import { ThuChiController } from "../controllers/ThuChiController";

const router = Router();
const controller = new ThuChiController();

router.get("/", controller.getAll.bind(controller));
router.get("/payment-methods", controller.getPaymentMethods.bind(controller));
router.get("/:id", controller.getOne.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.remove.bind(controller));

export default router;

