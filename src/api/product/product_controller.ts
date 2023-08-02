import { ResponseStatus } from "../../core/constants/response_status_enum";
import StorageEnum from "../../core/constants/storage/storage_enum";
import BaseResponse from "../../core/response/base_response";
import {
  deleteMultipleImage,
  uploadMultipleImage,
} from "../../core/storage/azure_storage";
import {
  getFileNameWithUrl,
  uploadFileRename,
} from "../../features/utils/file_helpers";
import { Request, Response, NextFunction } from "express";

// Entities
import ProductModel from "./product_model";
import MenuModel from "../menu/menu_model";
import CategoryModel from "../category/models/category_model";
import NotFoundException from "../../core/exceptions/not_found_exception";
import { AllergenModel, defaultAllergenTypes } from "./models/allergen_model";
import { get } from "axios";

async function customerGetProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product = await ProductModel.findOne(
      { _id: id, isActive: true },
      { __v: 0, isActive: 0 }
    ).orFail(new NotFoundException("Product not found"));

    product.images = product.images.map((image: any) =>
      getFileNameWithUrl(StorageEnum.PRODUCT_IMAGES, image)
    );
    res.status(200).json(BaseResponse.success(product));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function restaurantGetProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const product = await ProductModel.findOne({ _id: id }, { __v: 0 }).orFail(
      new NotFoundException("Product not found")
    );
    product.images = product.images.map((image: any) =>
      getFileNameWithUrl(StorageEnum.PRODUCT_IMAGES, image)
    );
    res.status(200).json(BaseResponse.success(product));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}

async function customerGetProducts(req: Request, res: Response) {
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
        createdDate: 1,
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
    let dtos: Array<Object> = [];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    products.forEach((product: any) => {
      dtos.push({
        id: product._id,
        name: product.name,
        description: product.description,
        image: product.images,
        price: product.price,
        currency: product.currency,
        isNew: product.createdDate > sevenDaysAgo,
      });
    });
    res.status(200).json(BaseResponse.success(dtos, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function restaurantGetProducts(req: Request, res: Response) {
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
        createdDate: 1,
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

    let dtos: Array<Object> = [];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    products.forEach((product: any) => {
      dtos.push({
        id: product._id,
        name: product.name,
        description: product.description,
        image: product.images,
        price: product.price,
        currency: product.currency,
        isNew: product.createdDate > sevenDaysAgo,
      });
    });
    res.status(200).json(BaseResponse.success(dtos, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      restaurantId,
      menuId,
      categoryId,
      name,
      description,
      //ingredients,
      allergens,
      nutritions,
      price,
      currency,
      isActive,
    } = req.body;

    const productImages: images[] = req.files as images[];

    if (!restaurantId) throw new Error("Restaurant id is required");

    const [menu, category] = await Promise.all([
      MenuModel.findOne({ _id: menuId, isActive: true }).orFail(
        new Error("Menu not found")
      ),
      CategoryModel.findOne({ _id: categoryId, isActive: true }).orFail(
        new Error("Category not found")
      ),
    ]);

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

    //var ingredientsList = JSON.parse(ingredients);
    var nutritionList = JSON.parse(nutritions);
    var allergensList: AllergenModel[] = JSON.parse(allergens);

    allergensList = defaultAllergenTypes.map((allergen) => {
      var allergenItem = allergensList.find(
        (item) => item.name === allergen.name
      );
      if (allergenItem) {
        return allergenItem;
      } else {
        return allergen;
      }
    });

    const product = await ProductModel.create({
      restaurantId,
      menuId,
      categoryId,
      name,
      description,
      // ingredients: ingredientsList,
      nutritions: nutritionList,
      allergens: allergensList,
      price,
      currency,
      images: imageNames,
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
async function updateProduct(req: Request, res: Response) {
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

    const productId = req.params.id;
    if (!restaurantId) throw new Error("Restaurant id is required");
    const product = await ProductModel.findById(productId);

    if (!product) throw new NotFoundException("Product not found");

    const productImages: images[] = req.files as images[];

    if (productImages && productImages.length > 0) {
      var imageNames: string[] = [];
      productImages.forEach((image) => {
        imageNames.push(uploadFileRename(image.originalname));
      });

      await deleteMultipleImage(StorageEnum.PRODUCT_IMAGES, imageNames);
      await uploadMultipleImage(
        StorageEnum.PRODUCT_IMAGES,
        imageNames,
        productImages
      );
    }
    var ingredientsList = ingredients && JSON.parse(ingredients);
    var nutritionList = nutritions && JSON.parse(nutritions);

    var updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: productId },
      {
        $set: {
          name,
          description,
          menuId,
          categoryId,
          ingredients: ingredientsList,
          nutritions: nutritionList,
          allergens,
          price,
          images: imageNames,
          currency,
          isActive,
          updatedDate: new Date(),
        },
      },
      { new: true }
    );
    let imageUrls: any[] = [];
    updatedProduct.images !== null && updatedProduct.images.length > 0
      ? updatedProduct.images.forEach((image: any) => {
          imageUrls.push(getFileNameWithUrl(StorageEnum.PRODUCT_IMAGES, image));
        })
      : null;
    updatedProduct.images = imageUrls;
    res
      .status(200)
      .json(BaseResponse.success(updatedProduct, ResponseStatus.SUCCESS));
  } catch (error) {
    console.log(error);
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function deleteProduct(req: Request, res: Response) {
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

type imageType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
};
interface images extends imageType {}

export {
  customerGetProductById,
  restaurantGetProductById,
  customerGetProducts,
  restaurantGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
