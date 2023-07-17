import { Request, Response } from "express";
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import NotFoundException from "../../core/exceptions/not_found_exception";

// Entities
import CategoryModel from "./category_model";
import RestaurantModel from "../restaurant/restaurant_model";
import ProductModel from "../product/product_model";

// Storage
import upload from "../../core/storage/multer_storage";
import {
  getFileNameWithUrl,
  uploadFileRename,
} from "../../features/utils/file_helpers";
import StorageEnum from "../../core/constants/storage/storage_enum";
import { uploadImage } from "../../core/storage/azure_storage";

async function relocateCategory(req: Request, res: Response) {
  try {
    const { restaurantId, categoryId, newPosition } = req.body;

    const category = await CategoryModel.findOne({
      _id: categoryId,
    });

    if (!category) throw new NotFoundException("Category not found");

    //Between newPosition and oldPosition
    const categories = await CategoryModel.find({
      restaurantId,
      position: {
        $gte: newPosition,
        $lt: category.position,
      },
    });

    await CategoryModel.updateOne(
      {
        _id: categoryId,
      },
      {
        position: newPosition,
      }
    );
    categories.forEach(async (category) => {
      await CategoryModel.updateOne(
        {
          _id: category._id,
        },
        {
          position: category.position + 1,
        }
      );
    });

    res.status(200).json(BaseResponse.success(ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}

async function customerGetCategories(req: Request, res: Response) {
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
        position: 1,
      }
    );
    categories.forEach(
      (category: any) =>
        category.image !== null &&
        category.image !== undefined &&
        (category.image = getFileNameWithUrl(
          StorageEnum.CATEGORY_IMAGES,
          category.image
        ))
    );
    categories.sort((a, b) => a.position - b.position);
    const categoryIds = categories.map((category) => category._id);

    const productCounts = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const count = await ProductModel.countDocuments({
          categoryId,
          isActive: true,
        });
        return { categoryId, count };
      })
    );
    let dtos: Object[] = [];

    categories.forEach((category) => {
      const productCount = productCounts.find(
        (productCount) => productCount.categoryId === category._id
      );
      dtos.push({
        _id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        productCount: productCount?.count,
        position: category.position,
      });
    });

    res.status(200).json(BaseResponse.success(dtos, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}

async function restaurantGetCategories(req: Request, res: Response) {
  try {
    const { restaurantId, menuId } = req.body;
    let { isActive } = req.query;

    var categories: Array<any> = [];

    if (isActive === undefined) {
      categories = await CategoryModel.find(
        {
          restaurantId,
          menuId,
        },
        {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          isActive: 1,
          position: 1,
        }
      );
    } else {
      categories = await CategoryModel.find(
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
          position: 1,
        }
      );
    }
    categories.sort((a, b) => a.position - b.position);
    categories.forEach(
      (category: any) =>
        category.image !== null &&
        category.image !== undefined &&
        (category.image = getFileNameWithUrl(
          StorageEnum.CATEGORY_IMAGES,
          category.image
        ))
    );
    const categoryIds = categories.map((category) => category._id);

    const productCounts = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const count = await ProductModel.countDocuments({
          categoryId,
          isActive: true,
        });
        return { categoryId, count };
      })
    );
    let dtos: Object[] = [];

    categories.forEach((category) => {
      const productCount = productCounts.find(
        (productCount) => productCount.categoryId === category._id
      );
      dtos.push({
        _id: category._id,
        name: category.name,
        description: category.description,
        image: category.image,
        productCount: productCount?.count,
        isActive: category.isActive,
        position: category.position,
      });
    });

    res.status(200).json(BaseResponse.success(dtos, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function createCategory(req: Request, res: Response) {
  try {
    const { restaurantId, menuId, name } = req.body;
    const restaurant = await RestaurantModel.findOne({ _id: restaurantId });

    if (!restaurant) throw new Error("Restaurant not found");

    let imageName: string | null;
    let uploadedImagePath: string | null;

    if (req.file !== undefined) {
      imageName = uploadFileRename(req.file.originalname);
      uploadedImagePath = await uploadImage(
        StorageEnum.CATEGORY_IMAGES,
        imageName,
        req.file
      );
    }
    const maxPositionCategory = await CategoryModel.findOne({
      restaurantId,
    }).sort({ position: -1 });

    const category = await CategoryModel.create({
      restaurantId,
      menuId: menuId,
      name,
      image: imageName,
      position:
        maxPositionCategory != null ? maxPositionCategory?.position + 1 : 0,
    });

    category.image = uploadedImagePath;

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
async function deleteCategory(req: Request, res: Response) {
  try {
    const { restaurantId, categoryId } = req.body;

    const restaurant = await RestaurantModel.findOne({ _id: restaurantId });

    if (!restaurant) throw new NotFoundException("Restaurant not found");

    const category = await CategoryModel.findOne({ _id: categoryId });

    if (!category) throw new NotFoundException("Category not found");

    category.isActive = false;

    await category.save();

    await ProductModel.updateMany({ categoryId }, { isActive: false });

    res.status(200).json(BaseResponse.success(null, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}

export {
  relocateCategory,
  customerGetCategories,
  restaurantGetCategories,
  createCategory,
  deleteCategory,
};
