import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Models
import CategoryModel from "./category_model";
// Response
import BaseResponse from "../../core/response/base_response";

import upload from "../../core/storage/multer_storage";
import {
  customerGetCategories,
  restaurantGetCategories,
  createCategory,
  deleteCategory,
  relocateCategory,
  changePosition,
} from "./category_controller";

const router = Router();
router.put("/relocate", authorizationMiddleware, relocateCategory);
router.get("/customer/all", customerGetCategories);
router.get("/restaurant/all", authorizationMiddleware, restaurantGetCategories);
router.put("/change-position", authorizationMiddleware, changePosition);
router.post(
  "/create",
  upload.single("image"),
  authorizationMiddleware,
  createCategory
);

router.post("/delete", authorizationMiddleware, deleteCategory);
export default router;
