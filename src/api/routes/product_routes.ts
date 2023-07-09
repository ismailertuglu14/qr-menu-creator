import multer from "multer";

import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";

// Storage
import upload from "../../core/storage/multer_storage";
// Models
import ProductModel from "../models/product_model";
import CategoryModel from "../models/category_model";
import RestaurantModel from "../models/restaurant_model";

// Response
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import storageFunction from "../../core/storage/multer_storage";
import { IngredientModel } from "api/dtos/ingredients_model";
import {
  getFileNameWithUrl,
  uploadFileRename,
} from "../../features/utils/file_helpers";
import {
  uploadImage,
  uploadMultipleImage,
} from "../../core/storage/azure_storage";
import StorageEnum from "../../core/constants/storage/storage_enum";
type imageType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
};
interface images extends imageType {}
const router = Router();
router.get("/:id", (req: Request, res: Response) => {
  try {
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error));
  }
});
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
        ? (product.images = getFileNameWithUrl(
            StorageEnum.PRODUCT_IMAGES,
            product.images[0]
          ))
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
          images: 1,
          price: 1,
          currency: 1,
          isActive: 1,
        }
      );
      products.forEach((product: any) =>
        product.images != null && product.images.length > 0
          ? (product.images = getFileNameWithUrl(
              StorageEnum.PRODUCT_IMAGES,
              product.images[0]
            ))
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
        isActive,
      } = req.body;

      const productImages: images[] = req.files as images[];

      if (!restaurantId) throw new Error("Restaurant id is required");

      let imageNames: string[] = [];

      if (productImages && productImages.length > 0) {
        productImages.forEach((image) => {
          imageNames.push(uploadFileRename(image.originalname));
        });
      }

      await uploadMultipleImage(
        StorageEnum.PRODUCT_IMAGES,
        imageNames,
        productImages
      );

      var ingredientList: IngredientModel[] = JSON.parse(
        JSON.stringify([ingredients])
      );

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
        isActive,
        createdDate: new Date(),
      });
      product.images = imageNames.map((imageUrl) => {
        return getFileNameWithUrl(StorageEnum.PRODUCT_IMAGES, imageUrl);
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

router.post(
  "/delete",
  authorizationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { restaurantId, productId } = req.body;

      const product = await ProductModel.findOne({
        _id: productId,
        restaurantId,
      });
      if (!product) throw new Error("Product not found");
      product.isActive = false;

      await product.save();

      res.status(200).json(BaseResponse.success(null, ResponseStatus.SUCCESS));
    } catch (error) {
      res
        .status(500)
        .send(
          BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
        );
    }
  }
);

export default router;
