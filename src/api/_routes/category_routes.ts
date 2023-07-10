import multer from "multer";

import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Models
import CategoryModel from "../models/category_model";
import RestaurantModel from "../models/restaurant_model";
import ProductModel from "../models/product_model";
// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import NotFoundException from "../../core/exceptions/not_found_exception";

import upload from "../../core/storage/multer_storage";
import { uploadFileRename } from "../../features/utils/file_helpers";
import { uploadImage } from "../../core/storage/azure_storage";
import StorageEnum from "../../core/constants/storage/storage_enum";
import {
  customerGetCategories,
  restaurantGetCategories,
  createCategory,
  deleteCategory,
} from "../../api/_controllers/category_controller";

const router = Router();
router.get("/customer/all", customerGetCategories);
router.get("/restaurant/all", authorizationMiddleware, restaurantGetCategories);

// sonra bakılacak.
router.put(
  "/change-position",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { restaurantId, categoryId, newPosition } = req.body;

      // find the greates position parameter category
      const greatestPositionCategory = await CategoryModel.findOne({
        restaurantId,
      }).sort({ position: -1 });

      // find the category to be changed
      const category = await CategoryModel.findOne({
        _id: categoryId,
        restaurantId,
      });

      await CategoryModel.updateMany(
        {
          restaurantId,
        },
        {
          $set: {
            position: newPosition,
          },
        }
      );
    } catch (error) {
      res.send(500).json(BaseResponse.fail(error.message, error.statusCode));
    }
  }
);
router.post(
  "/create",
  upload.single("image"),
  authorizationMiddleware,

  createCategory
);

router.post("/delete", authorizationMiddleware, deleteCategory);
export default router;
