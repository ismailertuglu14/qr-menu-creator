import multer from "multer";

import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Storage
import upload from "../../core/storage/multer_storage";
// Models
import ProductModel from "../models/product_model";

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
} from "../_controllers/product_controller";

import StorageEnum from "../../core/constants/storage/storage_enum";
import { NutritionModel } from "../dtos/product/nutritions_model";

const router = Router();
router.get("/:id", customerGetProductById);
router.get(
  "/restaurant/:id",
  authorizationMiddleware,
  restaurantGetProductById
);

router.get("/customer/all", customerGetProducts);

router.get("/restaurant/all", authorizationMiddleware, restaurantGetProducts);

router.put(
  "/update/:id",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const {
        restaurantId,
        menuId,
        categoryId,
        name,
        description,
        ingredients,
        allergens,
        nutritions,
        price,
        currency,
        isActive,
      } = req.body;

      const id = req.params.id;

      res.status(200).json(BaseResponse.success(null));
    } catch (error) {
      res.status(500).json(BaseResponse.fail(error));
    }
  }
);

router.post(
  "/create",
  upload.array("images"),
  authorizationMiddleware,
  createProduct
);

router.post("/delete", authorizationMiddleware, deleteProduct);

export default router;
