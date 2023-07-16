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
import ProductModel from "../entities/product_model";
import RestaurantModel from "../entities/restaurant_model";
import RestaurantCredential from "../entities/restaurant_credential_model";
import UnauthorizedException from "../../core/exceptions/unauthorized_exception";
import NotFoundException from "../../core/exceptions/not_found_exception";
import mongoose from "mongoose";
import BadRequestException from "../../core/exceptions/bad_request_exception";
import { comparePassword } from "../../features/utils/hash_password";

async function getRestaurantInformation(req: Request, res: Response) {
  try {
    const { restaurantId } = req.body;
    const restaurant = await RestaurantModel.findOne(
      {
        _id: restaurantId,
      },
      { role: 0, __v: 0 }
    );

    if (!restaurant) throw new UnauthorizedException("Invalid restaurant id");

    let restaurantDto = {};

    const restaurantCredential = await RestaurantCredential.findOne({
      _id: restaurantId,
    });

    if (restaurant.profileImage != null && restaurant.profileImage != "") {
      restaurant.profileImage = getFileNameWithUrl(
        StorageEnum.RESTAURANT_PROFILE_IMAGE,
        restaurant.profileImage
      );
    } else {
      restaurant.profileImage = null;
    }

    restaurantDto = {
      ...restaurant.toObject(),
      email: restaurantCredential?.email,
      phone: restaurantCredential?.phone,
    };

    res.status(200).json(BaseResponse.success(restaurantDto));
  } catch (error) {
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
async function addOrUpdateSocialMedia(req: Request, res: Response) {
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
async function deleteRestaurant(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { restaurantId, password } = req.body;
    if (!password) throw new BadRequestException("Password is required");
    if (!restaurantId)
      throw new BadRequestException("Restaurant id is required");

    const credential = await RestaurantCredential.findOne({
      _id: restaurantId,
      isActive: true,
    });

    if (!credential) throw new NotFoundException("Restaurant not found");

    if (!(await comparePassword(password, credential.hashedPassword))) {
      throw new UnauthorizedException("Password is incorrect");
    }

    await RestaurantCredential.findOneAndUpdate(
      {
        _id: restaurantId,
        isActive: true,
      },
      { $set: { isActive: false } },
      { session }
    );

    const updateResult = await RestaurantModel.findOneAndUpdate(
      {
        _id: restaurantId,
        isActive: true,
      },
      { $set: { isActive: false } },
      { session }
    );

    if (!updateResult) throw new NotFoundException("Restaurant not found");

    await session.commitTransaction();
    session.endSession();
    res.status(200).json(BaseResponse.success(null, ResponseStatus.SUCCESS));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json(BaseResponse.fail(error.message, error.statusCode));
  }
}
export { getRestaurantInformation, addOrUpdateSocialMedia, deleteRestaurant };
