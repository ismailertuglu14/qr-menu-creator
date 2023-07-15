import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import MenuModel from "../models/menu_model";
import CategoryModel from "../models/category_model";
import ProductModel from "../models/product_model";
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import MenuValidator from "../../features/validators/menu_validator";
import BadRequestException from "../../core/exceptions/bad_request_exception";
import NotFoundException from "../../core/exceptions/not_found_exception";
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

router.post("/create", authorizationMiddleware, async (req, res, next) => {
  const { restaurantId, templateId, name } = req.body;

  try {
    const menu = await MenuModel.create({
      restaurantId,
      templateId,
      name,
    });

    await MenuValidator.validate({
      restaurantId,
      templateId,
    }).catch((err) => {
      throw new BadRequestException(err);
    });

    res.status(200).json(BaseResponse.success(menu, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
});

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