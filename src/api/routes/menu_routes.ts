import { Router, Request, Response } from "express";
import authorizationMiddleware from "../../features/middlewares/authorization_middleware";
import MenuModel from "../models/menu_model";
import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";
import MenuValidator from "../../features/validators/menu_validator";
import BadRequestException from "../../core/exceptions/bad_request_exception";
const router = Router();

router.get("/all", authorizationMiddleware, async (req, res, next) => {
  try {
    const { restaurantId } = req.body;

    const menus = await MenuModel.find({ restaurantId });

    res.status(200).json(BaseResponse.success(menus, ResponseStatus.SUCCESS));
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

export default router;
