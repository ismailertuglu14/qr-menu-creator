import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import MenuModel from "./menu_model";
import CategoryModel from "../category/category_model";
import ProductModel from "../product/product_model";
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import MenuValidator from "../../features/validators/menu_validator";
import BadRequestException from "../../core/exceptions/bad_request_exception";
import NotFoundException from "../../core/exceptions/not_found_exception";
import upload from "../../core/storage/multer_storage";
import {
  getFileNameWithUrl,
  uploadFileRename,
} from "../../features/utils/file_helpers";
import { uploadImage } from "../../core/storage/azure_storage";
import StorageEnum from "../../core/constants/storage/storage_enum";

const router = Router();

router.get("/all", authorizationMiddleware, async (req, res, next) => {
  try {
    const { restaurantId } = req.body;
    let { isActive } = req.query;

    if (!isActive) isActive = "true";
    console.log(isActive);
    const menus = await MenuModel.find(
      { restaurantId, isActive: isActive },
      {
        name: 1,
        templateId: 1,
        restaurantId: 1,
        coverImage: 1,
      }
    );
    const menuIds = menus.map((menu) => menu._id);

    const productCounts = await Promise.all(
      menuIds.map(async (menuId) => {
        const count = await ProductModel.countDocuments({
          menuId,
          isActive: isActive,
        });
        return { menuId, count };
      })
    );
    const categoryCounts = await Promise.all(
      menuIds.map(async (menuId) => {
        const count = await CategoryModel.countDocuments({
          menuId,
          isActive: isActive,
        });
        return { menuId, count };
      })
    );

    let dtos: Object[] = [];
    menus.forEach((menu) => {
      const productCount = productCounts.find(
        (productCount) => productCount.menuId === menu._id
      );
      const categoryCount = categoryCounts.find(
        (categoryCount) => categoryCount.menuId === menu._id
      );
      dtos.push({
        _id: menu._id,
        name: menu.name,
        templateId: menu.templateId,
        restaurantId: menu.restaurantId,
        productCount: productCount?.count,
        categoryCount: categoryCount.count,
        coverImage:
          menu.coverImage != null
            ? getFileNameWithUrl(StorageEnum.MENU_COVER_IMAGES, menu.coverImage)
            : null,
      });
    });

    res.status(200).json(BaseResponse.success(dtos, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
});

router.post(
  "/create",
  upload.single("image"),
  authorizationMiddleware,
  async (req, res, next) => {
    const { restaurantId, templateId, name } = req.body;

    let imageName = undefined;
    let imageUrl = undefined;
    if (req.file) {
      imageName = uploadFileRename(req.file.originalname);
      await uploadImage(StorageEnum.MENU_COVER_IMAGES, imageName, req.file);
      imageUrl = `${process.env.AZURE_STORAGE_URL}/${StorageEnum.MENU_COVER_IMAGES}/${imageName}`;
    }
    try {
      const menu = await MenuModel.create({
        restaurantId,
        templateId,
        name,
        coverImage: imageName,
      });

      await MenuValidator.validate({
        restaurantId,
        templateId,
      }).catch((err) => {
        throw new BadRequestException(err);
      });

      const dto = {
        _id: menu._id,
        name: menu.name,
        templateId: menu.templateId,
        restaurantId: menu.restaurantId,
        coverImage: imageUrl,
      };
      res.status(200).json(BaseResponse.success(dto, ResponseStatus.SUCCESS));
    } catch (error) {
      res
        .status(500)
        .json(
          BaseResponse.fail("asdasdas", ResponseStatus.INTERNAL_SERVER_ERROR)
        );
    }
  }
);

router.post("/delete", authorizationMiddleware, async (req, res, next) => {
  try {
    const { restaurantId, menuId } = req.body;

    const menu = await MenuModel.findOne({ _id: menuId, restaurantId });

    if (!menu) throw new NotFoundException("Menu not found");

    menu.isActive = false;
    await menu.save();

    await CategoryModel.updateMany({ menuId }, { isActive: false });
    await ProductModel.updateMany({ menuId }, { isActive: false });

    res.status(200).json(BaseResponse.success(null, ResponseStatus.SUCCESS));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
});
export default router;
