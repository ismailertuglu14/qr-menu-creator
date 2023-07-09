import { ResponseStatus } from "../../core/constants/response_status_enum";
import StorageEnum from "../../core/constants/storage/storage_enum";
import BaseResponse from "../../core/response/base_response";
import { uploadMultipleImage } from "../../core/storage/azure_storage";
import { uploadFileRename } from "../../features/utils/file_helpers";
import { Request, Response, NextFunction } from "express";

// Entities
import ProductModel from "../models/product_model";
import MenuModel from "../models/menu_model";
import CategoryModel from "../models/category_model";
type imageType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
};
interface images extends imageType {}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
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

    const productImages: images[] = req.files as images[];

    if (!restaurantId) throw new Error("Restaurant id is required");

    const [menu, category] = await Promise.all([
      MenuModel.findById(menuId).orFail(new Error("Menu not found")),
      CategoryModel.findById(categoryId).orFail(
        new Error("Category not found")
      ),
    ]);

    let imageNames: string[] = [];

    if (productImages && productImages.length > 0) {
      productImages.forEach((image) => {
        imageNames.push(uploadFileRename(image.originalname));
      });
    }

    var imageUrls = await uploadMultipleImage(
      StorageEnum.PRODUCT_IMAGES,
      imageNames,
      productImages
    );

    var ingredientsList = JSON.parse(ingredients);
    var nutritionList = JSON.parse(nutritions);

    const product = await ProductModel.create({
      restaurantId,
      menuId,
      categoryId,
      name,
      description,
      ingredients: ingredientsList,
      nutritions: nutritionList,
      allergens,
      price,
      currency,
      images: imageUrls,
      isActive,
      createdDate: new Date(),
    });

    res.status(200).json(BaseResponse.success(product, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
}
