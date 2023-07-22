import { Request, Response } from "express";
import mongoose from "mongoose";

import BaseResponse from "../../core/response/base_response";
import { ResponseStatus } from "../../core/constants/response_status_enum";

import {
  getFileNameWithUrl,
  uploadFileRename,
} from "../../features/utils/file_helpers";

// Entities
import ProductModel from "../product/product_model";
import RestaurantModel from "../restaurant/restaurant_model";
import RestaurantCredential from "../authentication/restaurant_credential_model";
import CategoryModel from "../category/category_model";
import MenuModel from "../menu/menu_model";
import PlanModel from "../plan/plan_model";
import PurchaseModel from "./purchase_model";
// Exceptions
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";
import NotFoundException from "../../core/exceptions/not_found_exception";
import BadRequestException from "../../core/exceptions/bad_request_exception";

const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;
const ONE_YEAR = ONE_MONTH * 12;

async function getLatestPurchases(req: Request, res: Response) {
  try {
    const { restaurantId } = req.body;
    const restaurant = await RestaurantModel.findOne({
      _id: restaurantId,
      isActive: true,
    });

    if (!restaurant) throw new NotFoundException("Restaurant Not Found");

    const purchases = await PurchaseModel.find({ restaurantId }).sort({
      purchaseDate: -1,
    });

    res
      .status(200)
      .json(BaseResponse.success(purchases, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
}
async function purchasePlan(req: Request, res: Response) {
  try {
    const { restaurantId, period } = req.body;
    const { planId } = req.params;

    const purchase = await PurchaseModel.create({
      planId,
      restaurantId,
      purchaseDate: new Date(),
      expirationDate:
        period === "month"
          ? new Date(Date.now() + ONE_MONTH)
          : new Date(Date.now() + ONE_YEAR),
      status: "active",
      paymentMethod: "credit card",
      paymentStatus: "paid",
    });

    if (!purchase) {
      res
        .status(400)
        .json(BaseResponse.fail("Purchase failed", ResponseStatus.BAD_REQUEST));
    }

    await RestaurantModel.findOneAndUpdate(
      { _id: restaurantId },
      { planId: planId }
    );

    res
      .status(200)
      .json(BaseResponse.success(purchase, ResponseStatus.SUCCESS));
  } catch (error) {
    res
      .status(500)
      .json(
        BaseResponse.fail(error.message, ResponseStatus.INTERNAL_SERVER_ERROR)
      );
  }
}

export { getLatestPurchases, purchasePlan };
