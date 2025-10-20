import { Router } from "express";
import { ThongKeController } from "../controllers/ThongKeController";

const router = Router();
const controller = new ThongKeController();

router.get("/overview", controller.getOverview.bind(controller));
router.get("/top-products", controller.getTopProducts.bind(controller));
router.get("/revenue-by-channel", controller.getRevenueByChannel.bind(controller));
router.get("/revenue-by-month", controller.getRevenueByMonth.bind(controller));

export default router;

