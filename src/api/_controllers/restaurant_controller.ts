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
import ProductModel from "../models/product_model";
import RestaurantModel from "../models/restaurant_model";
import NotFoundException from "../../core/exceptions/not_found_exception";

export async function addOrUpdateSocialMedia(req: Request, res: Response) {
  try {
    const {
      restaurantId,
      facebook,
      twitter,
      instagram,
      website,
      threads,
      whatsapp,
    } = req.body;

    const restaurant = await RestaurantModel.findById(restaurantId, {
      socialMedias: 1,
    });

    if (!restaurant) throw new NotFoundException("Restaurant not found");

    const socialMedias = {
      facebook,
      twitter,
      instagram,
      website,
      threads,
      whatsapp,
    };

    restaurant.socialMedias = {
      facebook: facebook ?? "",
      twitter: twitter ?? "",
      instagram: instagram ?? "",
      website: website ?? "",
      threads: threads ?? "",
      whatsapp: whatsapp ?? "",
    };

    restaurant.save();

    res
      .status(200)
      .json(
        BaseResponse.success(restaurant.socialMedias, ResponseStatus.SUCCESS)
      );
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
