import { Router } from "express";
const router = Router();

import AuthenticationRoutes from "../authentication/authentication_routes";
import PlanRoutes from "../plan/plan_routes";
import RestaurantRoutes from "../restaurant/restaurant_routes";
import MenuRoutes from "../menu/menu_routes";
import CategoryRoutes from "../category/category_routes";
import ProductRoutes from "../product/product_routes";

router.use("/auth", AuthenticationRoutes);
router.use("/plan", PlanRoutes);
router.use("/restaurant", RestaurantRoutes);
router.use("/menu", MenuRoutes);
router.use("/category", CategoryRoutes);
router.use("/product", ProductRoutes);

export default router;
