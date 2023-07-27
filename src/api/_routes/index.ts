import { Router } from "express";

const router = Router();

import AuthenticationRoutes from "../authentication/authentication_routes";
import PlanRoutes from "../plan/plan_routes";
import RestaurantRoutes from "../restaurant/restaurant_routes";
import MenuRoutes from "../menu/menu_routes";
import CategoryRoutes from "../category/category_routes";
import ProductRoutes from "../product/product_routes";
import PurchaseRoutes from "../purchase/purchase_routes";
import LocationRoutes from "../location/location_routes";

router.use("/v1/auth", AuthenticationRoutes);
router.use("/v1/plan", PlanRoutes);
router.use("/v1/restaurant", RestaurantRoutes);
router.use("/v1/menu", MenuRoutes);
router.use("/v1/category", CategoryRoutes);
router.use("/v1/product", ProductRoutes);
router.use("/v1/purchase", PurchaseRoutes);
router.use("/v1/location", LocationRoutes);
export default router;
