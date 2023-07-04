import multer from "multer";

import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Storage
import MulterStorage from "../../core/storage/multer_storage";
// Models
import Product from "../models/product_model";
import CategoryModel from "../models/category_model";
import RestaurantModel from "../models/restaurant_model";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import storageFunction from "../../core/storage/multer_storage";
import { IngredientModel } from "api/dtos/ingredients_model";
const upload = multer({ storage: storageFunction("product") });
type imageType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
};
interface images extends imageType {}
const router = Router();

router.post(
  "/create",
  upload.array("images"),
  authorizationMiddleware,
  async (req, res, next) => {
    try {
      const {
        restaurantId,
        menuId,
        categoryId,
        name,
        description,
        ingredients,
        allergens,
        price,
        currency,
      } = req.body;
      const productImages: images[] = req.files as images[];
      if (!restaurantId) throw new Error("Restaurant id is required");
      let imageNames: string[] = [];
      if (productImages && productImages.length > 0) {
        productImages.forEach((image) => {
          imageNames.push(image.originalname);
        });
      }
      console.log("ingretiends:", ingredients);
      var ingredientList: IngredientModel[] = JSON.parse(
        JSON.stringify([ingredients])
      );
      console.log("ingredientList: ", ingredientList);
      const product = await Product.create({
        restaurantId,
        menuId,
        categoryId,
        name,
        description,
        ingredientList,
        allergens,
        price,
        currency,
        images: imageNames,
      });

      res
        .status(200)
        .json(BaseResponse.success(product, ResponseStatus.SUCCESS));
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
