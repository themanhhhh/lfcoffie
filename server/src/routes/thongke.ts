import { Router } from "express";
import { ThongKeController } from "../controllers/ThongKeController";

const router = Router();
const controller = new ThongKeController();

router.get("/overview", controller.getOverview.bind(controller));
router.get("/top-products", controller.getTopProducts.bind(controller));
router.get("/revenue-by-channel", controller.getRevenueByChannel.bind(controller));
router.get("/revenue-by-month", controller.getRevenueByMonth.bind(controller));
router.get("/shift-closing/:maPhienLamViec", controller.getShiftClosingReport.bind(controller));
router.get("/compare-yesterday", controller.compareRevenueWithYesterday.bind(controller));
router.get("/7days-report", controller.get7DaysReport.bind(controller));
router.get("/revenue-by-day", controller.getRevenueByDay.bind(controller));
router.get("/top-10-products", controller.getTop10Products.bind(controller));
router.get("/top-5-categories", controller.getTop5Categories.bind(controller));
router.get("/category-stats", controller.getCategoryStats.bind(controller));
router.get("/business-report", controller.getBusinessReport.bind(controller));

export default router;

