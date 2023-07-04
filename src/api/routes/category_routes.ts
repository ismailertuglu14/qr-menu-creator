import multer from "multer";

import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Storage
import MulterStorage from "../../core/storage/multer_storage";
// Models
import CategoryModel from "../models/category_model";
import RestaurantModel from "../models/restaurant_model";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import storageFunction from "../../core/storage/multer_storage";
const router = Router();

const upload = multer({ storage: storageFunction("category") });

router.post(
  "/create",
  upload.single("image"),
  authorizationMiddleware,
  async (req: Request, res: Response, next) => {
    try {
      const { restaurantId, menuId, name } = req.body;
      const restaurant = await RestaurantModel.findOne({ _id: restaurantId });

      if (!restaurant) throw new Error("Restaurant not found");

      const category = await CategoryModel.create({
        restaurantId,
        menuId: menuId,
        name,
        image: req.file.filename,
      });

      // await MenuValidator.validate({
      //   restaurantId,
      //   templateId,
      // }).catch((err) => {
      //   throw new Error(err);
      // });

      res
        .status(200)
        .json(BaseResponse.success(category, ResponseStatus.SUCCESS));
    } catch (error) {
      res
        .status(500)
        .json(
          BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
        );
    }
  }
);

export default router;
