import multer from "multer";

import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Storage
import upload from "../../core/storage/multer_storage";
// Models
import ProductModel from "./product_model";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import { getFileNameWithUrl } from "../../features/utils/file_helpers";

import {
  customerGetProducts,
  restaurantGetProducts,
  createProduct,
  deleteProduct,
  customerGetProductById,
  restaurantGetProductById,
  updateProduct,
} from "./product_controller";

import StorageEnum from "../../core/constants/storage/storage_enum";
import { NutritionModel } from "../dtos/product/nutritions_model";

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

export default router;
