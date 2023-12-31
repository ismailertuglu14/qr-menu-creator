import { Router } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

import upload from "../../core/storage/multer_storage";
import {
  createMenu,
  deleteMenu,
  getAll,
  getMenuBySlug,
  publishMenu,
} from "./menu_controller";

const router = Router();

// Get menu by slug on client side
router.get("/get/:slug", getMenuBySlug);

// List all menus of a restaurant
router.get("/all", authorizationMiddleware, getAll);

router.post(
  "/create",
  upload.single("image"),
  authorizationMiddleware,
  createMenu
);

router.post("/delete", authorizationMiddleware, deleteMenu);
router.post("/relocate/:menuId", authorizationMiddleware);
router.post("/publish/:menuId", authorizationMiddleware, publishMenu);
export default router;
