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

router.get("/customer/all", async (req: Request, res: Response) => {
  try {
    const { menuId } = req.body;
    const categories = await CategoryModel.find(
      {
        menuId,
        isActive: true,
      },
      {
        _id: 1,
        name: 1,
        description: 1,
        image: 1,
      }
    );

    categories.forEach(
      (category: any) =>
        (category.image = `${process.env.APP_URL}/uploads/category/${category.image}`)
    );

    res
      .status(200)
      .json(BaseResponse.success(categories, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
});
router.get(
  "/restaurant/all",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { restaurantId, menuId } = req.body;
      let { isActive } = req.query;
      if (!isActive) isActive = "true";
      var categories = await CategoryModel.find(
        {
          restaurantId,
          menuId,
          isActive,
        },
        {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          isActive: 1,
        }
      );
      categories.forEach(
        (category) =>
          (category.image = `${process.env.APP_URL}/uploads/category/${category.image}`)
      );
      res
        .status(200)
        .json(BaseResponse.success(categories, ResponseStatus.SUCCESS));
    } catch (error) {
      res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
    }
  }
);
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