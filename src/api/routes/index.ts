import { Router } from "express";
const router = Router();

import AuthenticationRoutes from "../../api/routes/authentication_routes";
import PlanRoutes from "../../api/routes/plan_routes";
import RestaurantRoutes from "../../api/routes/restaurant_routes";
import MenuRoutes from "../../api/routes/menu_routes";
import CategoryRoutes from "../../api/routes/category_routes";
import ProductRoutes from "../../api/routes/product_routes";

router.use("/api/v1/auth", AuthenticationRoutes);
router.use("/api/v1/plan", PlanRoutes);
router.use("/api/v1/restaurant", RestaurantRoutes);
router.use("/api/v1/menu", MenuRoutes);
router.use("/api/v1/category", CategoryRoutes);
router.use("/api/v1/product", ProductRoutes);

export default router;
