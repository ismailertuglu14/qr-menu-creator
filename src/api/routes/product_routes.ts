import multer from "multer";

import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Storage
import MulterStorage from "../../core/storage/multer_storage";
// Models
import ProductModel from "../models/product_model";
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

router.get("/customer/all", async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.body;
    const products = await ProductModel.find(
      {
        categoryId,
        isActive: true,
      },
      {
        _id: 1,
        name: 1,
        description: 1,
        images: 1,
        price: 1,
        currency: 1,
      }
    );

    products.forEach((product: any) =>
      product.images != null && product.images.length > 0
        ? (product.images = `${process.env.APP_URL}/uploads/product/${product.images[0]}`)
        : null
    );

    res
      .status(200)
      .json(BaseResponse.success(products, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
});

router.get(
  "/restaurant/all",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.body;
      let { isActive } = req.query;
      if (!isActive) isActive = "true";
      const products = await ProductModel.find(
        {
          categoryId,
          isActive: isActive,
        },
        {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
          currency: 1,
          isActive: 1,
        }
      );

      products.forEach((product: any) =>
        product.images != null && product.images.length > 0
          ? (product.images = `${process.env.APP_URL}/uploads/product/${product.images[0]}`)
          : null
      );

      res
        .status(200)
        .json(BaseResponse.success(products, ResponseStatus.SUCCESS));
    } catch (error) {
      res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
    }
  }
);

router.put("/update", async (req: Request, res: Response) => {
  // await ProductModel.updateMany({}, { $set: { isActive: true } });
  // res.status(200).json(BaseResponse.success({}, ResponseStatus.SUCCESS));
});

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
      const product = await ProductModel.create({
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
