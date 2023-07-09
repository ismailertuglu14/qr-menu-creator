import { Router } from "express";
const router = Router();

import AuthenticationRoutes from "./authentication_routes";
import PlanRoutes from "./plan_routes";
import RestaurantRoutes from "./restaurant_routes";
import MenuRoutes from "./menu_routes";
import CategoryRoutes from "./category_routes";
import ProductRoutes from "./product_routes";

router.use("/api/v1/auth", AuthenticationRoutes);
router.use("/api/v1/plan", PlanRoutes);
router.use("/api/v1/restaurant", RestaurantRoutes);
router.use("/api/v1/menu", MenuRoutes);
router.use("/api/v1/category", CategoryRoutes);
router.use("/api/v1/product", ProductRoutes);

export default router;
