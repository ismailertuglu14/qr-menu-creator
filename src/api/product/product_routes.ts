import { Router } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Storage
import upload from "../../core/storage/multer_storage";

import {
  customerGetProducts,
  restaurantGetProducts,
  createProduct,
  deleteProduct,
  customerGetProductById,
  restaurantGetProductById,
  updateProduct,
} from "./product_controller";

const router = Router();
router.get("/detail/:id", customerGetProductById);
router.get(
  "/restaurant/detail/:id",
  authorizationMiddleware,
  restaurantGetProductById
);

router.get("/customer/all", customerGetProducts);

router.get("/restaurant/all", authorizationMiddleware, restaurantGetProducts);

router.put(
  "/update/:id",
  upload.array("images"),
  authorizationMiddleware,
  updateProduct
);

router.post(
  "/create",
  upload.array("images"),
  authorizationMiddleware,
  createProduct
);

router.post("/delete", authorizationMiddleware, deleteProduct);

router.post("/relocate", authorizationMiddleware);
export default router;
